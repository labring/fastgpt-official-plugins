import {
  defineInputSchema,
  defineOutputSchema,
} from "@fastgpt-plugin/sdk-factory";
import { z } from "zod";
import { type DeepSeekFetchResponse, postDeepSeek } from "../utils/client";

export const inputSchema = defineInputSchema({
  url: {
    type: z
      .string()
      .trim()
      .min(1, "URL cannot be empty")
      .max(8192, "URL must be at most 8192 characters")
      .refine(
        (val) => {
          try {
            const parsed = new URL(val);
            return (
              (parsed.protocol === "http:" || parsed.protocol === "https:") &&
              Boolean(parsed.hostname) &&
              !parsed.username &&
              !parsed.password
            );
          } catch {
            return false;
          }
        },
        {
          message:
            "Must be a valid HTTP or HTTPS URL with a hostname, and without username or password",
        },
      ),
    title: { en: "Webpage URL", "zh-CN": "目标网页链接" },
    description: {
      en: "URL of the webpage to fetch (HTTP or HTTPS, max 8192 chars).",
      "zh-CN":
        "需要抓取的网页 URL 地址（HTTP 或 HTTPS 协议，最大 8192 字符）。",
    },
    isToolParam: true,
  },
});

export const outputSchema = defineOutputSchema({
  title: {
    type: z.string().default(""),
    title: { en: "Page title", "zh-CN": "页面标题" },
    description: {
      en: "Title of the fetched webpage.",
      "zh-CN": "抓取的网页标题。",
    },
  },
  content: {
    type: z.string().default(""),
    title: { en: "Page content", "zh-CN": "页面正文" },
    description: {
      en: "Extracted webpage content in Markdown format.",
      "zh-CN": "网页提取并转换后的 Markdown 格式正文内容。",
    },
  },
});

export async function tool(
  input: z.infer<typeof inputSchema>,
  apiKey: string,
): Promise<z.infer<typeof outputSchema>> {
  const { url } = input;

  const response = await postDeepSeek<DeepSeekFetchResponse>(
    "/v1/tools/fetch",
    apiKey,
    { url },
  );

  return {
    title: response?.title || "",
    content: response?.content || "",
  };
}
