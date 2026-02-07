import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  biTableId: z.string().min(1, "BiTable ID is required"),
  tableName: z
    .string()
    .min(1, "Table name cannot be empty")
    .max(100, "Table name too long"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  dataTableId: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
