import { z } from "zod";

export const InputSchema = z.object({
  base_url: z.string(),
  token: z.string().optional().default(""),
  files: z.array(z.string()),
  parse_method: z.string().optional().default("auto"),
  formula_enable: z.boolean().optional().default(true),
  table_enable: z.boolean().optional().default(true),
  return_md: z.boolean().optional().default(true),
  return_content_list: z.boolean().optional().default(false),
  lang_list: z.string().optional().default("ch"),
  backend: z.string().optional().default("pipeline"),
  sglang_server_url: z.string().optional().default(""),
});
export type Input = z.infer<typeof InputSchema>;

const ResultItemSchema = z.object({
  filename: z.string(),
  images: z.array(z.string()).optional(),
  content_list: z.array(z.any()).optional(),
  md_content: z.string().optional(),
});

export const OutputSchema = z.object({
  result: z.record(z.string(), z.array(ResultItemSchema)),
});
export type Output = z.infer<typeof OutputSchema>;
