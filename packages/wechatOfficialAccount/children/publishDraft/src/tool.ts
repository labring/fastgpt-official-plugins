import type { ToolContextType } from "@fastgpt-plugin/helpers";
import { handleGetAuthToken, handleSubmitPublish } from "../../../lib/handler";
import type { Input, Output } from "./schemas";

export async function handler(
  { accessToken, appId, appSecret, mediaId }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // 1. 获取 access_token
    let token = accessToken;
    if (!token) {
      if (!appId || !appSecret) {
        return {
          error_message: "必须提供 accessToken 或同时提供 appId 和 appSecret",
        };
      }
      const result = await handleGetAuthToken({
        grant_type: "client_credential",
        appid: appId,
        secret: appSecret,
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

    // 2. 发布草稿
    const result = await handleSubmitPublish({
      access_token: token,
      media_id: mediaId,
    });

    // 3. 返回发布结果
    return {
      publishId: result.publish_id,
      msgDataId: result.msg_data_id,
    };
  } catch (error) {
    // 处理错误情况
    if (error instanceof Error) {
      return {
        error_message: `发布草稿失败: ${error.message}`,
      };
    }

    // 处理微信API错误
    if (
      typeof error === "object" &&
      error !== null &&
      "errcode" in error &&
      "errmsg" in error
    ) {
      return {
        error_message: `发布草稿失败: ${(error as any).errmsg} (错误码: ${(error as any).errcode})`,
      };
    }

    return {
      error_message: `发布草稿失败: 未知错误`,
    };
  }
}
