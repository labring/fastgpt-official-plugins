import { z } from "zod";

export const InputSchema = z.object({
  arxivId: z.string(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  metadata: z
    .object({
      arxivId: z.string().default(""),
      title: z.string().default(""),
      authors: z.array(z.string()).default([]),
      abstract: z.string().default(""),
      categories: z.array(z.string()).default([]),
      primaryCategory: z.string().default(""),
      published: z.string().default(""),
      updated: z.string().default(""),
      version: z.string().default(""),
      doi: z.string().default(""),
      journalRef: z.string().default(""),
      comments: z.string().default(""),
      links: z.object({
        abstract: z.string().default(""),
        pdf: z.string().default(""),
        source: z.string().default(""),
      }),
      downloadUrls: z.object({
        pdf: z.string().default(""),
        source: z.string().default(""),
        other: z.array(z.string()).default([]),
      }),
    })
    .nullable(),
});
export type Output = z.infer<typeof OutputSchema>;
