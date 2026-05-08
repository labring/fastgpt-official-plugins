import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as PDF2textInputType,
  OutputType as PDF2textOutputType,
  tool as PDF2textTool,
} from "./children/PDF2text";

const secretSchema = z.object({
  "apikey": z.string().meta({
    title: "apikey",
    description: "Doc2X的API密钥，可以从Doc2X开放平台获得"
  })
});
const PDF2textSecretSchema = z.object({});
const PDF2textInputSchema = z.object({
  "files": z.array(z.string()).meta({
    title: "files",
    description: "需要处理的PDF地址"
  })
});
const PDF2textOutputSchema = z.object({
  "result": z.string().meta({
    title: "结果",
    description: "处理结果，由文档内容组成，多个文件之间由横线分隔开"
  }),
  "success": z.boolean().meta({
    title: "成功",
    description: "成功信息"
  }),
  "error": z.string().optional().meta({
    title: "错误信息"
  })
});
const PDF2textHandler = createToolHandler({
  inputSchema: PDF2textInputSchema,
  outputSchema: PDF2textOutputSchema,
  secretSchema: PDF2textSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await PDF2textInputType.parseAsync(input);
    const output = await PDF2textTool(parsedInput, ctx);
    return PDF2textOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "Doc2X",
    name: {
      en: "Doc2X Service",
      "zh-CN": "Doc2X 服务",
    },
    description: {
      en: "Send an image or PDF file to Doc2X for parsing and return the LaTeX formula in markdown format.",
      "zh-CN":
        "将传入的图片或PDF文件发送至Doc2X进行解析，返回带LaTeX公式的markdown格式的文本。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    tags: ["productivity"],
  },
  secretSchema,
  children: [
    {
      id: "PDF2text",
      name: {
        en: "PDF Recognition",
        "zh-CN": "PDF 识别",
      },
      description: {
        en: "Send an PDF file to Doc2X for parsing and return the LaTeX formula in markdown format.",
        "zh-CN":
          "将PDF文件发送至Doc2X进行解析，返回结构化的LaTeX公式的文本(markdown)，支持传入String类型的URL或者流程输出中的文件链接变量",
      },
      handler: PDF2textHandler,
    },
  ],
});

export default toolSet;
