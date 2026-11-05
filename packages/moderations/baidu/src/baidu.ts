import type { ModerationProviderResultType } from "@fastgpt-plugin/sdk-factory";
import z from "zod";

const HitSchema = z.object({
  words: z.array(z.string()).optional(),
  probability: z
    .union([
      z.number(),
      z
        .string()
        .regex(/^\d+(\.\d+)?$/)
        .transform(Number),
    ])
    .pipe(z.number().min(0).max(1))
    .optional(),
  wordHitPositions: z.array(z.object({ keyword: z.string() })).optional(),
});
const ResponseSchema = z.object({
  error_code: z.number().optional(),
  log_id: z.union([z.string(), z.number()]).optional(),
  conclusionType: z.number().optional(),
  data: z
    .array(
      z.object({
        type: z.number(),
        error_code: z.number().optional(),
        subType: z.number().optional(),
        msg: z.string().optional(),
        hits: z.array(HitSchema).optional(),
      }),
    )
    .optional(),
});
const TokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
});

export const secretSchema = z.object({
  apiKey: z.string().trim().min(1).meta({ title: "API Key", isSecret: true }),
  secretKey: z
    .string()
    .trim()
    .min(1)
    .meta({ title: "Secret Key", isSecret: true }),
  strategyId: z.number().int().positive().optional().meta({
    title: "策略 ID (Strategy ID)",
    description: "可选，在百度内容审核控制台配置审核策略；不填使用默认策略",
    isSecret: false,
  }),
});
type Settings = z.infer<typeof secretSchema>;
type Result = ModerationProviderResultType;
type Verdict = Result["verdict"];
type Hit = Result["hits"][number];
type Label = Hit["label"];

/** Split on Unicode code points to respect Baidu's 20,000 UTF-8 byte limit. */
export function splitText(content: string): string[] {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let chunk = "";
  let bytes = 0;
  for (const char of content) {
    const size = encoder.encode(char).length;
    if (bytes + size > 20_000) {
      chunks.push(chunk);
      chunk = "";
      bytes = 0;
    }
    chunk += char;
    bytes += size;
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

/** Preserve provider labels and all hit groups; only known categories are normalized. */
function mapResponse(response: z.infer<typeof ResponseSchema>): Result {
  const requestId =
    response.log_id === undefined ? {} : { requestId: String(response.log_id) };
  if (response.error_code !== undefined) {
    return {
      verdict: "error",
      hits: [],
      ...requestId,
      errorMessage: `Baidu API error (${response.error_code})`,
    };
  }
  const verdicts: Record<number, Verdict> = {
    1: "pass",
    2: "block",
    3: "suspected",
    4: "error",
  };
  const verdict = response.data?.some((item) => item.error_code !== undefined)
    ? "error"
    : (verdicts[response.conclusionType ?? 0] ?? "error");
  const labels: Record<number, Label> = {
    30: "politics",
    31: "terror",
    32: "contraband",
    33: "porn",
    34: "abuse",
    36: "ad",
    37: "advertising-law",
    38: "privacy",
    39: "flood",
  };
  const legacyLabels: Record<number, Label> = {
    0: "flood",
    1: "terror",
    2: "porn",
    3: "politics",
    4: "ad",
    5: "abuse",
    7: "privacy",
    8: "advertising-law",
  };
  const hits: Hit[] = [];
  for (const item of response.data ?? []) {
    const base = {
      label:
        item.type === 12
          ? (legacyLabels[item.subType ?? -1] ?? "other")
          : (labels[item.type] ?? "other"),
      providerLabel: String(item.type),
      ...(item.subType === undefined ? {} : { subLabel: String(item.subType) }),
    };
    if (!item.hits?.length) hits.push(base);
    for (const hit of item.hits ?? []) {
      hits.push({
        ...base,
        keywords: [
          ...new Set([
            ...(hit.words ?? []),
            ...(hit.wordHitPositions ?? []).map((position) => position.keyword),
          ]),
        ],
        ...(hit.probability === undefined
          ? {}
          : { score: hit.probability * 100 }),
      });
    }
  }
  return {
    verdict,
    hits,
    ...requestId,
    ...(verdict === "error"
      ? { errorMessage: "Baidu could not determine a moderation verdict" }
      : {}),
  };
}

/** Create a provider with bounded per-credential token caching and a single auth retry. */
export function createBaiduModerator() {
  let cached:
    | { apiKey: string; secretKey: string; token: string; expiresAt: number }
    | undefined;
  let pending:
    | { apiKey: string; secretKey: string; promise: Promise<string> }
    | undefined;

  const request = async (url: string, body: URLSearchParams) => {
    const response = await fetch(url, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(15_000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  const getToken = async (settings: Settings) => {
    const same = (entry: { apiKey: string; secretKey: string }) =>
      entry.apiKey === settings.apiKey &&
      entry.secretKey === settings.secretKey;
    if (cached && same(cached) && cached.expiresAt > Date.now())
      return cached.token;
    if (pending && same(pending)) return pending.promise;
    const promise = (async () => {
      const raw = await request(
        "https://aip.baidubce.com/oauth/2.0/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: settings.apiKey,
          client_secret: settings.secretKey,
        }),
      );
      const token = TokenSchema.parse(raw);
      cached = {
        ...settings,
        token: token.access_token,
        expiresAt: Date.now() + Math.max(0, token.expires_in - 60) * 1000,
      };
      return token.access_token;
    })();
    const entry = { ...settings, promise };
    pending = entry;
    try {
      return await promise;
    } finally {
      if (pending === entry) pending = undefined;
    }
  };

  return async (content: string, settings: Settings): Promise<Result> => {
    // An incomplete check must never be represented as a successful safety verdict.
    if (!content.trim()) return { verdict: "pass", hits: [] };
    let result: Result = { verdict: "pass", hits: [] };
    const rank: Record<Verdict, number> = {
      pass: 0,
      suspected: 1,
      block: 2,
      error: 3,
    };
    try {
      for (const chunk of splitText(content)) {
        let token = await getToken(settings);
        const send = async () =>
          ResponseSchema.parse(
            await request(
              `https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=${encodeURIComponent(token)}`,
              new URLSearchParams({
                text: chunk,
                ...(settings.strategyId === undefined
                  ? {}
                  : { strategyId: String(settings.strategyId) }),
              }),
            ),
          );
        let response = await send();
        if (response.error_code === 110 || response.error_code === 111) {
          if (cached?.token === token) cached = undefined;
          token = await getToken(settings);
          response = await send();
        }
        const next = mapResponse(response);
        result = {
          ...result,
          ...next,
          verdict:
            rank[next.verdict] > rank[result.verdict]
              ? next.verdict
              : result.verdict,
          hits: [...result.hits, ...next.hits],
        };
        if (next.verdict === "error") return result;
      }
      return result;
    } catch {
      // Do not expose request URLs, credentials, or upstream content in error messages.
      return {
        ...result,
        verdict: "error",
        errorMessage:
          "Baidu moderation request failed or returned an invalid response",
      };
    }
  };
}
