import GreenClient, {
  TextModerationPlusRequest,
} from "@alicloud/green20220302";
import { $OpenApiUtil } from "@alicloud/openapi-core";
import { RuntimeOptions } from "@darabonba/typescript";
import z from "zod";

export const secretSchema = z.object({
  accessKeyId: z
    .string()
    .trim()
    .min(1)
    .meta({ title: "AccessKey ID", isSecret: true }),
  accessKeySecret: z
    .string()
    .min(1)
    .meta({ title: "AccessKey Secret", isSecret: true }),
  securityToken: z
    .string()
    .optional()
    .meta({ title: "STS Security Token", isSecret: true }),
  regionId: z
    .enum(["cn-shanghai", "cn-beijing", "cn-shenzhen", "ap-southeast-1"])
    .default("cn-shanghai")
    .meta({ title: "Region", isSecret: false }),
  service: z.string().trim().min(1).default("llm_query_moderation").meta({
    title: "Service",
    description:
      "Use a TextModerationPlus content safety service configured in Alibaba Cloud.",
    isSecret: false,
  }),
});

const responseSchema = z.object({
  code: z.number(),
  requestId: z.string().optional(),
  data: z
    .object({
      riskLevel: z.enum(["none", "low", "medium", "high"]),
      result: z
        .array(
          z.object({
            label: z.string().min(1),
            confidence: z.number().min(0).max(100).optional(),
            riskWords: z.string().optional(),
            riskPositions: z
              .array(z.object({ riskWord: z.string().optional() }))
              .optional(),
            customizedHit: z
              .array(z.object({ keyWords: z.string().optional() }))
              .optional(),
          }),
        )
        .optional(),
    })
    .optional(),
});

const labels = {
  porn: "porn",
  sexual: "porn",
  politics: "politics",
  terrorism: "terror",
  contraband: "contraband",
  drug: "contraband",
  weapons: "contraband",
  abuse: "abuse",
  insult: "abuse",
  hate: "hate",
  ad: "ad",
  advertisement: "ad",
  spam: "ad",
  privacy: "privacy",
  violence: "violence",
  "self-harm": "self-harm",
  flood: "flood",
} as const;

/** Review one complete text with Alibaba Cloud; failures never become a pass verdict. */
export async function checkText(
  input: { content: string; dataId?: string | undefined },
  secrets: z.output<typeof secretSchema>,
) {
  const error = (errorMessage: string, requestId?: string) => ({
    verdict: "error" as const,
    hits: [],
    errorMessage,
    ...(requestId ? { requestId } : {}),
  });
  try {
    // Alibaba's CommonJS default export is wrapped when loaded directly as ESM.
    const Client =
      (GreenClient as unknown as { default?: typeof GreenClient }).default ??
      GreenClient;
    const client = new Client(
      new $OpenApiUtil.Config({
        accessKeyId: secrets.accessKeyId,
        accessKeySecret: secrets.accessKeySecret,
        securityToken: secrets.securityToken,
        regionId: secrets.regionId,
        endpoint: `green-cip.${secrets.regionId}.aliyuncs.com`,
        protocol: "HTTPS",
      }),
    );
    const response = await client.textModerationPlusWithOptions(
      new TextModerationPlusRequest({
        service: secrets.service,
        serviceParameters: JSON.stringify({
          content: input.content,
          ...(input.dataId ? { dataId: input.dataId } : {}),
        }),
      }),
      new RuntimeOptions({
        connectTimeout: 5000,
        readTimeout: 10000,
        autoretry: false,
      }),
    );

    // Validate the actual response rather than trusting the SDK's optional model fields.
    const parsed = responseSchema.safeParse(response.body);
    if (!parsed.success)
      return error("Alibaba Cloud returned an invalid moderation response.");
    const { code, data, requestId } = parsed.data;
    if (response.statusCode !== 200 || code !== 200) {
      return error(
        `Alibaba Cloud moderation failed (code ${code}).`,
        requestId,
      );
    }
    if (!data)
      return error("Alibaba Cloud returned no moderation data.", requestId);
    const verdicts = {
      none: "pass",
      low: "pass",
      medium: "suspected",
      high: "block",
    } as const;
    const hits = (data.result ?? [])
      .filter((item) => item.label !== "nonLabel" && item.label !== "normal")
      .map((item) => {
        const category = item.label.split("_")[0] ?? item.label;
        const label: (typeof labels)[keyof typeof labels] | "other" =
          Object.hasOwn(labels, category)
            ? labels[category as keyof typeof labels]
            : "other";
        const keywords = [
          ...new Set(
            [
              ...(item.riskWords?.split(",") ?? []),
              ...(item.riskPositions?.flatMap((position) =>
                position.riskWord ? [position.riskWord] : [],
              ) ?? []),
              ...(item.customizedHit?.flatMap(
                (hit) => hit.keyWords?.split(",") ?? [],
              ) ?? []),
            ]
              .map((word) => word.trim())
              .filter(Boolean),
          ),
        ];
        return {
          label,
          providerLabel: item.label,
          keywords,
          ...(item.confidence !== undefined ? { score: item.confidence } : {}),
        };
      });
    return {
      verdict: verdicts[data.riskLevel],
      hits,
      ...(requestId ? { requestId } : {}),
    };
  } catch {
    // SDK exceptions may contain credentials, request bodies, or echoed content.
    return error(
      "Alibaba Cloud moderation request failed. Check credentials, service availability, and network connectivity.",
    );
  }
}
