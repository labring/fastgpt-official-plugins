import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function handler(
  { apiKey, text, aspect_ratio, model }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const token = `Bearer ${apiKey}`;
  const response = await fetch(OPENROUTER_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: text,
          modalities: ["image"],
          image_config: {
            aspect_ratio: aspect_ratio,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: {
      message?: {
        images?: { image_url?: { url?: string } }[];
      };
    }[];
  };

  // model response is a base64 string
  const dataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl || !dataUrl.startsWith("data:")) {
    throw new Error("Failed to generate image");
  }

  const match = dataUrl.match(/^data:([^;]+);base64,/);
  const mime = match?.[1];
  const ext = (() => {
    const m = mime?.split("/")[1];
    return m && m.length > 0 ? m : "png";
  })();
  const defaultFilename = `image.${ext}`;

  const meta = await _ctx.emitter.uploadFile({
    base64: dataUrl,
    defaultFilename,
  });

  return {
    imageUrl: meta.accessUrl,
  };
}
