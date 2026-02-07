import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string(),
  q: z.string(),
  num: z.number().min(1).max(100).optional().default(20),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
