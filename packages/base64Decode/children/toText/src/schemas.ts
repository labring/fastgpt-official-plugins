import { z } from "zod";

export const InputSchema = z.object({
  base64: z.string().nonempty(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  text: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
