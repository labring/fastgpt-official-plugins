import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import {
  handleTavilyError,
  tavilyRequest,
  validateApiKey,
} from "../../../client";
import type { CrawlRequest, CrawlResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    tavilyApiKey,
    url,
    instructions,
    maxDepth,
    maxBreadth,
    limit,
    selectPaths,
    excludePaths,
    allowExternal,
    includeImages,
    extractDepth,
    format,
    includeFavicon,
    timeout,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // 1. 验证 API Key
    validateApiKey(tavilyApiKey);

    // 2. 处理数组类型的参数
    let parsedSelectPaths: string[] | undefined;
    let parsedExcludePaths: string[] | undefined;

    if (selectPaths) {
      parsedSelectPaths = selectPaths
        .split("\n")
        .map((path) => path.trim())
        .filter((path) => path.length > 0);
    }

    if (excludePaths) {
      parsedExcludePaths = excludePaths
        .split("\n")
        .map((path) => path.trim())
        .filter((path) => path.length > 0);
    }

    // 3. 构建请求
    const requestBody: CrawlRequest = {
      api_key: tavilyApiKey,
      url,
      instructions: instructions || undefined,
      max_depth: maxDepth,
      max_breadth: maxBreadth,
      limit,
      select_paths: parsedSelectPaths,
      select_domains: undefined,
      exclude_paths: parsedExcludePaths,
      exclude_domains: undefined,
      allow_external: allowExternal,
      include_images: includeImages,
      extract_depth: extractDepth,
      format,
      include_favicon: includeFavicon,
      timeout,
    };

    // 4. 发送请求
    const data = await tavilyRequest<CrawlResponse>(
      tavilyApiKey,
      "/crawl",
      requestBody as unknown as Record<string, unknown>,
    );

    // 5. 格式化输出
    return {
      baseUrl: data.base_url,
      results: data.results || [],
      successCount: (data.results || []).length,
      responseTime: data.response_time,
    };
  } catch (error) {
    return Promise.reject(handleTavilyError(error));
  }
}
