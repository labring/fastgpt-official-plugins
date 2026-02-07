import { z } from "zod";

// 模型类型定义
const ModelEnum = z.enum([
  "ultra",
  "core",
  "sd3.5-large",
  "sd3.5-large-turbo",
  "sd3.5-medium",
]);

// 输入类型定义
export const InputSchema = z.object({
  STABILITY_KEY: z.string().min(1, "STABILITY_KEY is required"),
  prompt: z.string().min(1, "Prompt cannot be empty"),
  model: ModelEnum,
  aspect_ratio: z
    .enum(["1:1", "16:9", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"])
    .optional()
    .default("1:1"),
  negative_prompt: z.string().optional(),
  style_preset: z
    .enum([
      "3d-model",
      "analog-film",
      "anime",
      "cinematic",
      "comic-book",
      "digital-art",
      "enhance",
      "fantasy-art",
      "isometric",
      "line-art",
      "low-poly",
      "modeling-compound",
      "neon-punk",
      "origami",
      "photographic",
      "pixel-art",
      "tile-texture",
    ])
    .optional(),
  seed: z.number().int().min(0).max(4294967294).optional(),
  output_format: z.enum(["png", "jpeg", "webp"]).optional().default("webp"),
});
export type Input = z.infer<typeof InputSchema>;

// 输出类型定义
export const OutputSchema = z.object({
  link: z.string(),
});
export type Output = z.infer<typeof OutputSchema>;
