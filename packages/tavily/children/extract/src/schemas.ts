import { z } from "zod";

export const InputSchema = z.object({
  tavilyApiKey: z.string().min(1, "Tavily API key is required"),
  urls: z.string().min(1, "At least one URL is required"),
  format: z.enum(["markdown", "text"]).default("markdown"),
  extract_depth: z.enum(["basic", "advanced"]).default("basic"),
  include_images: z.boolean().default(false),
  include_favicon: z.boolean().default(false),
  timeout: z.number().min(1).max(60).optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  results: z
    .array(
      z.object({
        url: z.string(),
        raw_content: z.string(),
        images: z.array(z.string()).optional(),
        favicon: z.string().optional(),
      }),
    )
    .default([]),
  successCount: z.number(),
  failedUrls: z.array(z.string()).default([]),
});
export type Output = z.infer<typeof OutputSchema>;
