import { z } from "zod";

export const InputSchema = z.object({
  videoUrl: z.string(),
  lang: z.string().optional().default("zh-CN"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  subtitle: z.string(),
  videoId: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
