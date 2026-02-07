import { z } from "zod";

export const InputSchema = z.object({
  baseUrl: z.string().optional().default("https://api.openai.com/v1"),
  apiKey: z.string().nonempty(),
  prompt: z.string().nonempty(),
  size: z.string().default("1024x1024"),
  quality: z.string().default("medium"),
  background: z.string().default("auto"),
  moderation: z.string().default("auto"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  imageUrl: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
