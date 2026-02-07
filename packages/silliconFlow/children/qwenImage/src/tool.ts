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
  const { authorization, ...params } = props;

  // Build request body, filtering out undefined values
  const body = Object.fromEntries(
    Object.entries({
      model: "Qwen/Qwen-Image",
      prompt: params.prompt,
      image_size: params.image_size,
      negative_prompt: params.negative_prompt,
      seed: params.seed,
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
