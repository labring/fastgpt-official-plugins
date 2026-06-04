import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "query": z.string().meta({
    title: "query",
    description: "检索词",
    toolDescription: "检索词"
  })
});
const outputSchema = z.object({
  "result": z.string().meta({
    title: "搜索结果",
    description: "搜索结果"
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
    pluginId: "wiki",
    name: {
      en: "Wiki Search",
      "zh-CN": "Wiki搜索",
    },
    description: {
      en: "Search meanings in Wiki.",
      "zh-CN": "在Wiki中查询释义。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    tags: ["search"],
  },
  secretSchema,
  handler,
});

export default tool;
