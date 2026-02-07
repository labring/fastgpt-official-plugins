import { z } from "zod";

export const InputSchema = z.object({
  arxivId: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  paper: z
    .object({
      title: z.string().default(""),
      authors: z.array(z.string()).default([]),
      summary: z.string().default(""),
      link: z.string().default(""),
      published: z.string().default(""),
      arxivId: z.string().default(""),
    })
    .nullable(),
});
export type Output = z.infer<typeof OutputSchema>;
