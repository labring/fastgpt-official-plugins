import { z } from "zod";

export const InputSchema = z
  .object({
    绘图提示词: z.string().optional(), //绘图提示词是旧版的名称，保持兼容性
    prompt: z.string().optional(),
    url: z.string(),
    authorization: z.string(),
  })
  .refine(
    (data) => {
      return data.绘图提示词 || data.prompt;
    },
    {
      message: '必须传入 "绘图提示词" 或 "prompt" 中的一个',
    },
  )
  .transform((data) => ({
    ...data,
    prompt: data.prompt || data.绘图提示词,
  }));
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  error: z.string().optional(), // 兼容旧版的错误信息
  图片访问链接: z.string().optional(), // 兼容旧版的图片访问链接
  system_error: z.string().optional(),
  link: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
