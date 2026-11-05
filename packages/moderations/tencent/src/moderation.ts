import { tms } from "tencentcloud-sdk-nodejs-tms";
import z from "zod";

export const secretSchema = z.object({
  secretId: z
    .string()
    .trim()
    .min(1)
    .meta({ title: "SecretId", isSecret: true }),
  secretKey: z
    .string()
    .trim()
    .min(1)
    .meta({ title: "SecretKey", isSecret: true }),
  region: z.string().trim().min(1).default("ap-guangzhou").meta({
    title: "地域 (Region)",
    description: "腾讯云 TMS 接入地域，例如 ap-guangzhou",
    isSecret: false,
  }),
  bizType: z.string().trim().optional().meta({
    title: "审核策略 (BizType)",
    description: "腾讯云内容安全控制台配置的策略编号，留空使用腾讯云默认策略",
    isSecret: false,
  }),
});

const inputSchema = z.object({
  content: z.string().min(1),
  dataId: z.string().optional(),
  userId: z.string().optional(),
  userIp: z.string().optional(),
  sessionId: z.string().optional(),
});

const detailSchema = z.object({
  Label: z.string().optional(),
  SubLabel: z.string().nullish(),
  Score: z.number().min(0).max(100).nullish(),
  Keywords: z.array(z.string()).nullish(),
  Tags: z
    .array(
      z.object({
        Keyword: z.string().nullish(),
        SubLabel: z.string().nullish(),
        Score: z.number().min(0).max(100).nullish(),
      }),
    )
    .nullish(),
});
const responseSchema = detailSchema.extend({
  Suggestion: z.enum(["Pass", "Review", "Block"]),
  DetailResults: z.array(detailSchema).nullish(),
  RequestId: z.string().optional(),
});

const labels = {
  Porn: "porn",
  Sexy: "porn",
  Polity: "politics",
  Illegal: "contraband",
  Contraband: "contraband",
  Terror: "terror",
  Abuse: "abuse",
  Ad: "ad",
  Privacy: "privacy",
  Spam: "flood",
  Flood: "flood",
  Violence: "violence",
} as const;

type Label = (typeof labels)[keyof typeof labels] | "other";
type Hit = {
  label: Label;
  providerLabel: string;
  subLabel?: string;
  score?: number;
  keywords?: string[];
};

/** Normalize every reported risk without deriving a verdict from scores or losing custom labels. */
export function mapResponse(value: unknown) {
  const response = responseSchema.parse(value);
  const hits: Hit[] = [];
  const details = response.DetailResults?.length
    ? response.DetailResults
    : [response];
  for (const detail of details) {
    if (detail.Label === "Normal") continue;
    if (!detail.Label) {
      if (response.Suggestion !== "Pass") throw new Error("Missing risk label");
      continue;
    }
    const label: Label = Object.hasOwn(labels, detail.Label)
      ? labels[detail.Label as keyof typeof labels]
      : "other";
    const tags = detail.Tags ?? [];
    const keywords = [
      ...new Set([
        ...(detail.Keywords ?? []),
        ...tags.flatMap((tag) => (tag.Keyword ? [tag.Keyword] : [])),
      ]),
    ];
    hits.push({
      label,
      providerLabel: detail.Label,
      ...(detail.SubLabel ? { subLabel: detail.SubLabel } : {}),
      ...(detail.Score !== null && detail.Score !== undefined
        ? { score: detail.Score }
        : {}),
      keywords,
    });
    // Tag scores belong to their own sublabels, not to the parent category.
    for (const tag of tags) {
      if (!tag.SubLabel) continue;
      hits.push({
        label,
        providerLabel: detail.Label,
        subLabel: tag.SubLabel,
        ...(tag.Score !== null && tag.Score !== undefined
          ? { score: tag.Score }
          : {}),
        keywords: tag.Keyword ? [tag.Keyword] : [],
      });
    }
  }
  return {
    verdict: { Pass: "pass", Review: "suspected", Block: "block" }[
      response.Suggestion
    ] as "pass" | "suspected" | "block",
    hits,
    ...(response.RequestId ? { requestId: response.RequestId } : {}),
  };
}

/** Call synchronous TMS with the official SDK (TC3 signing); upstream failures never escape as plugin defects. */
export async function checkText(
  input: z.infer<typeof inputSchema>,
  secrets: z.infer<typeof secretSchema>,
) {
  try {
    const client = new tms.v20201229.Client({
      credential: { secretId: secrets.secretId, secretKey: secrets.secretKey },
      region: secrets.region,
      profile: {
        httpProfile: { endpoint: "tms.tencentcloudapi.com", reqTimeout: 15 },
      },
    });
    const response = await client.TextModeration({
      Content: Buffer.from(input.content, "utf8").toString("base64"),
      ...(secrets.bizType ? { BizType: secrets.bizType } : {}),
      ...(input.dataId ? { DataId: input.dataId } : {}),
      ...(input.sessionId ? { SessionId: input.sessionId } : {}),
      ...(input.userId
        ? { User: { UserId: input.userId, AccountType: 7 } }
        : {}),
      ...(input.userIp ? { Device: { IP: input.userIp } } : {}),
    });
    return mapResponse(response);
  } catch {
    // SDK errors may contain credentials, signatures or original content; never echo them.
    return {
      verdict: "error" as const,
      hits: [],
      errorMessage:
        "Tencent Cloud TMS request failed or returned an invalid response. Check credentials, region and BizType, then retry.",
    };
  }
}
