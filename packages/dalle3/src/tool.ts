import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

function getErrText(err: any, def = ""): string {
  const msg: string =
    typeof err === "string"
      ? err
      : err?.response?.data?.message ||
        err?.response?.message ||
        err?.message ||
        err?.response?.data?.msg ||
        err?.response?.msg ||
        err?.msg ||
        def;
  return msg;
}

export async function handler(
  props: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { prompt, url, authorization, 绘图提示词: old_prompt } = props;

  try {
    const response = await fetch(`${url}/v1/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorization}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        n: 1,
        size: "1024x1024",
        prompt,
      }),
    });

    if (!response.ok) {
      return Promise.reject(
        `Request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      return Promise.reject("Request failed");
    }

    const uploadResult = await _ctx.emitter.uploadFile({
      url: imageUrl,
      defaultFilename: "dalle3.png",
    });

    if (old_prompt) {
      return {
        图片访问链接: uploadResult.accessUrl,
      };
    } else {
      return {
        link: uploadResult.accessUrl,
      };
    }
  } catch (error: any) {
    const errorMessage = getErrText(error);

    if (old_prompt) {
      return {
        error: errorMessage,
      };
    }

    return Promise.reject({
      system_error: errorMessage,
    });
  }
}
