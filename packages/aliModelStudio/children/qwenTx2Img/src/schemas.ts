import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string().describe("Alibaba Cloud Qwen API Key"),
  image1: z
    .string()
    .describe("First input image URL or Base64 encoded data (required)"),
  image2: z
    .string()
    .optional()
    .describe("Second input image URL or Base64 encoded data (optional)"),
  image3: z
    .string()
    .optional()
    .describe("Third input image URL or Base64 encoded data (optional)"),
  prompt: z
    .string()
    .describe(
      "Positive prompt describing the desired image content. Supports Chinese and English, up to 800 characters",
    ),
  negative_prompt: z
    .string()
    .optional()
    .describe(
      "Negative prompt describing content that should not appear in the image, up to 500 characters",
    ),
  seed: z
    .number()
    .int()
    .min(0)
    .max(2147483647)
    .optional()
    .describe("Random seed to control the randomness of model generation"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  image: z.string().describe("generated image URL"),
});
export type Output = z.infer<typeof OutputSchema>;
