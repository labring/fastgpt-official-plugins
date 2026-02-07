import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z
    .string()
    .describe("API key for accessing Black Forest Labs FLUX.1 service"),
  prompt: z
    .string()
    .describe("Text prompt describing the edit to be applied to the image"),
  input_image: z
    .string()
    .describe(
      "Image to use as reference for editing. Can be a URL (http/https) or base64 encoded image data. Supports up to 20MB or 20 megapixels.",
    ),
  aspect_ratio: z
    .enum([
      "3:7",
      "4:7",
      "1:2",
      "9:16",
      "2:3",
      "3:4",
      "1:1",
      "4:3",
      "3:2",
      "16:9",
      "2:1",
      "7:4",
      "7:3",
    ])
    .optional()
    .describe(
      "Desired aspect ratio. All outputs are ~1MP total. Supports ratios from 3:7 to 7:3. Defaults to 1:1 if not specified.",
    ),
  seed: z
    .number()
    .optional()
    .describe("Random seed for reproducible generation (optional)"),
  prompt_upsampling: z
    .boolean()
    .optional()
    .describe(
      "Enable prompt upsampling to enhance the input prompt. Defaults to false.",
    ),
  safety_tolerance: z.coerce
    .number()
    .min(0)
    .max(2)
    .optional()
    .describe(
      "Safety tolerance level (0-2, where 0 is most strict and 2 is balanced). Defaults to 2.",
    ),
  output_format: z
    .enum(["jpeg", "png"])
    .optional()
    .describe("Output image format. Defaults to jpeg."),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  image_url: z.string().describe("URL to access the edited image"),
});
export type Output = z.infer<typeof OutputSchema>;
