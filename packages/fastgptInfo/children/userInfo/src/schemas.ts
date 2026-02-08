import { z } from "zod";

export const InputSchema = z.object({});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  username: z.string().describe("用户的账号"),
  memberName: z.string().describe("成员名"),
  notificationAccount: z.string().describe("通知账号").nullish(),
  tags: z.array(z.string()).describe("用户标签列表").nullish(),
});
export type Output = z.infer<typeof OutputSchema>;
