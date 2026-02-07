import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  biTableId: z.string().min(1, "BiTable ID is required"),
  dataTableId: z.string().min(1, "Table ID is required"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  success: z.boolean(),
});
export type Output = z.infer<typeof OutputSchema>;
