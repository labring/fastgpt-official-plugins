import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  biTableId: z.string().min(1, "BiTable ID is required"),
  dataTableId: z.string().min(1, "Table ID is required"),
  pageSize: z.number().int().min(1).max(500).optional().default(100),
  pageToken: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  records: z.array(
    z.object({
      recordId: z.string(),
      fields: z.record(z.string(), z.any()),
    }),
  ),
  hasMore: z.boolean(),
  pageToken: z.string().optional(),
  total: z.number(),
});
export type Output = z.infer<typeof OutputSchema>;
