import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as scrapeInputType,
  OutputType as scrapeOutputType,
  tool as scrapeTool,
} from "./children/scrape";
import {
  SearchResultType,
  InputType as searchInputType,
  OutputType as searchOutputType,
  tool as searchTool,
} from "./children/search";

const secretSchema = z.object({
  apiUrl: z
    .string()
    .optional()
    .meta({
      title: "Firecrawl API 地址",
      description: "Firecrawl 的 API 地址；使用官方服务时可留空。",
      "x-i18n": {
        title: { en: "Firecrawl API URL", "zh-CN": "Firecrawl API 地址" },
        description: {
          en: "Firecrawl API URL; leave empty to use the official service.",
          "zh-CN": "Firecrawl 的 API 地址；使用官方服务时可留空。",
        },
      },
      isSecret: false,
    }),
  apiKey: z.string().meta({
    title: "Firecrawl API Key",
    description: "Firecrawl API 密钥",
    "x-i18n": {
      title: { en: "Firecrawl API key", "zh-CN": "Firecrawl API 密钥" },
      description: {
        en: "API key for authenticating with Firecrawl.",
        "zh-CN": "用于 Firecrawl 身份验证的 API 密钥。",
      },
    },
    isSecret: true,
  }),
});
const scrapeSecretSchema = z.object({});
const scrapeInputSchema = defineInputSchema({
  url: {
    type: z.string(),
    title: { en: "Webpage URL", "zh-CN": "网页链接" },
    description: {
      en: "URL of the webpage to scrape.",
      "zh-CN": "要抓取的网页 URL。",
    },
    isToolParam: true,
  },
  format: {
    type: z.enum(["markdown", "html"]),
    title: { en: "Output format", "zh-CN": "返回格式" },
    description: {
      en: "Format for the scraped page content.",
      "zh-CN": "抓取网页内容的输出格式。",
    },
    isToolParam: true,
  },
  faster: {
    type: z.boolean().optional(),
    title: { en: "Fast mode", "zh-CN": "快速模式" },
    description: {
      en: "Whether to use faster scraping mode.",
      "zh-CN": "是否使用快速抓取模式。",
    },
    isToolParam: true,
  },
});
const scrapeOutputSchema = defineOutputSchema({
  result: {
    type: z.string(),
    title: { en: "Scrape result", "zh-CN": "抓取结果" },
    description: {
      en: "Scraped webpage content.",
      "zh-CN": "抓取到的网页内容。",
    },
  },
});
const scrapeHandler = createToolHandler({
  inputSchema: scrapeInputSchema,
  outputSchema: scrapeOutputSchema,
  secretSchema: scrapeSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await scrapeInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await scrapeTool(parsedInput);
    return scrapeOutputType.parseAsync(output);
  },
});

const searchInputSchema = defineInputSchema({
  query: {
    type: z.string().min(1),
    title: { en: "Search query", "zh-CN": "搜索内容" },
    description: {
      en: "Keywords or a question to search the web for.",
      "zh-CN": "要在网页中搜索的关键词或问题。",
    },
    isToolParam: true,
  },
  limit: {
    type: z.number().int().min(1).max(20).optional(),
    title: { en: "Result limit", "zh-CN": "结果数量" },
    description: {
      en: "Maximum number of results to return, from 1 to 20; defaults to 5.",
      "zh-CN": "返回结果的最大数量，范围为 1 到 20，默认值为 5。",
    },
    isToolParam: true,
  },
  includeContent: {
    type: z.boolean().optional(),
    title: { en: "Include page content", "zh-CN": "包含页面内容" },
    description: {
      en: "Also return Markdown content for each result page.",
      "zh-CN": "同时返回每条结果页面的 Markdown 内容。",
    },
    isToolParam: true,
  },
});
const searchOutputSchema = defineOutputSchema({
  results: {
    type: z.array(SearchResultType),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "Matching pages with URLs, titles, descriptions, and optional Markdown.",
      "zh-CN": "匹配页面列表，包含链接、标题、摘要和可选的 Markdown 内容。",
    },
  },
});
const searchHandler = createToolHandler({
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await searchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await searchTool(parsedInput);
    return searchOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "firecrawl",
    name: {
      en: "Firecrawl",
      "zh-CN": "Firecrawl",
    },
    description: {
      en: "The context API to search, scrape, and interact with the web at scale. Search the web and turn any page into clean Markdown or HTML for your AI apps.",
      "zh-CN":
        "面向 AI 的网页上下文 API：搜索网页，并将任意页面转换为干净的 Markdown 或 HTML。",
    },
    version: "0.0.2",
    versionDescription: {
      en: "Add a web search tool and update the plugin description",
      "zh-CN": "新增网页搜索工具，并更新插件描述",
    },
    tags: ["search"],
  },
  secretSchema,
  children: [
    {
      id: "scrape",
      name: {
        en: "Scrape web content",
        "zh-CN": "抓取网页内容",
      },
      description: {
        en: "Scrape clean data from any website.",
        "zh-CN": "从任何网站抓取干净的数据。",
      },
      handler: scrapeHandler,
    },

    {
      id: "search",
      name: {
        en: "Search the web",
        "zh-CN": "搜索网页",
      },
      description: {
        en: "Search the web and get the url, title and description of each result, optionally with the page content as markdown.",
        "zh-CN":
          "搜索网页，返回每条结果的链接、标题和摘要，可选附带页面 Markdown 内容。",
      },
      handler: searchHandler,
    },
  ],
});

export default toolSet;
