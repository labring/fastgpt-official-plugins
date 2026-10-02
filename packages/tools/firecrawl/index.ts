import {
  createToolHandler,
  defineToolSet,
  type InputSchemaMetaType,
  type OutputSchemaMetaType,
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
  apiUrl: z.string().optional().meta({
    title: "Firecrawl API Url",
    description: "Firecrawl 的 API 地址，如果使用官方的服务，这里可以留空。",
  }),
  apiKey: z.string().meta({
    title: "Firecrawl API Key",
    isSecret: true,
  }),
});
const scrapeSecretSchema = z.object({});
const scrapeInputSchema = z.object({
  url: z.string().meta({
    title: "Url",
    toolDescription: "The URL of the webpage to scrape",
  }),
  format: z.enum(["markdown", "html"]).meta({
    title: "返回格式",
  }),
  faster: z.boolean().optional().meta({
    title: "快速模式",
  }),
});
const scrapeOutputSchema = z.object({
  result: z.string().meta({
    title: "抓取结果",
  }),
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
    const output = await scrapeTool(parsedInput, ctx);
    return scrapeOutputType.parseAsync(output);
  },
});
const searchSecretSchema = z.object({});
const searchInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .meta({
      title: "搜索内容",
      description: "要搜索的内容",
      toolDescription: "The search query",
    } satisfies InputSchemaMetaType),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .meta({
      title: "结果数量",
      description: "返回的最大结果数量，范围 1-20，默认 5",
      toolDescription: "Maximum number of results to return (1-20, default 5)",
    } satisfies InputSchemaMetaType),
  includeContent: z
    .boolean()
    .optional()
    .meta({
      title: "包含页面内容",
      description: "是否同时返回每个结果页面的 Markdown 内容",
      toolDescription: "Whether to also return each result page as markdown",
    } satisfies InputSchemaMetaType),
});
const searchOutputSchema = z.object({
  results: z.array(SearchResultType).meta({
    title: "搜索结果",
    description:
      "每条结果包含 url（链接）、title（标题）、description（摘要）；开启“包含页面内容”后还包含 markdown",
  } satisfies OutputSchemaMetaType),
});
const searchHandler = createToolHandler({
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  secretSchema: searchSecretSchema,
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
      en: "The context API to search, scrape, and interact with the web at scale. Search the web and turn any page into clean markdown or HTML for your AI apps.",
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
