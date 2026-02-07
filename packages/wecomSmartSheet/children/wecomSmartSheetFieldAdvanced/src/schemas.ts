import { z } from "zod";

export const InputSchema = z.object({
  accessToken: z.string(),
  docid: z.string(),
  sheet_id: z.string(),
  action: z.enum(["add", "del", "update", "list"]),
  fields: z.array(z.any()).optional().nullable(),
  field_ids: z.array(z.string()).optional().nullable(),
  view_id: z.string().optional().nullable(),
  offset: z.number().optional().nullable(),
  limit: z.number().optional().nullable(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
