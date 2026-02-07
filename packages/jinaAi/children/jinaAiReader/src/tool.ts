import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

/**
 * 构建请求头
 */
function buildHeaders(
  apiKey: string,
  returnFormat: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "User-Agent": "FastGPT-JinaAI-Plugin/0.1.0",
  };

  // 根据格式设置X-Return-Format头
  if (returnFormat !== "default") {
    headers["X-Return-Format"] = returnFormat;
  }

  return headers;
}

/**
 * Jina AI Reader 工具主函数
 */
export async function handler(
  { url, apiKey, returnFormat = "default" }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: buildHeaders(apiKey, returnFormat),
  });

  if (!response.ok) {
    throw new Error(
      `Jina AI Reader API error: ${response.status} ${response.statusText}`,
    );
  }

  const responseData = await response.json();
  const data = responseData.data;

  const content = (() => {
    switch (returnFormat) {
      case "html":
        return data.html || "";
      case "text":
        return data.text || "";
      case "screenshot":
        return data.screenshotUrl || "";
      case "pageshot":
        return data.pageshotUrl || "";
      case "markdown":
      case "default":
      default:
        return data.content || "";
    }
  })();

  return {
    title: data.title,
    description: data.description,
    content,
  };
}
