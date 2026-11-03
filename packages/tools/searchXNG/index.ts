import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb, UrlType } from "./src";

const secretSchema = z.object({
  url: UrlType.meta({
    title: "SearXNG instance URL",
    description:
      "Enter a self-hosted or trusted SearXNG instance URL, such as https://search.example.com.",
    isSecret: false,
    "x-i18n": {
      title: { en: "SearXNG instance URL", "zh-CN": "SearXNG 实例地址" },
      description: {
        en: "Enter a self-hosted or trusted SearXNG instance URL, such as https://search.example.com.",
        "zh-CN":
          "填写自建或可信的 SearXNG 实例地址，例如 https://search.example.com",
      },
    },
  } satisfies SecretSchemaMetaType),
});
const inputSchema = defineInputSchema({
  query: {
    type: z.string().min(1),
    title: { en: "Search query", "zh-CN": "检索词" },
    description: {
      en: "The query to search for.",
      "zh-CN": "要检索的关键词。",
    },
    isToolParam: true,
  },
});
const searchResultOutputSchema = defineOutputSchema({
  title: {
    type: z.string(),
    title: { en: "Result title", "zh-CN": "结果标题" },
    description: {
      en: "Title of the search result.",
      "zh-CN": "搜索结果的标题。",
    },
  },
  link: {
    type: z.string(),
    title: { en: "Result link", "zh-CN": "结果链接" },
    description: {
      en: "URL of the search result.",
      "zh-CN": "搜索结果的 URL。",
    },
  },
  snippet: {
    type: z.string(),
    title: { en: "Result snippet", "zh-CN": "结果摘要" },
    description: {
      en: "Text snippet from the search result.",
      "zh-CN": "搜索结果的文本摘要。",
    },
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.array(searchResultOutputSchema),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "Results returned by the search.",
      "zh-CN": "检索返回的结果。",
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
    pluginId: "searchXNG",
    name: {
      en: "Search XNG",
      "zh-CN": "SearXNG 搜索",
    },
    description: {
      en: "Use a configured SearXNG instance for web search.",
      "zh-CN": "使用配置的 SearXNG 实例进行网络搜索。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Use the SearXNG JSON Search API with a configured instance URL.",
      "zh-CN": "使用 SearXNG JSON 搜索 API，并配置实例地址。",
    },
    tags: ["search"],
  },
  handler,
});

export default tool;
