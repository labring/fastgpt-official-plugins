import { z } from "zod";

export const InputSchema = z.object({
  accessToken: z.string(),
  docid: z.string(),
  action: z.enum(["add", "delete", "update", "get"]),
  sheet_id: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  need_all_type_sheet: z.boolean().optional().nullable(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
