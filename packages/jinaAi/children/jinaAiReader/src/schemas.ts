import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string().describe("Jina AI API密钥"),
  url: z.string().url("请提供有效的URL地址").describe("要提取内容的网页URL"),
  returnFormat: z
    .enum(["default", "markdown", "html", "text", "screenshot", "pageshot"])
    .optional()
    .describe("内容返回格式，默认default"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z
  .object({
    title: z.string().describe("网页标题"),
    description: z.string().describe("网页描述"),
    content: z.string().describe("网页内容"),
  })
  .describe("Jina AI Reader API的响应内容");
export type Output = z.infer<typeof OutputSchema>;
