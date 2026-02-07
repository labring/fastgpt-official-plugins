import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

type SeedreamResponse = {
  data: {
    url: string;
  }[];
};

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { apiKey, model, prompt, size, seed } = input;

  const url = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
      seed,
    }),
  });

  const data: SeedreamResponse = await response.json();
  const image_url = data?.data?.[0]?.url;
  if (!image_url) {
    return Promise.reject("Failed to generate image");
  }

  return {
    image: image_url,
  };
}
