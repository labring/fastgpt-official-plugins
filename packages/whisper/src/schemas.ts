import { z } from "zod";

export const InputSchema = z.object({
  baseUrl: z.string().optional().default("https://api.openai.com/v1"),
  apiKey: z.string().nonempty(),
  file: z.string().nonempty(),
  model: z.string().nonempty(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  text: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
