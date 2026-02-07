import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string(),
  query: z.string(),
  freshness: z.string().optional().default("noLimit"),
  summary: z.boolean().optional().default(true),
  include: z.string().optional().default(""),
  exclude: z.string().optional().default(""),
  count: z
    .number()
    .optional()
    .default(10)
    .refine((val) => val >= 1 && val <= 50, {
      message: "count must be between 1 and 50",
    }),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.array(
    z.object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      snippet: z.string().nullable().optional(),
      dateLastCrawled: z.string().nullable().optional(),
      language: z.string().nullable().optional(),
      isNavigational: z.boolean().nullable().optional(),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
