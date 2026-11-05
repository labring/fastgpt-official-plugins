import { defineSecretSchema } from "@fastgpt-plugin/sdk-factory";
import z from "zod";

export const secretSchema = defineSecretSchema({
  endpoint: {
    type: z
      .string()
      .trim()
      .url()
      .refine((value) => {
        const url = new URL(value);
        return (
          ["http:", "https:"].includes(url.protocol) &&
          !url.username &&
          !url.password
        );
      }, "Use an HTTP(S) URL without embedded credentials"),
    title: { en: "Legacy censor URL", "zh-CN": "旧版自定义审核 URL" },
    description: {
      en: "Operator-controlled endpoint accepting POST {text} and returning {success: boolean}. Must be reachable from the Plugin Server.",
      "zh-CN":
        "管理员配置的旧审核地址，接收 POST {text}，返回 {success: boolean}。须从 Plugin Server 网络可达。",
    },
    isSecret: false,
  },
  timeoutMs: {
    type: z.number().int().min(100).max(60000).default(10000),
    title: { en: "Request timeout (ms)", "zh-CN": "请求超时（毫秒）" },
    description: {
      en: "100–60000 ms; defaults to 10000. Failures are handled by the host moderation policy.",
      "zh-CN":
        "范围 100–60000，默认 10000。异常放行或拦截由 FastGPT 审核策略控制。",
    },
    isSecret: false,
  },
});

const legacyResponseSchema = z.object({ success: z.boolean() });
const MAX_RESPONSE_BYTES = 64 * 1024;

/** Adapt the legacy HTTP contract without forwarding host metadata or trusting upstream messages. */
export function createLegacyModerator(
  fetchImpl: typeof fetch = globalThis.fetch,
) {
  return async (content: string, configuration: unknown) => {
    const parsed = secretSchema.safeParse(configuration);
    if (!parsed.success) {
      return {
        verdict: "error" as const,
        hits: [],
        errorMessage: "Invalid legacy censor configuration",
      };
    }
    try {
      const response = await fetchImpl(parsed.data.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
        signal: AbortSignal.timeout(parsed.data.timeoutMs),
        redirect: "error",
      });
      if (!response.ok) {
        await response.body?.cancel();
        return {
          verdict: "error" as const,
          hits: [],
          errorMessage: `Legacy censor returned HTTP ${response.status}`,
        };
      }

      // Bound memory consumption even when Content-Length is missing or untrustworthy.
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Empty response");
      const decoder = new TextDecoder();
      let text = "";
      let bytes = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new Error("Response too large");
          }
          text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
      } finally {
        reader.releaseLock();
      }
      const result = legacyResponseSchema.safeParse(JSON.parse(text));
      if (!result.success) {
        return {
          verdict: "error" as const,
          hits: [],
          errorMessage:
            "Invalid legacy censor response: expected a boolean success field",
        };
      }
      // The legacy message is deliberately ignored; it is neither a hit nor a service error.
      return {
        verdict: result.data.success ? ("pass" as const) : ("block" as const),
        hits: [],
      };
    } catch {
      // Never echo URLs, submitted text, upstream response bodies or transport errors.
      return {
        verdict: "error" as const,
        hits: [],
        errorMessage:
          "Legacy censor request failed, timed out, or returned invalid JSON",
      };
    }
  };
}
