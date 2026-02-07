import { z } from "zod";

// FLUX model enum
const ModelEnum = z.enum([
  "flux-schnell", // FLUX.1 [schnell] Few-step model, fast generation, excellent visual quality
  "flux-dev", // FLUX.1 [dev] Open-source model for non-commercial applications
  "flux-merged", // FLUX.1-merged Combines advantages of DEV and Schnell models
]);

// Image size enum
const SizeEnum = z.enum([
  "512*1024",
  "768*512",
  "768*1024",
  "1024*576",
  "576*1024",
  "1024*1024",
]);

export const InputSchema = z.object({
  apiKey: z.string().describe("Aliyun Bailian API Key"),
  prompt: z
    .string()
    .describe(
      "Text content, supports Chinese and English. No more than 500 Chinese characters or 500 English words.",
    ),
  model: ModelEnum.optional().default("flux-schnell").describe("Model name"),
  size: SizeEnum.optional()
    .default("1024*1024")
    .describe("Resolution of the generated image"),
  seed: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      "Seed value for image generation. If not provided, a random number will be used.",
    ),
  steps: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      "Number of inference steps for image generation. Default is 30. Official default for flux-schnell is 4, for flux-dev is 50.",
    ),
  guidance: z
    .number()
    .min(0)
    .optional()
    .describe(
      "Guidance scale for adjusting the creativity and adherence to the prompt. Higher values make the image more faithful to the prompt but less diverse; lower values allow more creativity and variation. Default is 3.5.",
    ),
  offload: z
    .boolean()
    .optional()
    .describe(
      "Whether to temporarily offload some compute-intensive components from GPU to CPU during sampling to reduce memory pressure or improve efficiency. Default is False.",
    ),
  add_sampling_metadata: z
    .boolean()
    .optional()
    .describe(
      "Whether to embed prompt and other metadata in the output image file. Default is True.",
    ),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  images: z.array(z.string()).describe("Array of generated image URLs"),
});
export type Output = z.infer<typeof OutputSchema>;
