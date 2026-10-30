import {
  createToolHandler,
  defineSecretSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  inputSchema as fetchInputSchema,
  outputSchema as fetchOutputSchema,
  tool as fetchTool,
} from "./children/fetch";
import {
  inputSchema as searchInputSchema,
  outputSchema as searchOutputSchema,
  tool as searchTool,
} from "./children/search";

const secretSchema = defineSecretSchema({
  apiKey: {
    type: z.string().min(1),
    title: { en: "DeepSeek API Key", "zh-CN": "DeepSeek API 密钥" },
    description: {
      en: "DeepSeek API key for authenticating search and fetch requests, available at https://platform.deepseek.com.",
      "zh-CN":
        "用于 DeepSeek 搜索与抓取请求认证的 API 密钥，可在 https://platform.deepseek.com 获取。",
    },
    isSecret: true,
  },
});

const searchHandler = createToolHandler({
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    return searchTool(input, ctx.secrets?.apiKey || "");
  },
});

const fetchHandler = createToolHandler({
  inputSchema: fetchInputSchema,
  outputSchema: fetchOutputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    return fetchTool(input, ctx.secrets?.apiKey || "");
  },
});

export default defineToolSet({
  manifest: {
    pluginId: "deepseekTools",
    name: {
      en: "DeepSeek Search",
      "zh-CN": "DeepSeek 搜索",
    },
    description: {
      en: "DeepSeek official web search and web fetch tool set, powered by DeepSeek in-house search engine.",
      "zh-CN":
        "DeepSeek 官方网页搜索与网页抓取工具集，基于 DeepSeek 自研搜索引擎提供实时联网搜索与 Markdown 网页内容抓取。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial release with web search and fetch capabilities.",
      "zh-CN": "初始版本，支持网页搜索与正文抓取功能。",
    },
    tags: ["search", "tools"],
  },
  secretSchema,
  children: [
    {
      id: "search",
      name: {
        en: "DeepSeek Web Search",
        "zh-CN": "DeepSeek 网页搜索",
      },
      description: {
        en: "Search the web using DeepSeek's in-house search engine with query operators, ranking, summaries, and full content.",
        "zh-CN":
          "使用 DeepSeek 自研搜索引擎检索互联网，支持高级搜索操作符、相关性排序、精炼摘要及网页正文获取。",
      },
      handler: searchHandler,
    },
    {
      id: "fetch",
      name: {
        en: "DeepSeek Web Fetch",
        "zh-CN": "DeepSeek 网页抓取",
      },
      description: {
        en: "Fetch a web page and convert its content into Markdown format using DeepSeek Fetch API.",
        "zh-CN":
          "使用 DeepSeek Fetch API 抓取指定网页并提取为 Markdown 格式正文。",
      },
      handler: fetchHandler,
    },
  ],
});
