import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});

const feedItemSchema = defineOutputSchema({
  title: {
    type: z.string(),
    title: { en: "Entry title", "zh-CN": "条目标题" },
    description: {
      en: "Title of the feed entry.",
      "zh-CN": "订阅条目的标题。",
    },
  },
  link: {
    type: z.string().optional(),
    title: { en: "Entry link", "zh-CN": "条目链接" },
    description: {
      en: "Original link to the feed entry.",
      "zh-CN": "订阅条目的原文链接。",
    },
  },
  author: {
    type: z.string().optional(),
    title: { en: "Author", "zh-CN": "作者" },
    description: {
      en: "Author of the feed entry.",
      "zh-CN": "订阅条目的作者。",
    },
  },
  publishedAt: {
    type: z.string().optional(),
    title: { en: "Published at", "zh-CN": "发布时间" },
    description: {
      en: "Publication time of the feed entry.",
      "zh-CN": "订阅条目的发布时间。",
    },
  },
  updatedAt: {
    type: z.string().optional(),
    title: { en: "Updated at", "zh-CN": "更新时间" },
    description: {
      en: "Last update time of the feed entry.",
      "zh-CN": "订阅条目的更新时间。",
    },
  },
  summary: {
    type: z.string().optional(),
    title: { en: "Summary", "zh-CN": "摘要" },
    description: {
      en: "Summary of the feed entry.",
      "zh-CN": "订阅条目的摘要。",
    },
  },
  content: {
    type: z.string().optional(),
    title: { en: "Content", "zh-CN": "正文" },
    description: {
      en: "Full content of the feed entry.",
      "zh-CN": "订阅条目的正文内容。",
    },
  },
  id: {
    type: z.string().optional(),
    title: { en: "Entry ID", "zh-CN": "条目 ID" },
    description: {
      en: "Unique identifier of the feed entry.",
      "zh-CN": "订阅条目的唯一标识。",
    },
  },
  categories: {
    type: z.array(z.string()).optional(),
    title: { en: "Categories", "zh-CN": "分类" },
    description: {
      en: "Category labels for the feed entry.",
      "zh-CN": "订阅条目的分类标签。",
    },
  },
});

const inputSchema = defineInputSchema({
  feedUrl: {
    type: z.string().min(1),
    title: { en: "Feed URL", "zh-CN": "订阅地址" },
    description: {
      en: "RSS, Atom, RDF/RSS 1.0, or JSON Feed URL. Supports http, https, feed, rss, and atom protocols.",
      "zh-CN":
        "RSS、Atom、RDF/RSS 1.0 或 JSON Feed 订阅地址，支持 http、https、feed、rss、atom 协议。",
    },
    isToolParam: true,
  },
  maxItems: {
    type: z.number().int().min(1).max(50).default(10),
    title: { en: "Maximum items", "zh-CN": "最大条数" },
    description: {
      en: "Maximum number of entries to return (1–50).",
      "zh-CN": "最多返回的订阅条目数量，范围 1-50。",
    },
    isToolParam: true,
  },
  includeContent: {
    type: z.boolean().default(false),
    title: { en: "Include content", "zh-CN": "包含正文" },
    description: {
      en: "Whether to return full entry content. When disabled, only summaries are returned.",
      "zh-CN": "是否返回条目的完整正文内容。关闭时只返回摘要，输出更轻量。",
    },
    isToolParam: true,
  },
});

const outputSchema = defineOutputSchema({
  feed: {
    type: defineOutputSchema({
      title: {
        type: z.string(),
        title: { en: "Feed title", "zh-CN": "订阅标题" },
        description: { en: "Title of the feed.", "zh-CN": "订阅源标题。" },
      },
      description: {
        type: z.string().optional(),
        title: { en: "Feed description", "zh-CN": "订阅描述" },
        description: {
          en: "Description of the feed.",
          "zh-CN": "订阅源描述。",
        },
      },
      siteUrl: {
        type: z.string().optional(),
        title: { en: "Website URL", "zh-CN": "站点链接" },
        description: {
          en: "Website associated with the feed.",
          "zh-CN": "订阅源对应的网站链接。",
        },
      },
      feedUrl: {
        type: z.string(),
        title: { en: "Resolved feed URL", "zh-CN": "最终订阅地址" },
        description: {
          en: "Feed URL after redirects.",
          "zh-CN": "请求重定向后的订阅地址。",
        },
      },
      language: {
        type: z.string().optional(),
        title: { en: "Language", "zh-CN": "语言" },
        description: { en: "Language of the feed.", "zh-CN": "订阅源语言。" },
      },
      updatedAt: {
        type: z.string().optional(),
        title: { en: "Updated at", "zh-CN": "更新时间" },
        description: {
          en: "Last update time of the feed.",
          "zh-CN": "订阅源更新时间。",
        },
      },
      format: {
        type: z.enum(["rss", "atom", "rdf", "json-feed"]),
        title: { en: "Feed format", "zh-CN": "订阅格式" },
        description: {
          en: "Detected feed protocol format.",
          "zh-CN": "识别出的订阅协议格式。",
        },
      },
    }),
    title: { en: "Feed information", "zh-CN": "订阅信息" },
    description: {
      en: "Basic information about the feed.",
      "zh-CN": "订阅源的基础信息。",
    },
  },
  items: {
    type: z.array(feedItemSchema),
    title: { en: "Feed entries", "zh-CN": "订阅条目" },
    description: {
      en: "Extracted entries from the feed.",
      "zh-CN": "提取出的订阅条目列表。",
    },
  },
  markdown: {
    type: z.string(),
    title: { en: "Markdown summary", "zh-CN": "Markdown 摘要" },
    description: {
      en: "Markdown summary of the feed and its entries.",
      "zh-CN": "订阅源和条目的 Markdown 格式摘要。",
    },
  },
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
      en: "Read RSS, Atom, RDF/RSS 1.0, and JSON Feed subscriptions; extract feed metadata and recent entries, and provide a Markdown summary.",
      "zh-CN":
        "读取 RSS、Atom、RDF/RSS 1.0 和 JSON Feed 订阅，提取订阅源信息与最新条目，并生成 Markdown 摘要。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["news", "tools"],
  },
  handler,
});

export default tool;
