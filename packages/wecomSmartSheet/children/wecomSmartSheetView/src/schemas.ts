import { z } from "zod";

export const InputSchema = z.object({
  accessToken: z.string(),
  docid: z.string(),
  sheet_id: z.string(),
  action: z.enum(["add", "del", "update", "list"]),
  view_title: z.string().optional().nullable(),
  view_id: z.string().optional().nullable(),
  view_type: z.string().optional().nullable(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
