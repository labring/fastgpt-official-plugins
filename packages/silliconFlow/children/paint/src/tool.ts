import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

// Error status code mapping
const ERROR_MESSAGES = {
  400: (data: any) => `Bad Request${data?.message ? `: ${data.message}` : ""}`,
  401: () => "Invalid token",
  404: () => "404 page not found",
  429: (data: any) =>
    `Rate limit${data?.message ? `: ${data.message}` : ": Too Many Requests"}`,
  503: (data: any) =>
    `Service unavailable${data?.message ? `: ${data.message}` : ""}`,
  504: () => "Gateway Timeout",
} as const;

// Convert image URL to base64 format
async function urlToBase64(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok)
    return Promise.reject(
      `Failed to fetch image from ${imageUrl}: ${res.status} ${res.statusText}`,
    );
  const buffer = Buffer.from(await res.arrayBuffer());
  // Infer MIME type
  const mime = imageUrl.endsWith(".png")
    ? "image/png"
    : imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/png";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

// Main tool function for Silicon Flow painting API
export async function handler(
  props: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // Hardcoded API URL
  const url = "https://api.siliconflow.cn/v1/images/generations";
  const { authorization, ...params } = props;
  // Automatically convert image field to base64
  const image = await (async () => {
    if (!params.image) return undefined;
    if (params.image.startsWith("data:image/")) return params.image;
    return await urlToBase64(params.image);
  })();

  // Build request body, filtering out undefined values
  const body = Object.fromEntries(
    Object.entries({
      model: params.model,
      prompt: params.prompt,
      image_size: params.image_size,
      batch_size: params.batch_size,
      num_inference_steps: params.num_inference_steps,
      guidance_scale: params.guidance_scale,
      negative_prompt: params.negative_prompt,
      seed: params.seed,
      image,
    }).filter(([, value]) => value !== undefined),
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (!response.ok) {
    const errorHandler =
      ERROR_MESSAGES[response.status as keyof typeof ERROR_MESSAGES];
    const message = errorHandler
      ? errorHandler(data)
      : typeof data === "object" && data?.message
        ? data.message
        : `Response error: ${response.status} ${response.statusText}`;

    return Promise.reject(message);
  }

  return {
    seed: data?.seed,
    timings: data?.timings?.inference,
    images: Array.isArray(data.images)
      ? data.images.map((item: any) =>
          typeof item === "string" ? item : item.url,
        )
      : [],
  };
}
