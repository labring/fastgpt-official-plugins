import { z } from "zod";

export const InputSchema = z.object({
  apiKey: z.string().nonempty(),
  text: z.string().nonempty(),
  model: z.string().nonempty(),
  voice_id: z.string(),
  speed: z.number().min(0.5).max(2),
  vol: z.number().min(0.1).max(10),
  pitch: z.number().min(-12).max(12),
  emotion: z.enum([
    "",
    "happy",
    "sad",
    "angry",
    "fearful",
    "disgusted",
    "surprised",
    "calm",
  ]),
  english_normalization: z.boolean(),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  audioUrl: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
