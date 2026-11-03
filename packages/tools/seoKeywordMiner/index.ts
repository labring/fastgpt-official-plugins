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
    title: "5118 API key",
    description:
      "Get an API key from the 5118 console. Documentation: https://www.5118.com/apistore/detail/8cf3d6ed-2b12-ed11-8da8-e43d1a103141/-1",
    isSecret: true,
    "x-i18n": {
      title: { en: "5118 API key", "zh-CN": "5118 API Key" },
      description: {
        en: "Get an API key from the 5118 console. See the documentation URL.",
        "zh-CN": "在 5118 控制台获取 API Key，详见文档链接。",
      },
    },
  }),
});
const inputSchema = defineInputSchema({
  keyword: {
    type: z.string(),
    title: { en: "Seed keyword", "zh-CN": "种子关键词" },
    description: {
      en: "Enter the keyword to research.",
      "zh-CN": "输入要挖掘的关键词。",
    },
    isToolParam: true,
  },
  pageIndex: {
    type: z.number().optional(),
    title: { en: "Page number", "zh-CN": "页码" },
    description: {
      en: "Current page; defaults to page 1.",
      "zh-CN": "当前页码，默认第 1 页。",
    },
    isToolParam: true,
  },
  pageSize: {
    type: z.number().optional(),
    title: { en: "Results per page", "zh-CN": "每页数量" },
    description: {
      en: "Number of results per page, up to 100 (default 100).",
      "zh-CN": "每页返回数量，最多 100 条，默认 100 条。",
    },
    isToolParam: true,
  },
  sortFields: {
    type: z.number().optional(),
    title: { en: "Sort field", "zh-CN": "排序字段" },
    description: {
      en: "Sort field: 2 bidding companies, 3 long-tail keywords, 4 traffic index, 5 Baidu mobile index, 6 360 index, 7 PC daily searches, 8 mobile daily searches, 9 competition level.",
      "zh-CN":
        "排序字段：2 竞价公司数量、3 长尾词数量、4 流量指数、5 百度移动指数、6 360 好搜指数、7 PC 日检索量、8 移动日检索量、9 竞争激烈程度。",
    },
    isToolParam: true,
  },
  sortType: {
    type: z.enum(["asc", "desc"]).optional(),
    title: { en: "Sort order", "zh-CN": "排序方式" },
    description: {
      en: "Ascending (asc) or descending (desc).",
      "zh-CN": "升序或降序（asc：升序，desc：降序）。",
    },
    isToolParam: true,
  },
  filter: {
    type: z.number().optional(),
    title: { en: "Quick filter", "zh-CN": "快捷过滤" },
    description: {
      en: "Filter by keyword category: 1 all, 2 all traffic terms, 3 traffic index, 4 mobile index, 5 360 index, 6 traffic features, 7 PC searches, 8 mobile searches, 9 terms with bidding.",
      "zh-CN":
        "过滤条件：1 所有词、2 所有流量词、3 流量指数词、4 移动指数词、5 360 指数词、6 流量特点词、7 PC 日检索量词、8 移动日检索量、9 存在竞价的词。",
    },
    isToolParam: true,
  },
  filterDate: {
    type: z.string().optional(),
    title: { en: "Filter date", "zh-CN": "筛选日期" },
    description: {
      en: "Optional date filter in yyyy-MM-dd format.",
      "zh-CN": "可选筛选日期，格式为 yyyy-MM-dd。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  keywords: {
    type: z.string(),
    title: { en: "Keywords", "zh-CN": "关键词列表" },
    description: {
      en: "Related keywords and their data in JSON format.",
      "zh-CN": "挖掘到的相关关键词及其数据（JSON 格式）。",
    },
  },
  total: {
    type: z.number(),
    title: { en: "Total count", "zh-CN": "总数量" },
    description: {
      en: "Total number of keywords found.",
      "zh-CN": "找到的关键词总数。",
    },
  },
  pageCount: {
    type: z.number(),
    title: { en: "Total pages", "zh-CN": "总页数" },
    description: { en: "Total number of pages.", "zh-CN": "分页总页数。" },
  },
  pageIndex: {
    type: z.number(),
    title: { en: "Current page", "zh-CN": "当前页码" },
    description: { en: "Page number returned.", "zh-CN": "当前返回的页码。" },
  },
  pageSize: {
    type: z.number(),
    title: { en: "Results per page", "zh-CN": "每页数量" },
    description: {
      en: "Number of keywords returned per page.",
      "zh-CN": "每页返回的关键词数量。",
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
    pluginId: "seoKeywordMiner",
    name: {
      en: "SEO Keyword Miner",
      "zh-CN": "SEO关键词挖掘工具",
    },
    description: {
      en: "Massive long-tail keyword mining tool based on 5118 API,获取 keyword search volume and index data",
      "zh-CN":
        "基于5118 API的海量长尾关键词挖掘工具，获取关键词搜索量和指数数据",
    },
    version: "1.0.0",
    versionDescription: {
      en: "5118 SEO关键词挖掘",
      "zh-CN": "5118 SEO关键词挖掘",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
