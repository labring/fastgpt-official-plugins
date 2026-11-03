import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "Bocha API key",
    description: "Bocha API key for authenticating search requests.",
    "x-i18n": {
      title: { en: "Bocha API key", "zh-CN": "博查 API 密钥" },
      description: {
        en: "Bocha API key for authenticating search requests.",
        "zh-CN": "用于验证搜索请求的博查 API 密钥。",
      },
    },
    isSecret: true,
  }),
});
const inputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "搜索查询词" },
    description: {
      en: "Terms to search for on the web.",
      "zh-CN": "用于网页搜索的查询词。",
    },
    isToolParam: true,
  },
  freshness: {
    type: z
      .enum(["noLimit", "oneDay", "oneWeek", "oneMonth", "oneYear"])
      .optional(),
    title: { en: "Time range", "zh-CN": "时间范围" },
    description: {
      en: "Limit results to a time range.",
      "zh-CN": "搜索指定时间范围内的网页。",
    },
    isToolParam: true,
  },
  summary: {
    type: z.boolean().optional(),
    title: { en: "Include summaries", "zh-CN": "显示摘要" },
    description: {
      en: "Whether to include text summaries.",
      "zh-CN": "是否显示文本摘要。",
    },
    isToolParam: true,
  },
  include: {
    type: z.string().optional(),
    title: { en: "Include websites", "zh-CN": "包含网站" },
    description: {
      en: "Restrict search to up to 20 sites; separate domains with | or commas, e.g. qq.com|m.163.com.",
      "zh-CN":
        "指定搜索的 site 范围。多个域名使用 | 或逗号分隔，最多 20 个，例如：qq.com|m.163.com。",
    },
    isToolParam: true,
  },
  exclude: {
    type: z.string().optional(),
    title: { en: "Exclude websites", "zh-CN": "排除网站" },
    description: {
      en: "Exclude up to 20 sites; separate domains with | or commas, e.g. qq.com|m.163.com.",
      "zh-CN":
        "排除搜索的网站范围。多个域名使用 | 或逗号分隔，最多 20 个，例如：qq.com|m.163.com。",
    },
    isToolParam: true,
  },
  count: {
    type: z.number().optional(),
    title: { en: "Result count", "zh-CN": "结果数量" },
    description: {
      en: "Number of results to return (1–50; defaults to 10).",
      "zh-CN": "返回结果的条数。可填范围：1-50，默认为 10。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        id: {
          type: z.string().nullable().optional(),
          title: { en: "Result ID", "zh-CN": "结果 ID" },
          description: {
            en: "Identifier of the search result, when available.",
            "zh-CN": "搜索结果标识（如有）。",
          },
        },
        name: {
          type: z.string().nullable().optional(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the search result, when available.",
            "zh-CN": "搜索结果标题（如有）。",
          },
        },
        url: {
          type: z.string().nullable().optional(),
          title: { en: "URL", "zh-CN": "链接" },
          description: {
            en: "URL of the search result, when available.",
            "zh-CN": "搜索结果链接（如有）。",
          },
        },
        snippet: {
          type: z.string().nullable().optional(),
          title: { en: "Snippet", "zh-CN": "摘要" },
          description: {
            en: "Text snippet from the search result, when available.",
            "zh-CN": "搜索结果文本摘要（如有）。",
          },
        },
        dateLastCrawled: {
          type: z.string().nullable().optional(),
          title: { en: "Last crawled", "zh-CN": "最近抓取时间" },
          description: {
            en: "Last crawl date, when available.",
            "zh-CN": "最近抓取时间（如有）。",
          },
        },
        language: {
          type: z.string().nullable().optional(),
          title: { en: "Language", "zh-CN": "语言" },
          description: {
            en: "Result language, when available.",
            "zh-CN": "结果语言（如有）。",
          },
        },
        isNavigational: {
          type: z.boolean().nullable().optional(),
          title: { en: "Navigational result", "zh-CN": "导航结果" },
          description: {
            en: "Whether the result is navigational, when available.",
            "zh-CN": "该结果是否为导航结果（如有）。",
          },
        },
      }),
    ),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "List of results returned by the search.",
      "zh-CN": "搜索返回的结果列表。",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error", "zh-CN": "错误信息" },
    description: {
      en: "Error message, if any.",
      "zh-CN": "发生错误时返回的错误信息。",
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
    pluginId: "bocha",
    name: {
      en: "Bocha Search",
      "zh-CN": "博查搜索",
    },
    description: {
      en: "Use Bocha AI search engine for web search.",
      "zh-CN": "使用博查AI搜索引擎进行网络搜索。",
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
