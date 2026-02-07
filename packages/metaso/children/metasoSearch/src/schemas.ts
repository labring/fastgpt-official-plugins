import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string().min(1, "API key required").describe("Metaso API密钥"),
  query: z
    .string()
    .min(1, "Search query required")
    .describe("搜索查询词")
    .transform((val) => val.trim()),
  scope: z
    .enum([
      "all",
      "webpage",
      "document",
      "scholar",
      "image",
      "video",
      "podcast",
    ])
    .optional()
    .default("all"),
  includeSummary: z
    .boolean()
    .optional()
    .default(true)
    .describe("是否包含搜索结果摘要"),
  size: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .default(20)
    .describe("返回的搜索结果数量（1-20）"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z
  .object({
    result: z.array(z.any()).min(1, "搜索结果为空或数据格式错误"),
  })
  .describe("Metaso 搜索响应数据");
export type Output = z.infer<typeof OutputSchema>;
