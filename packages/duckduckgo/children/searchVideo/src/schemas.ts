import { z } from "zod";

export const InputSchema = z.object({
  query: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
