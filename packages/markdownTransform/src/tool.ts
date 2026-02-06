import type { ToolContextType } from "@fastgpt-plugin/helpers";
import { docxTool } from "./docx";
import { pptxTool } from "./pptx";
import type { Format, Input, Output } from "./schemas";
import { xlsxTool } from "./xlsx";

export async function tool(
  { format, markdown, filename }: Input & { format: Format },
  ctx: ToolContextType,
): Promise<Output> {
  if (format === "xlsx") {
    return xlsxTool({ markdown, filename }, ctx);
  }
  if (format === "docx") {
    return docxTool({ markdown, filename }, ctx);
  }
  if (format === "pptx") {
    return pptxTool({ markdown, filename }, ctx);
  }
  return Promise.reject("Invalid format");
}
