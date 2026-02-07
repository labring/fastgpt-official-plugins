import { z } from "zod";

export const InputSchema = z.object({
  base_url: z.string().optional().default("https://mineru.net"),
  token: z.string(),
  files: z.array(z.string()),
  is_ocr: z.boolean().optional().default(false),
  enable_formula: z.boolean().optional().default(true),
  enable_table: z.boolean().optional().default(true),
  language: z.string().optional().default("ch"),
  extra_formats: z
    .array(z.enum(["html"]))
    .optional()
    .default([]),
  model_version: z.enum(["pipeline", "vlm"]).optional().default("pipeline"),
});
export type Input = z.infer<typeof InputSchema>;

const OutputResultSchemaItem = z.object({
  filename: z.string(),
  errorMsg: z.string().optional(),
  content: z.string().optional(),
  html: z.string().optional(),
});

export const OutputSchema = z.object({
  result: z.array(OutputResultSchemaItem),
});
export type Output = z.infer<typeof OutputSchema>;
