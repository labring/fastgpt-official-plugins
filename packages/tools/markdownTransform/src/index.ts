import { z } from 'zod';
import { docxTool } from './docx';
import { pptxTool } from './pptx';
import { xlsxTool } from './xlsx';
import { OutputType } from './type';
import type { uploadFile } from '../utils/uploadFile';

export { OutputType } from './type';

export const InputType = z.object({
  format: z.enum(['xlsx', 'docx', 'pptx']),
  markdown: z.string(),
  filename: z.string().optional()
});

export async function tool(
  {
    format,
    markdown,
    filename
  }: z.infer<typeof InputType>,
  ctx?: Parameters<typeof uploadFile>[1]
): Promise<z.infer<typeof OutputType>> {
  if (format === 'xlsx') {
    return xlsxTool({ markdown, filename }, ctx);
  }
  if (format === 'docx') {
    return docxTool({ markdown, filename }, ctx);
  }
  if (format === 'pptx') {
    return pptxTool({ markdown, filename }, ctx);
  }
  return Promise.reject('Invalid format');
}
