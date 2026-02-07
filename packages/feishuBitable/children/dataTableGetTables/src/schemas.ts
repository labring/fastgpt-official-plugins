import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  biTableId: z.string().min(1, "BiTable ID is required"),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  pageToken: z.string().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tables: z.array(
    z.object({
      tableId: z.string(),
      name: z.string(),
      revision: z.number().optional(),
    }),
  ),
  hasMore: z.boolean(),
  pageToken: z.string().optional(),
  total: z.number(),
});
export type Output = z.infer<typeof OutputSchema>;
