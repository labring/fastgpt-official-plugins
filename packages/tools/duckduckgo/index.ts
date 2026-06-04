import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
const searchInputSchema = z.object({
  "query": z.string().meta({
    title: "query",
    description: "检索词",
    toolDescription: "检索词"
  })
});
const searchOutputSchema = z.object({
  "result": z.string().meta({
    title: "检索结果"
  })
});
const searchHandler = createToolHandler({
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  secretSchema: searchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchInputType.parseAsync(input);
    const output = await searchTool(parsedInput, ctx);
    return searchOutputType.parseAsync(output);
  },
});

const searchImgSecretSchema = z.object({});
const searchImgInputSchema = z.object({
  "query": z.string().meta({
    title: "query",
    description: "检索词",
    toolDescription: "检索词"
  })
});
const searchImgOutputSchema = z.object({
  "result": z.string().meta({
    title: "result",
    description: " 检索结果"
  })
});
const searchImgHandler = createToolHandler({
  inputSchema: searchImgInputSchema,
  outputSchema: searchImgOutputSchema,
  secretSchema: searchImgSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchImgInputType.parseAsync(input);
    const output = await searchImgTool(parsedInput, ctx);
    return searchImgOutputType.parseAsync(output);
  },
});

const searchNewsSecretSchema = z.object({});
const searchNewsInputSchema = z.object({
  "query": z.string().meta({
    title: "query",
    description: "检索词",
    toolDescription: "检索词"
  })
});
const searchNewsOutputSchema = z.object({
  "result": z.string().meta({
    title: "result",
    description: " 检索结果"
  })
});
const searchNewsHandler = createToolHandler({
  inputSchema: searchNewsInputSchema,
  outputSchema: searchNewsOutputSchema,
  secretSchema: searchNewsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchNewsInputType.parseAsync(input);
    const output = await searchNewsTool(parsedInput, ctx);
    return searchNewsOutputType.parseAsync(output);
  },
});

const searchVideoSecretSchema = z.object({});
const searchVideoInputSchema = z.object({
  "query": z.string().meta({
    title: "query",
    description: "检索词",
    toolDescription: "检索词"
  })
});
const searchVideoOutputSchema = z.object({
  "result": z.string().meta({
    title: "result",
    description: " 检索结果"
  })
});
const searchVideoHandler = createToolHandler({
  inputSchema: searchVideoInputSchema,
  outputSchema: searchVideoOutputSchema,
  secretSchema: searchVideoSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchVideoInputType.parseAsync(input);
    const output = await searchVideoTool(parsedInput, ctx);
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
      "zh-CN": "Initial version",
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
