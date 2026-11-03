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
  sources: {
    type: z.array(z.enum(["36kr", "zhihu", "weibo", "juejin", "toutiao"])),
    title: { en: "Trending sources", "zh-CN": "热榜来源" },
    description: {
      en: "Choose one or more platforms to retrieve trending news from.",
      "zh-CN": "选择一个或多个热榜来源平台。",
    },
    isToolParam: true,
  },
});
const successNewsItemSchema = defineOutputSchema({
  title: {
    type: z.string().optional(),
    title: { en: "News title", "zh-CN": "新闻标题" },
    description: {
      en: "Title of the trending news item.",
      "zh-CN": "热榜新闻标题。",
    },
  },
  description: {
    type: z.string().optional(),
    title: { en: "News description", "zh-CN": "新闻描述" },
    description: {
      en: "Description of the trending news item.",
      "zh-CN": "热榜新闻描述。",
    },
  },
  source: {
    type: z.string(),
    title: { en: "Source", "zh-CN": "来源" },
    description: {
      en: "Website or platform providing the item.",
      "zh-CN": "提供该条目的站点或平台。",
    },
  },
  time: {
    type: z.string().optional(),
    title: { en: "Published time", "zh-CN": "发布时间" },
    description: {
      en: "Publication time of the item, when available.",
      "zh-CN": "条目的发布时间（如有）。",
    },
  },
});
const errorNewsItemSchema = defineOutputSchema({
  source: {
    type: z.string(),
    title: { en: "Source", "zh-CN": "来源" },
    description: {
      en: "Website or platform that returned an error.",
      "zh-CN": "返回错误的平台或站点。",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error", "zh-CN": "错误信息" },
    description: {
      en: "Error returned while retrieving this source's trending items.",
      "zh-CN": "获取此来源热榜内容时返回的错误信息。",
    },
  },
});
const outputSchema = defineOutputSchema({
  hotNewsList: {
    type: z.array(z.union([successNewsItemSchema, errorNewsItemSchema])),
    title: { en: "Trending news list", "zh-CN": "新闻热榜列表" },
    description: {
      en: "Trending news items returned by the selected platforms.",
      "zh-CN": "所选平台返回的热榜新闻条目。",
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
    pluginId: "dailyHot",
    name: {
      en: "Hot List Tool",
      "zh-CN": "热榜工具",
    },
    description: {
      en: "Get trending news from 36kr, Zhihu, Weibo, Juejin, and Toutiao, including accurate publication times.",
      "zh-CN":
        "获取 36 氪、知乎、微博、掘金和头条等平台的热榜信息，并提供准确的发布时间。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
