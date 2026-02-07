import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import {
  handleTavilyError,
  tavilyRequest,
  validateApiKey,
} from "../../../client";
import type { SearchRequest, SearchResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    tavilyApiKey,
    query,
    searchDepth,
    maxResults,
    includeAnswer,
    searchTopic,
    includeRawContent,
    timeRange,
    includeImages,
    includeImageDescriptions,
    includeFavicon,
    includeDomains,
    excludeDomains,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // 1. 验证 API Key
    validateApiKey(tavilyApiKey);

    // 2. 构建请求
    const requestBody: SearchRequest = {
      api_key: tavilyApiKey,
      query,
      search_depth: searchDepth,
      max_results: maxResults,
      include_answer: includeAnswer,
      include_domains: includeDomains,
      exclude_domains: excludeDomains,
      include_images: includeImages,
      include_image_descriptions: includeImageDescriptions,
      include_favicon: includeFavicon,
      include_raw_content:
        includeRawContent === "none" ? false : includeRawContent,
      time_range: timeRange === "none" ? undefined : timeRange,
      topic: searchTopic,
    };

    // 3. 发送请求
    const data = await tavilyRequest<SearchResponse>(
      tavilyApiKey,
      "/search",
      requestBody as unknown as Record<string, unknown>,
    );

    // 4. 格式化输出
    return {
      answer: data.answer || "",
      results: data.results || [],
    };
  } catch (error) {
    return Promise.reject(handleTavilyError(error));
  }
}
