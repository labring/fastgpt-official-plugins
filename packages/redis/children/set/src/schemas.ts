import { z } from "zod";

// Input type (includes parent secret)
export const InputSchema = z.object({
  redisUrl: z.string().url("Invalid Redis URL format"),
  key: z.string().min(1, "Key cannot be empty"),
  value: z.string(),
  ttl: z.number().int().min(0).default(0),
});
export type Input = z.infer<typeof InputSchema>;

// Output type
export const OutputSchema = z.object({
  success: z.boolean(),
});
export type Output = z.infer<typeof OutputSchema>;
