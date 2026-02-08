import { z } from "zod";

export const InputSchema = z.object({});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  teamName: z.string().describe("团队名称"),
  teamMembers: z
    .array(
      z.object({
        tmbId: z.string().describe("成员ID"),
        tmbName: z.string().describe("成员名称"),
        status: z.string().describe("成员状态"),
      }),
    )
    .describe("团队成员列表")
    .nullish(),
});
export type Output = z.infer<typeof OutputSchema>;
