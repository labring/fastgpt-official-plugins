import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  { baseUrl, apiKey, prompt, size, quality, background, moderation }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${baseUrl}/v1/images/generations`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      quality,
      size,
      background,
      moderation,
    }),
    signal: AbortSignal.timeout(180000),
  });

  if (!response.ok) {
    return Promise.reject(
      `Failed to generate image: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  if (
    !data ||
    !data.data ||
    !Array.isArray(data.data) ||
    data.data.length === 0
  ) {
    return Promise.reject("Failed to generate image or no image data returned");
  }

  const imageData = data.data[0];
  const imageBuffer = Buffer.from(imageData.b64_json, "base64");
  if (imageBuffer.length === 0) {
    return Promise.reject("Failed to convert base64 image data to buffer");
  }

  const { accessUrl: imageUrl } = await _ctx.emitter.uploadFile({
    buffer: imageBuffer,
    defaultFilename: "gpt-image-generated.png",
  });
  if (!imageUrl) {
    return Promise.reject("Failed to upload image file");
  }

  return { imageUrl };
}
