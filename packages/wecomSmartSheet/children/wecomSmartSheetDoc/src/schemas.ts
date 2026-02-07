import { z } from "zod";

export const InputSchema = z.object({
  accessToken: z.string(),
  doc_name: z.string(),
  spaceid: z.string().optional().nullable(),
  fatherid: z.string().optional().nullable(),
  admin_users: z.string().optional().nullable(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  docid: z.string().optional(),
  url: z.string().optional(),
  result: z.any().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
