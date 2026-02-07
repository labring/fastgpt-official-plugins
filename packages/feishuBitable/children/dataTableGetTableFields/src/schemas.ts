import { z } from "zod";

export const InputSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  biTableId: z.string().min(1, "BiTable ID is required"),
  dataTableId: z.string().min(1, "Table ID is required"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  fields: z.array(
    z.object({
      fieldId: z.string(),
      fieldName: z.string(),
      type: z.number(),
      isPrimary: z.boolean().optional(),
      description: z.any().optional(),
    }),
  ),
});
export type Output = z.infer<typeof OutputSchema>;
