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

// Main tool function for Silicon Flow painting API
export async function handler(
  props: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // Hardcoded API URL
  const url = "https://api.siliconflow.cn/v1/images/generations";
  const {
    authorization,
    prompt,
    image,
    image2,
    image3,
    seed,
    negative_prompt,
  } = props;

  // Build request body, filtering out undefined values
  // According to API docs, image2 and image3 should be arrays
  const bodyData: Record<string, any> = {
    model: "Qwen/Qwen-Image-Edit-2509",
    prompt,
    image,
    ...(image2 && { image2 }),
    ...(image3 && { image3 }),
    ...(negative_prompt && { negative_prompt }),
    ...(seed !== undefined && { seed }),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const data = await response.json();
    const errorHandler =
      ERROR_MESSAGES[response.status as keyof typeof ERROR_MESSAGES];
    const message = errorHandler
      ? errorHandler(data)
      : typeof data === "object" && data?.message
        ? data.message
        : `Response error: ${response.status} ${response.statusText}`;

    return Promise.reject(message);
  }

  const data = await response.json();

  // Extract the first image URL from the response
  const imageUrl =
    Array.isArray(data.images) && data.images.length > 0
      ? data.images[0].url
      : "";

  return {
    imageUrl,
  };
}
