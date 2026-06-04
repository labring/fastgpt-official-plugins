import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "url": z.string().meta({
    title: "url",
    description: "需要读取的网页链接",
    toolDescription: "需要读取的网页链接"
  })
});
const outputSchema = z.object({
  "title": z.string().optional().meta({
    title: "网页标题"
  }),
  "result": z.string().meta({
    title: "网页内容"
  })
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
      "zh-CN": "Default version",
    },
    tags: ["tools"],
  },
  secretSchema,
  handler,
});

export default tool;
