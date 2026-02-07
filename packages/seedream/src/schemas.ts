import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string().describe("Doubao Seedream API Key"),
  model: z.string().nonempty().describe("model name"),
  prompt: z.string().nonempty().describe("describe the desired image content"),
  size: z.string().optional().describe("aspect ratio of the generated content"),
  seed: z
    .number()
    .optional()
    .default(0)
    .describe("Random seed to control the randomness of model generation"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  image: z.string().describe("generated image URL"),
});
export type Output = z.infer<typeof OutputSchema>;
