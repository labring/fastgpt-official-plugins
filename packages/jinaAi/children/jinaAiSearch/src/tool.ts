import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

/**
 * 构建搜索URL
 */
const buildSearchUrl = (
  query: string,
  country?: string,
  language?: string,
): string => {
  const baseUrl = "https://s.jina.ai/";
  const params = new URLSearchParams({ q: query });

  if (country) params.append("gl", country);
  if (language) params.append("hl", language);

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Jina AI 搜索工具主函数
 */
export async function handler(
  {
    query,
    apiKey,
    country,
    language,
    timeout = 30,
    readFullContent = false,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // 清理查询词
  const cleanQuery = query.trim();
  if (cleanQuery.length === 0) {
    return Promise.reject("搜索查询词不能为空或仅包含空白字符");
  }

  const searchUrl = buildSearchUrl(query, country, language);

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "X-Timeout": timeout.toString(),
    "User-Agent": "FastGPT-JinaAI-Plugin/1.0.0",
  };

  // 根据readFullContent设置引擎模式
  if (readFullContent) {
    headers["X-Engine"] = "direct";
  } else {
    headers["X-Respond-With"] = "no-content";
  }

  // 执行搜索
  const response = await fetch(searchUrl, { headers });

  if (!response.ok) {
    throw new Error(
      `Jina AI Search API error: ${response.status} ${response.statusText}`,
    );
  }

  const responseData = await response.json();
  const data = responseData.data;

  return {
    result: data.map(
      (item: {
        title: string;
        url: string;
        description: string;
        content?: string;
      }) => ({
        title: item.title,
        description: item.description,
        url: item.url,
        content: item.content,
      }),
    ),
  };
}
