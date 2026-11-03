import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as metasoSearchInputType,
  OutputType as metasoSearchOutputType,
  tool as metasoSearchTool,
} from "./children/metasoSearch";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "Metaso API key",
    description: "Metaso API key used to access the search service.",
    isSecret: true,
    "x-i18n": {
      title: { en: "Metaso API key", "zh-CN": "Metaso API 密钥" },
      description: {
        en: "Metaso API key used to access the search service.",
        "zh-CN": "Metaso API 密钥，用于访问搜索服务",
      },
    },
  }),
});

const metasoSearchSecretSchema = z.object({});
const metasoSearchInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "搜索关键词" },
    description: {
      en: "Keywords or query to search for.",
      "zh-CN": "要搜索的关键词或查询语句",
    },
    isToolParam: true,
  },
  scope: {
    type: z
      .enum([
        "all",
        "webpage",
        "document",
        "scholar",
        "image",
        "video",
        "podcast",
      ])
      .optional(),
    title: { en: "Search scope", "zh-CN": "搜索范围" },
    description: {
      en: "Type of content to search.",
      "zh-CN": "指定搜索的内容范围类型",
    },
    isToolParam: true,
  },
  size: {
    type: z.number().optional(),
    title: { en: "Result count", "zh-CN": "结果数量" },
    description: {
      en: "Number of search results to return (1–20).",
      "zh-CN": "返回的搜索结果数量（1-20）",
    },
    isToolParam: true,
  },
  includeSummary: {
    type: z.boolean().optional(),
    title: { en: "Include summary", "zh-CN": "包含摘要" },
    description: {
      en: "Whether to include AI-generated summaries in search results.",
      "zh-CN": "是否在搜索结果中包含智能摘要",
    },
    isToolParam: true,
  },
});
const metasoSearchOutputSchema = defineOutputSchema({
  result: {
    type: z.array(z.record(z.string(), z.unknown())),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "Structured results returned by Metaso search.",
      "zh-CN": "秘塔搜索返回的结构化结果",
    },
  },
});

const metasoSearchHandler = createToolHandler({
  inputSchema: metasoSearchInputSchema,
  outputSchema: metasoSearchOutputSchema,
  secretSchema: metasoSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await metasoSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await metasoSearchTool(parsedInput);
    return metasoSearchOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "metaso",
    name: {
      en: "Metaso Tool Set",
      "zh-CN": "秘塔搜索工具集",
    },
    description: {
      en: "Metaso AI search tool set, including intelligent search, Q&A and web content reading functionality",
      "zh-CN": "秘塔AI搜索工具集，包含智能搜索、问答和网页内容读取功能",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["search"],
  },
  secretSchema,
  children: [
    {
      id: "metasoSearch",
      name: {
        en: "Metaso Search",
        "zh-CN": "秘塔搜索",
      },
      description: {
        en: "Search the web with the Metaso API across multiple scopes and optionally include result summaries.",
        "zh-CN": "使用秘塔 API 进行网络搜索，支持多种搜索范围和结果摘要。",
      },
      handler: metasoSearchHandler,
    },
  ],
});

export default toolSet;
