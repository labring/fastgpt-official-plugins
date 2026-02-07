import { z } from "zod";

export const InputSchema = z
  .object({
    企微机器人地址: z.string().optional(), // 兼容旧版
    webhookUrl: z.string().optional(),
    发送的消息: z.string().optional(), // 兼容旧版
    message: z.string().optional(),
  })
  .refine(
    (data) => {
      return (
        (data.企微机器人地址 || data.webhookUrl) &&
        (data.发送的消息 || data.message)
      );
    },
    {
      message: "必须传入机器人地址和消息内容",
    },
  )
  .transform((data) => ({
    webhookUrl: (data.webhookUrl || data.企微机器人地址)!,
    message: (data.message || data.发送的消息)!,
  }));
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({});
export type Output = z.infer<typeof OutputSchema>;
