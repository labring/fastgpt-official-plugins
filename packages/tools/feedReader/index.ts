import {
  createToolHandler,
  defineTool,
  type InputSchemaMetaType,
  type OutputSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});

const feedItemSchema = z.object({
  title: z.string().meta({
    title: "条目标题",
    description: "订阅条目的标题",
  } satisfies OutputSchemaMetaType),
  link: z
    .string()
    .optional()
    .meta({
      title: "条目链接",
      description: "订阅条目的原文链接",
    } satisfies OutputSchemaMetaType),
  author: z
    .string()
    .optional()
    .meta({
      title: "作者",
      description: "订阅条目的作者",
    } satisfies OutputSchemaMetaType),
  publishedAt: z
    .string()
    .optional()
    .meta({
      title: "发布时间",
      description: "订阅条目的发布时间",
    } satisfies OutputSchemaMetaType),
  updatedAt: z
    .string()
    .optional()
    .meta({
      title: "更新时间",
      description: "订阅条目的更新时间",
    } satisfies OutputSchemaMetaType),
  summary: z
    .string()
    .optional()
    .meta({
      title: "摘要",
      description: "订阅条目的摘要",
    } satisfies OutputSchemaMetaType),
  content: z
    .string()
    .optional()
    .meta({
      title: "正文",
      description: "订阅条目的正文内容",
    } satisfies OutputSchemaMetaType),
  id: z
    .string()
    .optional()
    .meta({
      title: "条目 ID",
      description: "订阅条目的唯一标识",
    } satisfies OutputSchemaMetaType),
  categories: z
    .array(z.string())
    .optional()
    .meta({
      title: "分类",
      description: "订阅条目的分类标签",
    } satisfies OutputSchemaMetaType),
});

const inputSchema = z.object({
  feedUrl: z
    .string()
    .min(1)
    .meta({
      title: "订阅地址",
      description: "RSS、Atom、RDF/RSS 1.0 或 JSON Feed 订阅地址",
      toolDescription:
        "RSS、Atom、RDF/RSS 1.0 或 JSON Feed 订阅地址，支持 http、https、feed、rss、atom 协议",
    } satisfies InputSchemaMetaType),
  maxItems: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .meta({
      title: "最大条数",
      description: "最多返回的订阅条目数量，范围 1-50",
    } satisfies InputSchemaMetaType),
  includeContent: z
    .boolean()
    .default(false)
    .meta({
      title: "包含正文",
      description: "是否返回条目的完整正文内容。关闭时只返回摘要，输出更轻量",
    } satisfies InputSchemaMetaType),
});

const outputSchema = z.object({
  feed: z
    .object({
      title: z.string().meta({
        title: "订阅标题",
        description: "订阅源标题",
      } satisfies OutputSchemaMetaType),
      description: z
        .string()
        .optional()
        .meta({
          title: "订阅描述",
          description: "订阅源描述",
        } satisfies OutputSchemaMetaType),
      siteUrl: z
        .string()
        .optional()
        .meta({
          title: "站点链接",
          description: "订阅源对应的网站链接",
        } satisfies OutputSchemaMetaType),
      feedUrl: z.string().meta({
        title: "最终订阅地址",
        description: "请求重定向后的订阅地址",
      } satisfies OutputSchemaMetaType),
      language: z
        .string()
        .optional()
        .meta({
          title: "语言",
          description: "订阅源语言",
        } satisfies OutputSchemaMetaType),
      updatedAt: z
        .string()
        .optional()
        .meta({
          title: "更新时间",
          description: "订阅源更新时间",
        } satisfies OutputSchemaMetaType),
      format: z.enum(["rss", "atom", "rdf", "json-feed"]).meta({
        title: "订阅格式",
        description: "识别出的订阅协议格式",
      } satisfies OutputSchemaMetaType),
    })
    .meta({
      title: "订阅信息",
      description: "订阅源的基础信息",
    } satisfies OutputSchemaMetaType),
  items: z.array(feedItemSchema).meta({
    title: "订阅条目",
    description: "提取出的订阅条目列表",
  } satisfies OutputSchemaMetaType),
  markdown: z.string().meta({
    title: "Markdown 摘要",
    description: "订阅源和条目的 Markdown 格式摘要",
  } satisfies OutputSchemaMetaType),
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "feedReader",
    name: {
      en: "Feed Reader",
      "zh-CN": "Feed Reader 订阅读取",
    },
    description: {
      en: "Read RSS, Atom, RDF/RSS 1.0 and JSON Feed subscriptions and extract feed metadata and entries.",
      "zh-CN":
        "读取 RSS、Atom、RDF/RSS 1.0 和 JSON Feed 订阅，提取订阅源信息与条目内容。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    toolDescription:
      "Read RSS, Atom, RDF/RSS 1.0 or JSON Feed subscriptions and extract feed metadata, latest entries and a Markdown summary.",
    tags: ["news", "tools"],
  },
  handler,
});

export default tool;
