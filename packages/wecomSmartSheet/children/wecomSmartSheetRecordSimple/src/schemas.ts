import { z } from "zod";

export const InputSchema = z.object({
  accessToken: z.string(),
  docid: z.string(),
  sheet_id: z.string(),
  action: z.enum(["add", "del", "update", "list"]),
  data: z.record(z.string(), z.any()).optional().nullable(),
  record_id: z.string().optional().nullable(),
  limit: z.number().optional().nullable(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  result: z.any(),
});
export type Output = z.infer<typeof OutputSchema>;
