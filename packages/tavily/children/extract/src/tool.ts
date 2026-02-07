import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import {
  handleTavilyError,
  tavilyRequest,
  validateApiKey,
} from "../../../client";
import type { ExtractRequest, ExtractResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    tavilyApiKey,
    urls,
    format,
    extract_depth,
    include_images,
    include_favicon,
    timeout,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // 1. 验证 API Key
    validateApiKey(tavilyApiKey);

    // 2. 解析 URLs (支持换行分隔)
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) {
      throw new Error("No valid URLs provided");
    }

    // 3. 构建请求
    const requestBody: ExtractRequest = {
      api_key: tavilyApiKey,
      urls: urlList.length === 1 ? urlList[0]! : urlList,
      format,
      extract_depth,
      include_images,
      include_favicon,
      timeout: timeout || undefined,
    };

    // 4. 发送请求
    const data = await tavilyRequest<ExtractResponse>(
      tavilyApiKey,
      "/extract",
      requestBody as unknown as Record<string, unknown>,
    );

    // 5. 格式化输出
    const failedUrls = (data.failed_results || []).map(
      (item) => `${item.url}: ${item.error}`,
    );

    return {
      results: data.results || [],
      successCount: (data.results || []).length,
      failedUrls,
    };
  } catch (error) {
    return Promise.reject(handleTavilyError(error));
  }
}
