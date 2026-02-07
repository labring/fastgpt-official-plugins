import type { ToolContextType } from "@fastgpt-plugin/helpers";
import { handleAddMaterial, handleGetAuthToken } from "../../../lib/handler";
import type { Input, Output } from "./schemas";

// Helper function to get MIME type from file extension
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    mp3: "audio/mpeg",
    amr: "audio/amr",
    mp4: "video/mp4",
    m4v: "video/mp4",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

// Helper function to get file extension for specific material type
function getFileExtensionForType(
  type: string,
  originalExtension?: string,
): string {
  switch (type) {
    case "voice":
      return "amr";
    case "thumb":
      return "jpg";
    case "video":
      return "mp4";
    default:
      return originalExtension || "jpg";
  }
}

// Helper function to download file from URL and create File object
async function downloadFileFromUrl(
  mediaUrl: string,
  type: string,
): Promise<File> {
  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`下载文件失败: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const urlPath = new URL(mediaUrl).pathname;
    const originalExtension = urlPath.split(".").pop() || "";
    const extension = getFileExtensionForType(type, originalExtension);
    const filename = `file.${extension}`;

    return new File([arrayBuffer], filename, { type: getMimeType(extension) });
  } catch (error) {
    throw new Error(
      `下载文件失败: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function handler(
  { accessToken, appId, secret, type, mediaUrl, title, introduction }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    // 1. 获取 access_token
    let token = accessToken;
    if (!token) {
      if (!appId || !secret) {
        return {
          success: false,
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
          success: false,
          error_message: `获取 access_token 失败: ${errorMsg} (错误码: ${(result as any).errcode})`,
        };
      }
    }

    // 3. 准备上传参数
    const uploadParams: any = {
      access_token: token,
      type: type,
    };

    // 4. 为视频类型添加描述信息
    if (type === "video") {
      if (!title || !introduction) {
        return {
          success: false,
          error_message: "视频素材必须提供标题和简介",
        };
      }
      uploadParams.description = {
        title: title,
        introduction: introduction,
      };
    }

    // 5. 调用微信 API 上传永久素材
    const videoDescription =
      type === "video" && title && introduction
        ? { title, introduction }
        : undefined;
    const result = await handleAddMaterial({
      access_token: token,
      type: type,
      description: videoDescription,
      media: await downloadFileFromUrl(mediaUrl, type),
    });

    return {
      success: true,
      media_id: result.media_id,
      url: result.url, // 仅图片类型返回
      message: "永久素材上传成功",
    };
  } catch (error) {
    return {
      success: false,
      error_message: `上传失败: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
