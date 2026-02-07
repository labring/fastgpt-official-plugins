import { z } from "zod";

export const InputSchema = z.object({
  arxivId: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  abstract: z
    .object({
      arxivId: z.string().default(""),
      title: z.string().default(""),
      abstract: z.string().default(""),
      authors: z.array(z.string()).default([]),
      published: z.string().default(""),
      link: z.string().default(""),
    })
    .nullable(),
});
export type Output = z.infer<typeof OutputSchema>;
