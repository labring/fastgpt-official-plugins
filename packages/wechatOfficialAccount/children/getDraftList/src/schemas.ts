import { z } from "zod";

export const InputSchema = z
  .object({
    // 认证参数（二选一）
    accessToken: z.string().optional(),
    appId: z.string().optional(),
    secret: z.string().optional(),

    // 查询参数
    offset: z.number().int().min(0).optional().default(0),
    count: z.number().int().min(1).max(20).optional().default(20),
    noContent: z.number().int().min(0).max(1).optional(),
  })
  .refine(
    (data) => {
      // 验证认证参数：要么提供 accessToken，要么同时提供 appId 和 secret
      return data.accessToken || (data.appId && data.secret);
    },
    {
      message: "必须提供 accessToken，或者同时提供 appId 和 secret",
      path: ["认证参数"],
    },
  );
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  total_count: z.number().optional(),
  item_count: z.number().optional(),
  item: z.array(z.any()).optional(),
  error_message: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
