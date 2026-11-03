import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  apiKey: z
    .string()
    .optional()
    .meta({
      title: "SearchInfinity API key",
      description:
        "SearchInfinity API key; choose this or Volcengine Access Key and Secret Key.",
      isSecret: true,
      "x-i18n": {
        title: {
          en: "SearchInfinity API key",
          "zh-CN": "SearchInfinity API 密钥",
        },
        description: {
          en: "SearchInfinity API key; choose this or Volcengine Access Key and Secret Key.",
          "zh-CN":
            "SearchInfinity API 密钥，与火山引擎 Access Key 和 Secret Key 二选一。",
        },
      },
    }),
  volcengineAccessKey: z
    .string()
    .optional()
    .meta({
      title: "Volcengine Access Key",
      description:
        "Access Key for Volcengine authentication; choose this together with the Secret Key instead of an API key.",
      isSecret: true,
      "x-i18n": {
        title: { en: "Volcengine Access Key", "zh-CN": "火山引擎 Access Key" },
        description: {
          en: "Access Key for Volcengine authentication; choose this together with the Secret Key instead of an API key.",
          "zh-CN":
            "火山引擎认证 Access Key，与 Secret Key 配合使用，并与 API 密钥二选一。",
        },
      },
    }),
  volcengineSecretKey: z
    .string()
    .optional()
    .meta({
      title: "Volcengine Secret Key",
      description:
        "Secret Key for Volcengine authentication; choose this together with the Access Key instead of an API key.",
      isSecret: true,
      "x-i18n": {
        title: { en: "Volcengine Secret Key", "zh-CN": "火山引擎 Secret Key" },
        description: {
          en: "Secret Key for Volcengine authentication; choose this together with the Access Key instead of an API key.",
          "zh-CN":
            "火山引擎认证 Secret Key，与 Access Key 配合使用，并与 API 密钥二选一。",
        },
      },
    }),
});
const inputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "搜索查询词" },
    description: { en: "The query to search for.", "zh-CN": "搜索查询词。" },
    isToolParam: true,
  },
  count: {
    type: z.number().optional(),
    title: { en: "Result count", "zh-CN": "结果数量" },
    description: {
      en: "Number of results to return (1–50, default 10).",
      "zh-CN": "返回结果条数，范围 1–50，默认为 10。",
    },
    isToolParam: true,
  },
  searchType: {
    type: z.enum(["web", "web_summary"]),
    title: { en: "Search type", "zh-CN": "搜索类型" },
    description: {
      en: "Search type: web or web_summary (web search with a summary).",
      "zh-CN": "搜索类型：web 或 web_summary（带总结的网页搜索）。",
    },
    isToolParam: true,
  },
  sites: {
    type: z.string().optional(),
    title: { en: "Included websites", "zh-CN": "包含网站" },
    description: {
      en: "Restrict results to up to five domains, separated by |, such as qq.com|m.163.com.",
      "zh-CN":
        "将搜索范围限定为最多 5 个域名，使用 | 分隔，例如 qq.com|m.163.com。",
    },
    isToolParam: true,
  },
  time_range: {
    type: z.enum(["OneDay", "OneWeek", "OneMonth", "OneYear"]).optional(),
    title: { en: "Time range", "zh-CN": "时间范围" },
    description: {
      en: "Restrict search results to OneDay, OneWeek, OneMonth, or OneYear.",
      "zh-CN":
        "搜索指定时间范围内的网页，支持 OneDay、OneWeek、OneMonth、OneYear。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        Title: {
          type: z.string(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the search result.",
            "zh-CN": "搜索结果标题。",
          },
        },
        Content: {
          type: z.string(),
          title: { en: "Content", "zh-CN": "内容" },
          description: {
            en: "Main content of the search result.",
            "zh-CN": "搜索结果的主要内容。",
          },
        },
        Url: {
          type: z.string().nullable().optional(),
          title: { en: "URL", "zh-CN": "链接" },
          description: {
            en: "URL of the search result, when available.",
            "zh-CN": "搜索结果链接（如有）。",
          },
        },
        SiteName: {
          type: z.string().nullable().optional(),
          title: { en: "Site name", "zh-CN": "站点名称" },
          description: {
            en: "Name of the source website, when available.",
            "zh-CN": "来源网站名称（如有）。",
          },
        },
        PublishTime: {
          type: z.string().nullable().optional(),
          title: { en: "Published at", "zh-CN": "发布时间" },
          description: {
            en: "Publication time of the result, when available.",
            "zh-CN": "结果发布时间（如有）。",
          },
        },
        LogoUrl: {
          type: z.string().nullable().optional(),
          title: { en: "Logo URL", "zh-CN": "Logo 链接" },
          description: {
            en: "Source website logo URL, when available.",
            "zh-CN": "来源网站 Logo 链接（如有）。",
          },
        },
        AuthInfoDes: {
          type: z.string().nullable().optional(),
          title: { en: "Source attribution", "zh-CN": "来源说明" },
          description: {
            en: "Source attribution text, when available.",
            "zh-CN": "来源说明文字（如有）。",
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
      en: "Error information, when available.",
      "zh-CN": "错误信息（如有）。",
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
    pluginId: "searchInfinity",
    name: {
      en: "Volcano-SearchInfinity",
      "zh-CN": "融合信息搜索",
    },
    description: {
      en: "An advanced web search plugin based on ByteDance's powerful search capabilities. Features intelligent search, website filtering, time range control, and comprehensive result formatting.",
      "zh-CN":
        "基于字节跳动强大的检索能力的高级网页搜索插件，具有智能搜索、网站过滤、时间范围控制和全面结果格式化功能。",
    },
    version: "0.2.0",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["search"],
    author: "火山引擎",
    tutorialUrl:
      "https://bytedance.larkoffice.com/wiki/IBdwwBuBAiXlclkqExDcqdMinpg",
  },
  handler,
});

export default tool;
