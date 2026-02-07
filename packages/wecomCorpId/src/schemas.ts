import { z } from "zod";

export const InputSchema = z.object({});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});
export type Output = z.infer<typeof OutputSchema>;
