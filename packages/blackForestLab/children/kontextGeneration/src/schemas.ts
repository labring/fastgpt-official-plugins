import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z
    .string()
    .describe("API key for accessing Black Forest Labs FLUX.1 service"),
  prompt: z.string().describe("Text prompt describing the image to generate"),
  aspect_ratio: z
    .enum(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"])
    .describe("Aspect ratio of the generated image"),
  seed: z
    .number()
    .optional()
    .describe("Random seed for reproducible generation (optional)"),
  prompt_upsampling: z
    .boolean()
    .describe("Enable prompt upsampling to enhance the input prompt"),
  safety_tolerance: z.coerce
    .number()
    .min(0)
    .max(6)
    .describe(
      "Safety tolerance level (0-6, higher values are more permissive)",
    ),
  output_format: z.enum(["jpeg", "png"]).describe("Output image format"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  image_url: z.string().describe("URL to access the generated image"),
});
export type Output = z.infer<typeof OutputSchema>;
