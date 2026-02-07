import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import {
  handleTavilyError,
  tavilyRequest,
  validateApiKey,
} from "../../../client";
import type { MapRequest, MapResponse } from "../../../types";
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
    selectDomains,
    excludePaths,
    excludeDomains,
    allowExternal,
    timeout,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // 1. 验证 API Key
    validateApiKey(tavilyApiKey);

    // 2. 处理数组类型的参数
    const parseRegexPatterns = (input?: string): string[] | undefined => {
      if (!input) return undefined;

      return input
        .split("\n")
        .map((pattern) => pattern.trim())
        .filter((pattern) => pattern.length > 0);
    };

    // 3. 构建请求
    const requestBody: MapRequest = {
      api_key: tavilyApiKey,
      url,
      instructions: instructions || undefined,
      max_depth: maxDepth,
      max_breadth: maxBreadth,
      limit,
      select_paths: parseRegexPatterns(selectPaths),
      select_domains: parseRegexPatterns(selectDomains),
      exclude_paths: parseRegexPatterns(excludePaths),
      exclude_domains: parseRegexPatterns(excludeDomains),
      allow_external: allowExternal,
      timeout,
    };

    // 4. 发送请求
    const data = await tavilyRequest<MapResponse>(
      tavilyApiKey,
      "/map",
      requestBody as unknown as Record<string, unknown>,
    );

    // 5. 格式化输出
    return {
      baseUrl: data.base_url,
      results: data.results || [],
      urlCount: (data.results || []).length,
      responseTime: data.response_time,
    };
  } catch (error) {
    return Promise.reject(handleTavilyError(error));
  }
}
