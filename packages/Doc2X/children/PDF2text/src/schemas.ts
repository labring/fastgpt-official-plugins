import { z } from "zod";

export const InputSchema = z.object({
  apikey: z.string(),
  files: z.array(z.string()),

  // @deprecated
  HTMLtable: z.boolean().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
