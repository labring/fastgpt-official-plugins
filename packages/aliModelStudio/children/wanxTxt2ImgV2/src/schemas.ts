import { z } from "zod";

// Model enumeration
const ModelEnum = z.enum([
  "wanx2.1-t2i-turbo", // Tongyi Wanxiang Text-to-Image 2.1 - Faster generation speed, general-purpose model
  "wanx2.1-t2i-plus", // Tongyi Wanxiang Text-to-Image 2.1 - Richer image details, slightly slower
  "wanx2.0-t2i-turbo", // Tongyi Wanxiang Text-to-Image 2.0 - Excels at textured portraits and creative design, cost-effective
]);

// Image size enumeration
const SizeEnum = z.enum([
  "512*512",
  "512*1024",
  "768*768",
  "768*1024",
  "1024*512",
  "1024*768",
  "1024*1024",
  "1280*720",
  "1440*720",
]);

export const InputSchema = z.object({
  apiKey: z.string().describe("Alibaba Cloud Bailian API Key"),
  prompt: z
    .string()
    .describe(
      "Positive prompt describing the desired image content. Supports Chinese and English, up to 800 characters",
    ),
  model: ModelEnum.optional()
    .default("wanx2.1-t2i-turbo")
    .describe("Model name"),
  negative_prompt: z
    .string()
    .optional()
    .describe(
      "Negative prompt describing content that should not appear in the image, up to 500 characters",
    ),
  size: SizeEnum.optional()
    .default("1024*1024")
    .describe("Output image resolution"),
  n: z
    .number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .default(1)
    .describe("Number of images to generate, range 1-4"),
  seed: z
    .number()
    .int()
    .min(0)
    .max(2147483647)
    .optional()
    .describe("Random seed to control the randomness of model generation"),
  prompt_extend: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Whether to enable intelligent prompt rewriting, uses large model to intelligently rewrite input prompt",
    ),
  watermark: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Whether to add watermark, located at bottom right corner of image",
    ),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  images: z.array(z.string()).describe("Array of generated image URLs"),
});
export type Output = z.infer<typeof OutputSchema>;
