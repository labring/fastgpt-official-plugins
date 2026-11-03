import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as PDF2textInputType,
  OutputType as PDF2textOutputType,
  tool as PDF2textTool,
} from "./children/PDF2text";

const secretSchema = z.object({
  apikey: z.string().meta({
    title: "API key",
    description: "Doc2X API key, available from the Doc2X developer platform.",
    "x-i18n": {
      title: { en: "API key", "zh-CN": "API 密钥" },
      description: {
        en: "Doc2X API key, available from the Doc2X developer platform.",
        "zh-CN": "Doc2X 的 API 密钥，可从 Doc2X 开放平台获取。",
      },
    },
    isSecret: true,
  }),
});
const PDF2textSecretSchema = z.object({});
const PDF2textInputSchema = defineInputSchema({
  files: {
    type: z.array(z.string()),
    title: { en: "Files", "zh-CN": "文件" },
    description: {
      en: "URLs of PDF files to process.",
      "zh-CN": "需要处理的 PDF 地址。",
    },
    isToolParam: true,
  },
});
const PDF2textOutputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Parsed document contents, with multiple files separated by horizontal rules.",
      "zh-CN": "处理结果，由文档内容组成，多个文件之间由横线分隔开。",
    },
  },
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "成功" },
    description: {
      en: "Whether processing succeeded.",
      "zh-CN": "处理是否成功。",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error", "zh-CN": "错误信息" },
    description: {
      en: "Error message when processing fails.",
      "zh-CN": "处理失败时返回的错误信息。",
    },
  },
});
const PDF2textHandler = createToolHandler({
  inputSchema: PDF2textInputSchema,
  outputSchema: PDF2textOutputSchema,
  secretSchema: PDF2textSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await PDF2textInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await PDF2textTool(parsedInput);
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
      "zh-CN": "初始版本",
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
