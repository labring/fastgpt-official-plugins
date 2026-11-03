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
  url: {
    type: z.string(),
    title: { en: "Webpage URL", "zh-CN": "网页链接" },
    description: {
      en: "URL of the webpage to read.",
      "zh-CN": "需要读取的网页链接。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  title: {
    type: z.string().optional(),
    title: { en: "Page title", "zh-CN": "网页标题" },
  },
  result: {
    type: z.string(),
    title: { en: "Page content", "zh-CN": "网页内容" },
  },
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "fetchUrl",
    name: {
      en: "Fetch Url",
      "zh-CN": "网页内容抓取",
    },
    description: {
      en: "Get the content of a website link and output it in Markdown format, only supports static websites.",
      "zh-CN":
        "可获取一个网页链接内容，并以 Markdown 格式输出，仅支持获取静态网站。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
