import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "AppID 不能为空"),
  secret: z.string().min(1, "AppSecret 不能为空"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});
export type Output = z.infer<typeof OutputSchema>;
