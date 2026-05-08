import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  markdown: z.string().meta({
    title: "Markdown 内容",
    description: "要转换的 Markdown 内容",
    toolDescription: "要转换的 Markdown 内容",
  }),
  format: z.enum(["xlsx", "docx", "pptx"]).meta({
    title: "转换格式",
    description: "需要转换的格式，支持 xlsx 和 docx 和 pptx",
    toolDescription: "需要转换的格式，支持 xlsx 和 docx 和 pptx",
  }),
  filename: z.string().optional().meta({
    title: "文件名",
    description: "自定义文件名（不包含扩展名）",
    toolDescription: "自定义文件名（不包含扩展名）",
  }),
});
const outputSchema = z.object({
  url: z.string().meta({
    title: "文件链接",
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
