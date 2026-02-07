import { z } from "zod";

export const InputSchema = z.object({
  apiUrl: z.string().optional().default("https://api.firecrawl.dev"),
  apiKey: z.string(),
  url: z.string(),
  format: z.enum(["markdown", "html"]).optional().default("markdown"),
  faster: z.boolean().optional().default(true),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
