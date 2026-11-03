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
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "检索词" },
    description: {
      en: "Keywords or a question to search for in the Wiki.",
      "zh-CN": "用于在 Wiki 中检索的关键词或问题。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "Matching information found in the Wiki.",
      "zh-CN": "在 Wiki 中检索到的匹配信息。",
    },
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
      "zh-CN": "默认版本",
    },
    tags: ["search"],
  },
  handler,
});

export default tool;
