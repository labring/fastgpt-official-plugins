import { z } from "zod";

// Define input schema for the Silicon Flow painting API
export const InputSchema = z
  .object({
    authorization: z
      .string()
      .describe("API token (without Bearer), e.g., sk-xxxx"),
    prompt: z
      .string()
      .nonempty("prompt is required")
      .describe("Text prompt for image generation"),
    image_size: z
      .enum([
        "1328x1328",
        "1664x928",
        "928x1664",
        "1472x1140",
        "1140x1472",
        "1584x1056",
        "1056x1584",
      ])
      .default("1328x1328")
      .describe("Image size"),
    negative_prompt: z
      .string()
      .optional()
      .describe("Negative prompt to exclude unwanted elements in the image"),
    seed: z
      .number()
      .min(0)
      .max(9999999999)
      .optional()
      .describe("Random seed for image generation, range 0-9999999999"),
  })
  .describe("Silicon Flow painting API parameters");
export type Input = z.infer<typeof InputSchema>;

// Define output schema for the Silicon Flow painting API
export const OutputSchema = z.object({
  imageUrl: z.string().url().describe("List of generated image URLs"),
});
export type Output = z.infer<typeof OutputSchema>;
