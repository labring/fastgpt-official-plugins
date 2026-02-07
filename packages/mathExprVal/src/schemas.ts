import { z } from "zod";

export const InputSchema = z
  .object({
    数学表达式: z.string().optional(),
    expr: z.string().optional(),
  })
  .refine(
    (data) => {
      return data.数学表达式 || data.expr;
    },
    {
      message: '必须传入 "数学表达式" 或 "expr" 中的一个',
    },
  )
  .transform((data) => ({
    expr: data.expr || data.数学表达式,
  }));
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.union([z.string(), z.number()]),
});
export type Output = z.infer<typeof OutputSchema>;
