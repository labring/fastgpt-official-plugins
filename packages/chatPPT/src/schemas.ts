import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string(),
  text: z.string(),
  color: z.string().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  preview_url: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
