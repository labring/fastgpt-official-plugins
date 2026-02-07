import { z } from "zod";

export const InputSchema = z.object({
  tavilyApiKey: z.string().min(1, "Tavily API key is required"),
  query: z.string().min(1, "Search query cannot be empty"),
  searchDepth: z.enum(["basic", "advanced"]).default("basic"),
  maxResults: z.number().int().min(1).max(20).default(5),
  includeAnswer: z.boolean().default(false),
  searchTopic: z.enum(["general", "news", "finance"]).default("general"),
  includeRawContent: z.enum(["none", "text", "markdown"]).default("none"),
  timeRange: z.enum(["none", "day", "week", "month", "year"]).default("none"),
  includeImages: z.boolean().default(false),
  includeImageDescriptions: z.boolean().default(false),
  includeFavicon: z.boolean().default(false),
  includeDomains: z.array(z.string()).default([]),
  excludeDomains: z.array(z.string()).default([]),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  answer: z.string().optional(),
  results: z
    .array(
      z.object({
        title: z.string().nullable(),
        url: z.string().nullable(),
        content: z.string().nullable(),
        raw_content: z.string().optional().nullable(),
      }),
    )
    .default([]),
});
export type Output = z.infer<typeof OutputSchema>;
