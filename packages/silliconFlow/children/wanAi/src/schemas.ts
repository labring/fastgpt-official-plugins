import { z } from "zod";

export const InputSchema = z
  .object({
    authorization: z
      .string()
      .describe("API token (without Bearer), e.g., sk-xxxx"),
    model: z
      .enum([
        "Wan-AI/Wan2.1-T2V-14B",
        "Wan-AI/Wan2.1-T2V-14B-Turbo",
        "Wan-AI/Wan2.1-I2V-14B-720P",
        "Wan-AI/Wan2.1-I2V-14B-720P-Turbo",
      ])
      .default("Wan-AI/Wan2.1-T2V-14B")
      .describe("Model name"),
    prompt: z.string().describe("Text prompt for video generation"),
    image_size: z
      .enum(["1280x720", "720x1280", "960x960"])
      .default("1280x720")
      .describe("Aspect ratio of the generated content"),
    negative_prompt: z
      .string()
      .optional()
      .describe("Negative prompt to exclude unwanted elements"),
    image: z
      .string()
      .url()
      .or(z.string().startsWith("data:image/"))
      .optional()
      .describe(
        'Required for some models. Supports base64 or image URL, e.g., "data:image/png;base64,XXX" or image link',
      ),
    seed: z
      .number()
      .optional()
      .describe("Random seed for controlling generation randomness"),
  })
  .describe("Silicon Flow video generation API parameters");
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  status: z
    .enum(["Succeed", "InQueue", "InProgress", "Failed"])
    .describe("Operation status"),
  url: z.string().describe("Video URL"),
  results: z
    .object({
      videos: z
        .array(z.string().url())
        .describe("Array of generated video URLs, valid for 1 hour"),
      timings: z
        .object({ inference: z.number().describe("Inference time") })
        .describe("Timing information"),
      seed: z.number().describe("Seed value"),
    })
    .describe("Result object containing videos, timings, and seed"),
});
export type Output = z.infer<typeof OutputSchema>;
