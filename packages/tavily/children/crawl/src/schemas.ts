import { z } from "zod";

export const InputSchema = z.object({
  tavilyApiKey: z.string().min(1, "Tavily API key is required"),
  url: z.string().min(1, "URL is required"),
  instructions: z.string().optional(),
  maxDepth: z.number().int().min(1).max(5).default(1),
  maxBreadth: z.number().int().min(1).default(20),
  limit: z.number().int().min(1).default(50),
  selectPaths: z.string().optional(),
  excludePaths: z.string().optional(),
  allowExternal: z.boolean().default(true),
  includeImages: z.boolean().default(false),
  extractDepth: z.enum(["basic", "advanced"]).default("basic"),
  format: z.enum(["markdown", "text"]).default("markdown"),
  includeFavicon: z.boolean().default(false),
  timeout: z.number().min(10).max(150).default(150),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  baseUrl: z.string(),
  results: z
    .array(
      z.object({
        url: z.string(),
        raw_content: z.string(),
        favicon: z.string().optional(),
      }),
    )
    .default([]),
  successCount: z.number(),
  responseTime: z.number(),
});
export type Output = z.infer<typeof OutputSchema>;
