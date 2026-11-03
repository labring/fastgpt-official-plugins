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
  markdown: {
    type: z.string(),
    title: { en: "Markdown content", "zh-CN": "Markdown 内容" },
    description: {
      en: "Markdown content to convert.",
      "zh-CN": "要转换的 Markdown 内容",
    },
    isToolParam: true,
  },
  format: {
    type: z.enum(["xlsx", "docx", "pptx"]),
    title: { en: "Output format", "zh-CN": "转换格式" },
    description: {
      en: "Output format: XLSX, DOCX, or PPTX.",
      "zh-CN": "需要转换的格式，支持 XLSX、DOCX 和 PPTX",
    },
    isToolParam: true,
  },
  filename: {
    type: z.string().optional(),
    title: { en: "Filename", "zh-CN": "文件名" },
    description: {
      en: "Optional custom filename without an extension.",
      "zh-CN": "可选的自定义文件名（不包含扩展名）",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  url: {
    type: z.string(),
    title: { en: "File URL", "zh-CN": "文件链接" },
    description: {
      en: "URL of the converted file.",
      "zh-CN": "转换后文件的下载链接",
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
    pluginId: "markdownTransform",
    name: {
      en: "Markdown to file",
      "zh-CN": "Markdown 转文件",
    },
    description: {
      en: "Convert Markdown to specified format file, return the file link please download it in time.",
      "zh-CN": "将 Markdown 转成指定格式文件，返回的文件链接请及时下载。",
    },
    version: "0.2.2",
    versionDescription: {
      en: "样式修改：支持有序列表的序号显示以及缩进。",
      "zh-CN": "样式修改：支持有序列表的序号显示以及缩进。",
    },
    tags: ["tools"],
    permission: ["file-upload:allow"],
  },
  handler,
});

export default tool;
