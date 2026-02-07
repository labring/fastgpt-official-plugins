import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

// 根据模型获取 API 端点
function getApiEndpoint(
  model:
    | "ultra"
    | "core"
    | "sd3.5-large"
    | "sd3.5-large-turbo"
    | "sd3.5-medium",
): string {
  const baseUrl = "https://api.stability.ai/v2beta/stable-image/generate";

  if (model === "ultra") {
    return `${baseUrl}/ultra`;
  } else if (model === "core") {
    return `${baseUrl}/core`;
  } else {
    // sd3.5 系列模型
    return `${baseUrl}/sd3`;
  }
}

// 工具主函数
export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { STABILITY_KEY, model, output_format } = input;

  // 获取 API 端点
  const endpoint = getApiEndpoint(model);

  // 构建 FormData
  const formData = new FormData();
  formData.append("prompt", input.prompt);
  formData.append("output_format", input.output_format);
  if (input.aspect_ratio) {
    formData.append("aspect_ratio", input.aspect_ratio);
  }
  if (input.negative_prompt) {
    formData.append("negative_prompt", input.negative_prompt);
  }
  if (input.style_preset) {
    formData.append("style_preset", input.style_preset);
  }
  if (input.seed !== undefined) {
    formData.append("seed", input.seed.toString());
  }

  // 使用 fetch 发送请求
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STABILITY_KEY}`,
      Accept: "image/*",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  // 获取图片数据
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 上传文件
  const uploadResult = await _ctx.emitter.uploadFile({
    buffer,
    defaultFilename: `${model}.${output_format}`,
  });

  // 返回结果
  return {
    link: uploadResult.accessUrl,
  };
}
