import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

type QwenResponse = {
  output: {
    choices: {
      message: {
        content: { image: string }[];
      };
    }[];
  };
};

export async function handler(
  props: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const url =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";
  const { apiKey, image1, image2, image3, prompt, negative_prompt, seed } =
    props;

  const content = [
    { image: image1 },
    ...(image2 ? [{ image: image2 }] : []),
    ...(image3 ? [{ image: image3 }] : []),
    { text: prompt },
  ];

  const requestBody = {
    model: "qwen-image-edit",
    input: {
      messages: [
        {
          role: "user",
          content,
        },
      ],
    },
    stream: false,
    negative_prompt,
    seed,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(180000),
  });

  if (!response.ok) {
    return Promise.reject(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: QwenResponse = await response.json();
  const image_url = data?.output?.choices[0]?.message?.content[0]?.image;

  if (!data || !image_url) {
    return Promise.reject("Failed to generate image");
  }

  return {
    image: image_url,
  };
}
