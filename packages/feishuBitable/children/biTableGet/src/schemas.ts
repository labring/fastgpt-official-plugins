import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  biTableId: z.string().min(1, "BiTable ID is required"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  name: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
