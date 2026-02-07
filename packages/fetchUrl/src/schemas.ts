import { z } from "zod";

export const InputSchema = z.object({
  url: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  title: z.string().optional(),
  result: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
