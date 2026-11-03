import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});

const inputSchema = defineInputSchema({
  file: {
    type: z.string(),
    title: { en: "Excel file", "zh-CN": "Excel 文件" },
    description: {
      en: "URL of the .xlsx file to operate on. The tool downloads it, applies the workbook script, uploads the result, and returns the file link.",
      "zh-CN":
        "需要操作的 Excel 文件 URL，支持 .xlsx 文件。工具会下载文件、执行工作簿脚本、上传结果并返回文件链接。",
    },
    isToolParam: true,
  },
  script: {
    type: z.string(),
    title: { en: "Workbook script", "zh-CN": "操作脚本" },
    description: {
      en: 'Workbook script using the controlled API, such as workbook.getWorksheet("Sheet1").getRange("A1").setValue("done"). Only supported workbook operations can be produced.',
      "zh-CN":
        '使用受控 workbook API 编写的脚本，例如 workbook.getWorksheet("Sheet1").getRange("A1").setValue("done")；脚本只能执行受支持的工作簿操作。',
    },
    isToolParam: true,
  },
  filename: {
    type: z.string().optional(),
    title: { en: "Output filename", "zh-CN": "输出文件名" },
    description: {
      en: "Optional output filename; the .xlsx suffix may be omitted.",
      "zh-CN": "自定义输出文件名，可省略 .xlsx 后缀。",
    },
    isToolParam: true,
  },
  timeoutMs: {
    type: z.number().int().min(100).max(5000).optional(),
    title: { en: "Script timeout", "zh-CN": "脚本超时时间" },
    description: {
      en: "Synchronous script execution timeout in milliseconds; defaults to 1000.",
      "zh-CN": "脚本同步执行超时时间，单位为毫秒，默认 1000。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  url: {
    type: z.string(),
    title: { en: "File URL", "zh-CN": "文件链接" },
    description: {
      en: "URL of the processed Excel file.",
      "zh-CN": "处理后的 Excel 文件链接。",
    },
  },
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput, ctx);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "excelOperation",
    name: {
      en: "Excel Operation",
      "zh-CN": "Excel 操作",
    },
    description: {
      en: "Operate uploaded .xlsx workbooks using a controlled script API and return the processed file link. This is not Microsoft Office Scripts and is not affiliated with Microsoft.",
      "zh-CN":
        "通过受控脚本 API 操作上传的 .xlsx 工作簿，并返回处理后的文件链接。本工具不是 Microsoft Office Scripts，也未获 Microsoft 认可或关联。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version with workbook, worksheet, range, formula, style, and autofit operations.",
      "zh-CN": "初始版本，支持工作表、区域、公式、样式和自动列宽等操作。",
    },
    tags: ["productivity"],
    permission: ["file-upload:allow"],
  },
  handler,
});

export default tool;
