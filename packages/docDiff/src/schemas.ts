import { z } from "zod";
import type { LineBreakToleranceOptions } from "./diffAlgorithm";

export const InputSchema = z.object({
  originalText: z.string().min(1, "原始文档内容不能为空"),
  originalTitle: z.string().optional().default("原始文档"),
  modifiedText: z.string().min(1, "修改后文档内容不能为空"),
  modifiedTitle: z.string().optional().default("修改后文档"),
  title: z.string().optional().default("文档对比报告"),
  // 换行容差选项
  lineTolerance: z
    .object({
      enableLineBreakTolerance: z.boolean().optional().default(true),
      scanRange: z.number().optional().default(3),
      toleranceThreshold: z.number().optional().default(0.95),
    })
    .optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  htmlUrl: z.string(),
  diffs: z.array(
    z.object({
      type: z.enum(["added", "removed", "modified"]),
      original: z.string().optional(),
      modified: z.string().optional(),
      lineNumber: z.number(),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;

// 输入类型
export type InputType = {
  originalText: string;
  originalTitle?: string;
  modifiedText: string;
  modifiedTitle?: string;
  title?: string;
  // 换行容差选项
  lineTolerance?: LineBreakToleranceOptions;
};

// 输出类型
export type OutputType = {
  htmlUrl: string;
  diffs: {
    type: "added" | "removed" | "modified";
    original?: string;
    modified?: string;
    lineNumber: number;
  }[];
};
