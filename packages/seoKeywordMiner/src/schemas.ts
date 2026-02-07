import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string().min(1, "API Key 不能为空"),
  keyword: z.string().min(1, "种子关键词不能为空"),
  pageIndex: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(100),
  sortFields: z.number().int().min(2).max(9).default(4),
  sortType: z.enum(["asc", "desc"]).default("desc"),
  filter: z.number().int().min(1).max(9).default(1),
  filterDate: z.string().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  keywords: z.string(),
  total: z.number(),
  pageCount: z.number(),
  pageIndex: z.number(),
  pageSize: z.number(),
  success: z.boolean(),
  message: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
