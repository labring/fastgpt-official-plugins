import { z } from "zod";

// 辅助类型：支持字符串或字符串数组（用于输入验证）
const StringOrArray = z.union([z.string(), z.array(z.string())]);

// 辅助类型：支持数字、字符串(可解析为数字)或它们的数组
const NumberOrStringArray = z
  .union([z.number(), z.string(), z.array(z.union([z.number(), z.string()]))])
  .transform((val) => {
    if (Array.isArray(val)) {
      return val.map((item) =>
        typeof item === "string" ? parseInt(item, 10) : item,
      );
    }
    return typeof val === "string" ? parseInt(val, 10) : val;
  });

export const InputSchema = z
  .object({
    // 认证参数（二选一）
    accessToken: z.string().optional(),
    appId: z.string().optional(),
    secret: z.string().optional(),

    // 必需参数 - 支持单个或多个
    markdownContent: StringOrArray.refine(
      (val) => {
        if (Array.isArray(val)) {
          return (
            val.length > 0 && val.every((content) => content.trim().length > 0)
          );
        }
        return val.trim().length > 0;
      },
      { message: "Markdown 内容不能为空" },
    ),
    coverImage: StringOrArray.refine(
      (val) => {
        if (Array.isArray(val)) {
          return val.length > 0 && val.every((img) => img.trim().length > 0);
        }
        return val.trim().length > 0;
      },
      { message: "封面图不能为空" },
    ),

    // 可选参数 - 支持单个或多个
    title: StringOrArray.optional(),
    author: StringOrArray.optional(),
    digest: StringOrArray.optional(),
    contentSourceUrl: StringOrArray.optional(),
    needOpenComment: NumberOrStringArray.optional().default(0),
    onlyFansCanComment: NumberOrStringArray.optional().default(0),
  })
  .refine(
    (data) => {
      // 验证认证参数：要么提供 accessToken，要么同时提供 appId 和 appSecret
      return data.accessToken || (data.appId && data.secret);
    },
    {
      message: "必须提供 accessToken，或者同时提供 appId 和 appSecret",
      path: ["认证参数"],
    },
  );
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  media_id: z.string().optional(),
  error_message: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
