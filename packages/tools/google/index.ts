import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  key: z.string().meta({
    title: "key",
    description: "Google 搜索密钥",
    "x-i18n": {
      title: { en: "Google Search API key", "zh-CN": "Google 搜索密钥" },
      description: {
        en: "API key used to access Google Search.",
        "zh-CN": "用于访问 Google 搜索的 API 密钥。",
      },
    },
    isSecret: true,
  }),
  cx: z.string().meta({
    title: "cx",
    description: "Google 搜索引擎 ID",
    "x-i18n": {
      title: { en: "Search engine ID (cx)", "zh-CN": "搜索引擎 ID (cx)" },
      description: {
        en: "Google Programmable Search Engine ID.",
        "zh-CN": "Google 可编程搜索引擎 ID。",
      },
    },
    isSecret: false,
  }),
});
const inputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "搜索查询" },
    description: { en: "Query to search for.", "zh-CN": "需要查询的内容。" },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.record(z.string(), z.unknown()),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "Results returned by Google Search.",
      "zh-CN": "Google 搜索返回的结果。",
    },
  },
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "google",
    name: {
      en: "Google search",
      "zh-CN": "Google 搜索",
    },
    description: {
      en: "Search in Google",
      "zh-CN": "在 Google 中搜索",
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
