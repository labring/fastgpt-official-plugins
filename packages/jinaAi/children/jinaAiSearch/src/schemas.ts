import { z } from "zod";

export const InputSchema = z.object({
  query: z.string().min(1, "搜索查询词不能为空").describe("搜索查询词"),
  apiKey: z.string().min(1, "API密钥不能为空").describe("Jina AI API密钥"),
  country: z.string().optional().describe("搜索地区代码（如CN、US等）"),
  language: z.string().optional().describe("搜索语言代码（如zh-cn、en等）"),
  timeout: z.number().min(5).max(120).optional().describe("请求超时时间（秒）"),
  readFullContent: z.boolean().optional().describe("是否读取SERP的完整内容"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z
  .object({
    result: z.array(
      z.object({
        title: z.string().describe("搜索结果标题"),
        description: z.string().describe("搜索结果描述"),
        url: z.string().describe("搜索结果URL"),
        content: z.string().optional().describe("搜索结果内容"),
      }),
    ),
  })
  .describe("Jina AI 搜索响应数据");
export type Output = z.infer<typeof OutputSchema>;
