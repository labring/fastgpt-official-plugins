import { z } from "zod";

export const InputSchema = z
  .object({
    // 认证参数（二选一）
    accessToken: z.string().optional(),
    appId: z.string().optional(),
    secret: z.string().optional(),

    // 必需参数
    type: z.enum(["image", "voice", "video"]),
    mediaUrl: z.string().url("请提供有效的文件URL"),

    // 可选参数（视频素材需要）
    title: z.string().optional(),
    introduction: z.string().optional(),
  })
  .refine(
    (data) => {
      // 验证认证参数：要么提供 accessToken，要么同时提供 appId 和 secret
      return data.accessToken || (data.appId && data.secret);
    },
    {
      message: "必须提供 accessToken，或者同时提供 appId 和 appSecret",
      path: ["认证参数"],
    },
  )
  .refine(
    (data) => {
      // 对于视频类型，title 和 introduction 是必需的
      if (data.type === "video") {
        return !!(data.title && data.introduction);
      }
      return true;
    },
    {
      message: "视频素材必须提供标题和简介",
      path: ["视频参数"],
    },
  );
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  media_id: z.string().optional(),
  url: z.string().optional(),
  success: z.boolean(),
  message: z.string().optional(),
  error_message: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
