import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

// convert image input (URL or base64) to Blob
async function imageInputToBlob(imageInput: string): Promise<Blob> {
  // if input image is url
  if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
    const response = await fetch(imageInput);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
      );
    }
    return response.blob();
  }

  let base64Data = imageInput;
  let mimeType = "image/png";

  if (imageInput.startsWith("data:")) {
    const match = imageInput.match(/^data:([^;]+);base64,(.+)$/);
    if (!match || !match[1] || !match[2])
      throw new Error("Invalid data URL format");
    mimeType = match[1];
    base64Data = match[2];
  }

  // convert base64 to Blob
  const binary = atob(base64Data);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

export async function handler(
  { baseUrl, apiKey, image, prompt, size, quality }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const imageBlob = await imageInputToBlob(image);
  const formData = new FormData();
  formData.append("model", "gpt-image-1");
  formData.append("image", imageBlob, "image.png");
  formData.append("prompt", prompt);
  formData.append("size", size);
  formData.append("quality", quality);

  const response = await fetch(`${baseUrl}/v1/images/edits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
    signal: AbortSignal.timeout(180000),
  });

  if (!response.ok) {
    return Promise.reject(
      `Failed to edit image: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  if (
    !data ||
    !data.data ||
    !Array.isArray(data.data) ||
    data.data.length === 0
  ) {
    return Promise.reject("Failed to edit image or no image data returned");
  }

  // get the first edited image
  const imageData = data.data[0];
  const imageBuffer = Buffer.from(imageData.b64_json, "base64");
  if (imageBuffer.length === 0) {
    return Promise.reject("Failed to convert base64 image data to buffer");
  }

  const { accessUrl: imageUrl } = await _ctx.emitter.uploadFile({
    buffer: imageBuffer,
    defaultFilename: "gpt-image-edited.png",
  });
  if (!imageUrl) {
    return Promise.reject("Failed to upload edited image file");
  }

  return { imageUrl };
}
