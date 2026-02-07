import { z } from "zod";

export const InputSchema = z.object({
  sources: z
    .array(z.enum(["36kr", "zhihu", "weibo", "juejin", "toutiao"]))
    .default(["36kr"]),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  hotNewsList: z.array(
    z.union([
      z.object({
        title: z.string().describe("hot news title").optional(),
        description: z.string().describe("hot news description").optional(),
        source: z.string().describe("hot news source website"),
        time: z.string().describe("hot news publish time").optional(),
      }),
      z.object({
        source: z.string().describe("hot news source website"),
        error: z
          .string()
          .describe("failed to get hot news, error message")
          .optional(),
      }),
    ]),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
