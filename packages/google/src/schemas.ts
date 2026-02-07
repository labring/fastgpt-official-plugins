import { z } from "zod";

export const InputSchema = z.object({
  cx: z.string(),
  query: z.string(),
  key: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
