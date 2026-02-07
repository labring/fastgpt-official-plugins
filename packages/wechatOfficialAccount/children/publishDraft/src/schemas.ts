import { z } from "zod";

export const InputSchema = z
  .object({
    // 认证参数（二选一）
    accessToken: z.string().optional(),
    appId: z.string().optional(),
    appSecret: z.string().optional(),

    // 必需参数
    mediaId: z.string().min(1, "草稿media_id不能为空"),
  })
  .refine(
    (data) => {
      // 验证认证参数：要么提供 accessToken，要么同时提供 appId 和 appSecret
      return data.accessToken || (data.appId && data.appSecret);
    },
    {
      message: "必须提供 accessToken，或者同时提供 appId 和 appSecret",
      path: ["认证参数"],
    },
  );
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  publishId: z.string().optional(),
  msgDataId: z.string().optional(),
  error_message: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
