import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as findResultsInputType,
  OutputType as findResultsOutputType,
  tool as findResultsTool,
} from "./children/findResults";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "Perplexity API Key",
    description: "API key from Perplexity.",
    "x-i18n": {
      title: { en: "Perplexity API Key", "zh-CN": "Perplexity API 密钥" },
      description: {
        en: "API key from Perplexity.",
        "zh-CN": "从 Perplexity 获取的 API 密钥。",
      },
    },
    isSecret: true,
  }),
});

const findResultsSecretSchema = z.object({});
const findResultsInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search Query", "zh-CN": "查询词" },
    description: {
      en: "The query to search for on the web.",
      "zh-CN": "要在网络上搜索的查询内容。",
    },
    isToolParam: true,
  },
  max_results: {
    type: z.number().optional(),
    title: { en: "Maximum Results", "zh-CN": "最大结果数" },
    description: {
      en: "Maximum number of search results to return.",
      "zh-CN": "最多返回的搜索结果数量。",
    },
    isToolParam: true,
  },
});
const findResultsOutputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.string(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Search result title.",
            "zh-CN": "搜索结果标题。",
          },
        },
        url: {
          type: z.string(),
          title: { en: "URL", "zh-CN": "链接" },
          description: { en: "Search result URL.", "zh-CN": "搜索结果链接。" },
        },
        snippet: {
          type: z.string(),
          title: { en: "Snippet", "zh-CN": "摘要" },
          description: {
            en: "Short excerpt of the search result.",
            "zh-CN": "搜索结果的简短摘要。",
          },
        },
      }),
    ),
    title: { en: "Search Results", "zh-CN": "搜索结果" },
    description: {
      en: "Results returned by the Perplexity web search.",
      "zh-CN": "Perplexity 网络搜索返回的结果。",
    },
  },
});

const findResultsHandler = createToolHandler({
  inputSchema: findResultsInputSchema,
  outputSchema: findResultsOutputSchema,
  secretSchema: findResultsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await findResultsInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await findResultsTool(parsedInput);
    return findResultsOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "perplexity",
    name: {
      en: "Perplexity Tool Set",
      "zh-CN": "Perplexity 工具集",
    },
    description: {
      en: "Search the web with Perplexity and return cited, AI-generated search results.",
      "zh-CN": "使用 Perplexity 搜索网络，并返回带引用的 AI 生成搜索结果。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial release",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "findResults",
      name: {
        en: "Network Search",
        "zh-CN": "网络搜索",
      },
      description: {
        en: "Search the web with Perplexity and return cited, AI-generated results.",
        "zh-CN": "使用 Perplexity 搜索网络，并返回带引用的 AI 生成结果。",
      },
      handler: findResultsHandler,
    },
  ],
});

export default toolSet;
