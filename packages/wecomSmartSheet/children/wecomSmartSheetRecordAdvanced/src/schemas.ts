import { z } from "zod";

export const InputSchema = z.object({
  accessToken: z.string(),
  docid: z.string(),
  sheet_id: z.string(),
  action: z.enum(["add", "del", "update", "list"]),
  records: z.array(z.any()).optional().nullable(),
  record_ids: z.array(z.string()).optional().nullable(),
  query_params: z.record(z.string(), z.any()).optional().nullable(),
  key_type: z.string().optional().nullable(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
