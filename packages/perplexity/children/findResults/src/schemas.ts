import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string(),
  query: z.string(),
  max_results: z.number().min(1).max(20).optional().default(10),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
