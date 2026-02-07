import { z } from "zod";

// Define input schema for the Silicon Flow painting API
export const InputSchema = z
  .object({
    authorization: z
      .string()
      .describe("API token (without Bearer), e.g., sk-xxxx"),
    model: z
      .enum(["Kwai-Kolors/Kolors"])
      .default("Kwai-Kolors/Kolors")
      .describe("Model name, currently only supports Kwai-Kolors/Kolors"),
    prompt: z.string().describe("Text prompt for image generation"),
    image_size: z
      .enum([
        "1024x1024",
        "960x1280",
        "768x1024",
        "720x1440",
        "720x1280",
        "512x512",
        "2048x2048",
      ])
      .default("1024x1024")
      .describe("Image size"),
    batch_size: z
      .number()
      .min(1)
      .max(4)
      .default(1)
      .describe("Number of images to generate, range 1-4"),
    num_inference_steps: z
      .number()
      .min(1)
      .max(100)
      .default(20)
      .describe("Number of inference steps, range 1-100"),
    guidance_scale: z
      .number()
      .min(0)
      .max(20)
      .default(7.5)
      .describe(
        "Controls how closely the image matches the prompt, range 0-20",
      ),
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
    image: z
      .union([
        z.string().url(),
        z.string().startsWith("data:image/"),
        z
          .string()
          .length(0)
          .transform(() => undefined),
      ])
      .optional()
      .describe(
        'Image to upload, supports image URL or base64 format, e.g., "https://xxx/xx.png" or "data:image/png;base64,XXX"',
      ),
  })
  .describe("Silicon Flow painting API parameters");
export type Input = z.infer<typeof InputSchema>;

// Define output schema for the Silicon Flow painting API
export const OutputSchema = z.object({
  images: z.array(z.string().url()).describe("List of generated image URLs"),
  timings: z
    .number()
    .optional()
    .describe("Timing information for the inference process"),
  seed: z.number().optional().describe("Random seed for image generation"),
});
export type Output = z.infer<typeof OutputSchema>;
