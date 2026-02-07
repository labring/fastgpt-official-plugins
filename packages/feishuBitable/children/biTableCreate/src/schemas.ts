import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  name: z
    .string()
    .min(1, "App name cannot be empty")
    .max(100, "App name too long"),
  folderToken: z.string().optional(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
