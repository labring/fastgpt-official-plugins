import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as scrapeInputType,
  OutputType as scrapeOutputType,
  tool as scrapeTool,
} from "./children/scrape";

const secretSchema = z.object({
  "apiUrl": z.string().optional().meta({
    title: "Firecrawl API Url",
    description: "Firecrawl 的 API 地址，如果使用官方的服务，这里可以留空。"
  }),
  "apiKey": z.string().meta({
    title: "Firecrawl API Key"
  })
});
const scrapeSecretSchema = z.object({});
const scrapeInputSchema = z.object({
  "url": z.string().meta({
    title: "Url",
    toolDescription: "The URL of the webpage to scrape"
  }),
  "format": z.enum(["markdown","html"]).meta({
    title: "返回格式"
  }),
  "faster": z.boolean().optional().meta({
    title: "快速模式"
  })
});
const scrapeOutputSchema = z.object({
  "result": z.string().meta({
    title: "抓取结果"
  })
});
const scrapeHandler = createToolHandler({
  inputSchema: scrapeInputSchema,
  outputSchema: scrapeOutputSchema,
  secretSchema: scrapeSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await scrapeInputType.parseAsync(input);
    const output = await scrapeTool(parsedInput, ctx);
    return scrapeOutputType.parseAsync(output);
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
      en: "Web scraper for LLMs. Power your AI apps with clean data crawled from any website. It's also open source. ",
      "zh-CN": "使用从任何网站抓取的干净数据为您的AI应用程序提供动力。",
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
  ],
});

export default toolSet;
