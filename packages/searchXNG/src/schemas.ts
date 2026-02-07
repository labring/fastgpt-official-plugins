import { z } from "zod";

export const InputSchema = z.object({
  query: z.string(),
  url: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      snippet: z.string(),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
