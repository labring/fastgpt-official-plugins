import { z } from "zod";

export const InputSchema = z.object({
  content: z.string(),
  hook_url: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.object({
    code: z.number(),
    msg: z.string(),
  }),
});
export type Output = z.infer<typeof OutputSchema>;
