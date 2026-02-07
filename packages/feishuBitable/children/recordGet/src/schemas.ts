import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  biTableId: z.string().min(1, "BiTable ID is required"),
  dataTableId: z.string().min(1, "Table ID is required"),
  recordId: z.string().min(1, "Record ID is required"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  recordId: z.string(),
  fields: z.record(z.string(), z.any()),
});
export type Output = z.infer<typeof OutputSchema>;
