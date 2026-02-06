import { z } from "zod";

export const FormatSchema = z.enum(["xlsx", "docx", "pptx"]);
export type Format = z.infer<typeof FormatSchema>;

export const InputSchema = z.object({
  markdown: z.string().describe("Markdown content to convert"),
  filename: z.string().optional().describe("Custom filename without extension"),
});
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  url: z.url().nonempty(),
});
export type Output = z.infer<typeof OutputSchema>;
