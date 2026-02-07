import { z } from "zod";

export const InputSchema = z
  .object({
    ms: z.number().min(1).max(300000).optional(),
    延迟时长: z.number().min(1).max(300000).optional(),
  })
  .transform((data) => {
    return {
      ms: data.ms || data.延迟时长 || 1,
    };
  });
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({});
export type Output = z.infer<typeof OutputSchema>;
