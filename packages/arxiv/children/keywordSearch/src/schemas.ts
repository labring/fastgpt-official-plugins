import { z } from "zod";

export const InputSchema = z.object({
  keyword: z.string(),
  maxResults: z.number().min(1).max(50).default(5),
  sortBy: z
    .enum(["relevance", "lastUpdatedDate", "submittedDate"])
    .default("relevance"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  papers: z.array(
    z.object({
      title: z.string().default(""),
      authors: z.array(z.string()).default([]),
      summary: z.string().default(""),
      link: z.string().default(""),
      published: z.string().default(""),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
