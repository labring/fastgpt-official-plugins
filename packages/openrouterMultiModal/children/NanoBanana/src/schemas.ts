import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string(),
  text: z.string(),
  aspect_ratio: z.enum([
    "1:1",
    "2:3",
    "3:4",
    "4:3",
    "2:1",
    "3:2",
    "16:9",
    "9:16",
    "21:9",
    "9:21",
  ]),
  model: z.string().default("google/gemini-2.5-flash-image-preview"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  imageUrl: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
