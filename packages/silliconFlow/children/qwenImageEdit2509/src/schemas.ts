import { z } from "zod";

// Define input schema for the Silicon Flow painting API
export const InputSchema = z
  .object({
    authorization: z
      .string()
      .describe("API token (without Bearer), e.g., sk-xxxx"),
    prompt: z.string().describe("Text prompt for image generation"),
    image: z.string().describe("Reference image 1 (URL or base64 format)"),
    image2: z
      .string()
      .optional()
      .describe("Reference image 2 (URL or base64 format)"),
    image3: z
      .string()
      .optional()
      .describe("Reference image 3 (URL or base64 format)"),
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
