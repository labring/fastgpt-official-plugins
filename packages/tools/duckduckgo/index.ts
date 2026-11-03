import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as searchInputType,
  OutputType as searchOutputType,
  tool as searchTool,
} from "./children/search";
import {
  InputType as searchImgInputType,
  OutputType as searchImgOutputType,
  tool as searchImgTool,
} from "./children/searchImg";
import {
  InputType as searchNewsInputType,
  OutputType as searchNewsOutputType,
  tool as searchNewsTool,
} from "./children/searchNews";
import {
  InputType as searchVideoInputType,
  OutputType as searchVideoOutputType,
  tool as searchVideoTool,
} from "./children/searchVideo";

const secretSchema = z.object({});
const searchSecretSchema = z.object({});
const searchInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "检索词" },
    description: { en: "Terms to search for.", "zh-CN": "要检索的关键词。" },
    isToolParam: true,
  },
});
const searchOutputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "Search results", "zh-CN": "检索结果" },
    description: {
      en: "Results returned by the web search.",
      "zh-CN": "网页搜索返回的结果。",
    },
  },
});
const searchHandler = createToolHandler({
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  secretSchema: searchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchInputType.parseAsync(input);
    const output = await searchTool(parsedInput);
    return searchOutputType.parseAsync(output);
  },
});

const searchImgSecretSchema = z.object({});
const searchImgInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Image search query", "zh-CN": "图片检索词" },
    description: {
      en: "Terms to search for images.",
      "zh-CN": "用于搜索图片的关键词。",
    },
    isToolParam: true,
  },
});
const searchImgOutputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "Image search results", "zh-CN": "图片检索结果" },
    description: {
      en: "Results returned by the image search.",
      "zh-CN": "图片搜索返回的结果。",
    },
  },
});
const searchImgHandler = createToolHandler({
  inputSchema: searchImgInputSchema,
  outputSchema: searchImgOutputSchema,
  secretSchema: searchImgSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchImgInputType.parseAsync(input);
    const output = await searchImgTool(parsedInput);
    return searchImgOutputType.parseAsync(output);
  },
});

const searchNewsSecretSchema = z.object({});
const searchNewsInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "News search query", "zh-CN": "新闻检索词" },
    description: {
      en: "Terms to search for news.",
      "zh-CN": "用于搜索新闻的关键词。",
    },
    isToolParam: true,
  },
});
const searchNewsOutputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "News search results", "zh-CN": "新闻检索结果" },
    description: {
      en: "Results returned by the news search.",
      "zh-CN": "新闻搜索返回的结果。",
    },
  },
});
const searchNewsHandler = createToolHandler({
  inputSchema: searchNewsInputSchema,
  outputSchema: searchNewsOutputSchema,
  secretSchema: searchNewsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchNewsInputType.parseAsync(input);
    const output = await searchNewsTool(parsedInput);
    return searchNewsOutputType.parseAsync(output);
  },
});

const searchVideoSecretSchema = z.object({});
const searchVideoInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Video search query", "zh-CN": "视频检索词" },
    description: {
      en: "Terms to search for videos.",
      "zh-CN": "用于搜索视频的关键词。",
    },
    isToolParam: true,
  },
});
const searchVideoOutputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "Video search results", "zh-CN": "视频检索结果" },
    description: {
      en: "Results returned by the video search.",
      "zh-CN": "视频搜索返回的结果。",
    },
  },
});
const searchVideoHandler = createToolHandler({
  inputSchema: searchVideoInputSchema,
  outputSchema: searchVideoOutputSchema,
  secretSchema: searchVideoSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchVideoInputType.parseAsync(input);
    const output = await searchVideoTool(parsedInput);
    return searchVideoOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "duckduckgo",
    name: {
      en: "DuckDuckGo Service",
      "zh-CN": "DuckDuckGo服务",
    },
    description: {
      en: "DuckDuckGo Service, including network search, image search, news search, etc.",
      "zh-CN": "DuckDuckGo 服务，包含网络搜索、图片搜索、新闻搜索等。",
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
      id: "search",
      name: {
        en: "DuckDuckGo Network Search",
        "zh-CN": "DuckDuckGo 网络搜索",
      },
      description: {
        en: "Use DuckDuckGo to search the web",
        "zh-CN": "使用 DuckDuckGo 进行网络搜索",
      },
      handler: searchHandler,
    },
    {
      id: "searchImg",
      name: {
        en: "DockDuckGo Image Search",
        "zh-CN": "DuckDuckGo 图片搜索",
      },
      description: {
        en: "Use DuckDuckGo to search images",
        "zh-CN": "使用 DuckDuckGo 进行图片搜索",
      },
      handler: searchImgHandler,
    },
    {
      id: "searchNews",
      name: {
        en: "DockDuckGo News Search",
        "zh-CN": "DuckDuckGo 新闻检索",
      },
      description: {
        en: "Use DuckDuckGo to search news",
        "zh-CN": "使用 DuckDuckGo 进行新闻检索",
      },
      handler: searchNewsHandler,
    },
    {
      id: "searchVideo",
      name: {
        en: "DockDuckGo Video Search",
        "zh-CN": "DuckDuckGo 视频检索",
      },
      description: {
        en: "Use DuckDuckGo to search videos",
        "zh-CN": "使用 DuckDuckGo 进行视频检索",
      },
      handler: searchVideoHandler,
    },
  ],
});

export default toolSet;
