import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});

const inputSchema = z.object({
  file: z.string().meta({
    title: "Excel 文件",
    description: "需要操作的 Excel 文件 URL，支持 .xlsx 文件。",
    toolDescription:
      "Excel file URL to operate on. The tool downloads the file, applies the workbook script, uploads the result, and returns the file link.",
  }),
  script: z.string().meta({
    title: "操作脚本",
    description: "使用受控 workbook API 编写的 Excel 操作脚本。",
    toolDescription:
      'Workbook script. Use workbook.getWorksheet("Sheet1").getRange("A1").setValue("done") style APIs. The script can only produce supported workbook operations.',
  }),
  filename: z.string().optional().meta({
    title: "输出文件名",
    description: "自定义输出文件名，可省略 .xlsx 后缀。",
  }),
  timeoutMs: z.number().int().min(100).max(5000).optional().meta({
    title: "脚本超时时间",
    description: "脚本同步执行超时时间，单位毫秒，默认 1000。",
  }),
});

const outputSchema = z.object({
  url: z.string().meta({
    title: "文件链接",
    description: "处理后的 Excel 文件链接。",
  }),
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
      en: "Operate Excel workbooks with a controlled workbook script API and return the processed file link.",
      "zh-CN":
        "通过受控 workbook 脚本 API 操作 Excel 文件，并返回处理后的文件链接。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version with workbook, worksheet, range, formula, style, and autofit operations.",
      "zh-CN": "初始版本，支持工作表、区域、公式、样式和自动列宽等操作。",
    },
    toolDescription:
      "Operate an uploaded .xlsx file using a controlled workbook script API. This tool is not Microsoft Office Scripts and is not affiliated with Microsoft.",
    tags: ["productivity"],
    permission: ["file-upload:allow"],
  },
  handler,
});

export default tool;
