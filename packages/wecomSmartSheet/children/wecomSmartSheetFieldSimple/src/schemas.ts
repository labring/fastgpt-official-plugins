import { z } from "zod";

export const InputSchema = z.object({
  accessToken: z.string(),
  docid: z.string(),
  sheet_id: z.string(),
  action: z.enum(["add", "del", "update", "list"]),
  field_title: z.string().optional().nullable(),
  new_field_title: z.string().optional().nullable(),
  field_type: z.string().optional().nullable(),
  options: z.string().optional().nullable(),
  decimal_places: z.number().optional().nullable(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
