import type { ToolContextType } from "@fastgpt-plugin/helpers";
import { handleBatchGetDraft, handleGetAuthToken } from "../../../lib/handler";
import type { Input, Output } from "./schemas";

export async function handler(
  { accessToken, appId, secret, offset = 0, count = 20, noContent }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // 1. 获取 access_token
  let token = accessToken;
  if (!token) {
    if (!appId || !secret) {
      return {
        error_message: "必须提供 accessToken 或同时提供 appId 和 secret",
      };
    }
    const result = await handleGetAuthToken({
      grant_type: "client_credential",
      appid: appId,
      secret: secret,
    });

    if ("access_token" in result && result.access_token) {
      token = result.access_token;
    } else {
      const errorMsg = (result as any).errmsg || "未知错误";
      return {
        error_message: `获取 access_token 失败: ${errorMsg} (错误码: ${(result as any).errcode})`,
      };
    }
  }

  // 2. 获取草稿列表
  const params: {
    access_token: string;
    offset: number;
    count: number;
    no_content?: number;
  } = {
    access_token: token,
    offset,
    count,
  };

  if (noContent !== undefined) {
    params.no_content = noContent;
  }

  const result = await handleBatchGetDraft(params);

  return {
    total_count: result.total_count,
    item_count: result.item_count,
    item: result.item,
  };
}
