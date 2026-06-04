import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as crawlInputType,
  OutputType as crawlOutputType,
  tool as crawlTool,
} from "./children/crawl";
import {
  InputType as extractInputType,
  OutputType as extractOutputType,
  tool as extractTool,
} from "./children/extract";
import {
  InputType as mapInputType,
  OutputType as mapOutputType,
  tool as mapTool,
} from "./children/map";
import {
  InputType as searchInputType,
  OutputType as searchOutputType,
  tool as searchTool,
} from "./children/search";

const secretSchema = z.object({
  "tavilyApiKey": z.string().meta({
    title: "Tavily API Key",
    description: "Tavily API 密钥 (格式: tvly-xxxxxxxxxxxxxxxxxxxxxxxx), 在 https://app.tavily.com 获取",
    isSecret: true,
  })
});
const crawlSecretSchema = z.object({});
const crawlInputSchema = z.object({
  "url": z.string().meta({
    title: "起始 URL",
    description: "开始爬取的根 URL",
    toolDescription: "The root URL to begin the crawl"
  }),
  "instructions": z.string().optional().meta({
    title: "爬取指令",
    description: "自然语言指令，指导爬虫查找特定内容（使用会增加成本）",
    toolDescription: "Natural language instructions for the crawler"
  }),
  "maxDepth": z.number().optional().meta({
    title: "最大深度",
    description: "爬取的最大深度（1-5）",
    toolDescription: "Max depth of the crawl"
  }),
  "maxBreadth": z.number().optional().meta({
    title: "最大广度",
    description: "每层跟随的最大链接数",
    toolDescription: "Max number of links to follow per level"
  }),
  "limit": z.number().optional().meta({
    title: "总限制",
    description: "处理的总链接数上限",
    toolDescription: "Total number of links to process"
  }),
  "selectPaths": z.string().optional().meta({
    title: "包含路径",
    description: "正则表达式模式，选择特定路径（每行一个）",
    toolDescription: "Regex patterns to select specific path patterns"
  }),
  "excludePaths": z.string().optional().meta({
    title: "排除路径",
    description: "正则表达式模式，排除特定路径（每行一个）",
    toolDescription: "Regex patterns to exclude specific path patterns"
  }),
  "allowExternal": z.boolean().optional().meta({
    title: "允许外部链接",
    description: "是否在结果中包含外部域链接",
    toolDescription: "Whether to include external domain links"
  }),
  "includeImages": z.boolean().optional().meta({
    title: "包含图片",
    description: "是否在爬取结果中包含图片",
    toolDescription: "Whether to include images in the crawl results"
  }),
  "extractDepth": z.enum(["basic","advanced"]).optional().meta({
    title: "提取深度",
    description: "基础提取（1 credit/5 pages）或高级提取（2 credits/5 pages）"
  }),
  "format": z.enum(["markdown","text"]).optional().meta({
    title: "输出格式",
    description: "内容输出格式"
  }),
  "includeFavicon": z.boolean().optional().meta({
    title: "包含图标",
    description: "是否为每个结果包含 favicon URL",
    toolDescription: "Whether to include the favicon URL for each result"
  }),
  "timeout": z.number().optional().meta({
    title: "超时时间（秒）",
    description: "爬取操作的最大等待时间（10-150秒）",
    toolDescription: "Maximum time in seconds to wait before timing out"
  })
});
const crawlOutputSchema = z.object({
  "baseUrl": z.string().meta({
    title: "基础 URL",
    description: "被爬取的基础 URL"
  }),
  "results": z.array(z.record(z.string(), z.unknown())).meta({
    title: "爬取结果",
    description: "从爬取 URL 中提取的内容列表"
  }),
  "successCount": z.number().meta({
    title: "成功数量",
    description: "成功爬取的页面数量"
  }),
  "responseTime": z.number().meta({
    title: "响应时间",
    description: "完成请求所花费的时间（秒）"
  })
});
const crawlHandler = createToolHandler({
  inputSchema: crawlInputSchema,
  outputSchema: crawlOutputSchema,
  secretSchema: crawlSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await crawlInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await crawlTool(parsedInput);
    return crawlOutputType.parseAsync(output);
  },
});

const extractSecretSchema = z.object({});
const extractInputSchema = z.object({
  "urls": z.string().meta({
    title: "URL 地址",
    description: "单个或多个 URL (多个用换行分隔)",
    toolDescription: "Single URL or multiple URLs (one per line)"
  }),
  "extract_depth": z.enum(["basic","advanced"]).optional().meta({
    title: "提取深度"
  }),
  "format": z.enum(["markdown","text"]).optional().meta({
    title: "输出格式",
    description: "内容输出格式"
  }),
  "include_images": z.boolean().optional().meta({
    title: "包含图片"
  }),
  "include_favicon": z.boolean().optional().meta({
    title: "包含 favicon"
  }),
  "timeout": z.number().optional().meta({
    title: "超时时间（秒）",
    description: "最大等待时间（1-60秒），根据提取深度设置默认值",
    toolDescription: "Maximum time in seconds to wait before timing out (1-60)"
  })
});
const extractOutputSchema = z.object({
  "results": z.array(z.record(z.string(), z.unknown())).meta({
    title: "提取结果",
    description: "成功提取的内容数组"
  }),
  "successCount": z.number().meta({
    title: "成功数量",
    description: "成功提取的 URL 数量"
  }),
  "failedUrls": z.array(z.string()).meta({
    title: "失败列表",
    description: "提取失败的 URL 及原因"
  })
});
const extractHandler = createToolHandler({
  inputSchema: extractInputSchema,
  outputSchema: extractOutputSchema,
  secretSchema: extractSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await extractInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await extractTool(parsedInput);
    return extractOutputType.parseAsync(output);
  },
});

const mapSecretSchema = z.object({});
const mapInputSchema = z.object({
  "url": z.string().meta({
    title: "起始 URL",
    description: "开始映射的根 URL",
    toolDescription: "The root URL to begin the mapping"
  }),
  "instructions": z.string().optional().meta({
    title: "映射指令",
    description: "自然语言指令，指导映射器查找特定内容（使用会增加成本）",
    toolDescription: "Natural language instructions for the crawler"
  }),
  "maxDepth": z.number().optional().meta({
    title: "最大深度",
    description: "映射的最大深度（1-5）",
    toolDescription: "Max depth of the mapping"
  }),
  "maxBreadth": z.number().optional().meta({
    title: "最大广度",
    description: "每层跟随的最大链接数",
    toolDescription: "Max number of links to follow per level"
  }),
  "limit": z.number().optional().meta({
    title: "总限制",
    description: "处理的总链接数上限",
    toolDescription: "Total number of links to process"
  }),
  "selectPaths": z.string().optional().meta({
    title: "包含路径",
    description: "正则表达式模式，选择特定路径（每行一个）",
    toolDescription: "Regex patterns to select specific path patterns"
  }),
  "selectDomains": z.string().optional().meta({
    title: "包含域名",
    description: "正则表达式模式，选择特定域名或子域名（每行一个）",
    toolDescription: "Regex patterns to select specific domains or subdomains"
  }),
  "excludePaths": z.string().optional().meta({
    title: "排除路径",
    description: "正则表达式模式，排除特定路径（每行一个）",
    toolDescription: "Regex patterns to exclude specific path patterns"
  }),
  "excludeDomains": z.string().optional().meta({
    title: "排除域名",
    description: "正则表达式模式，排除特定域名或子域名（每行一个）",
    toolDescription: "Regex patterns to exclude specific domains or subdomains"
  }),
  "allowExternal": z.boolean().optional().meta({
    title: "允许外部链接",
    description: "是否在最终结果列表中包含外部域链接",
    toolDescription: "Whether to include external domain links"
  }),
  "timeout": z.number().optional().meta({
    title: "超时时间（秒）",
    description: "映射操作的最大等待时间（10-150秒）",
    toolDescription: "Maximum time in seconds to wait before timing out"
  })
});
const mapOutputSchema = z.object({
  "baseUrl": z.string().meta({
    title: "基础 URL",
    description: "被映射的基础 URL"
  }),
  "results": z.array(z.string()).meta({
    title: "发现的 URL",
    description: "映射过程中发现的 URL 列表"
  }),
  "urlCount": z.number().meta({
    title: "URL 数量",
    description: "发现的 URL 总数"
  }),
  "responseTime": z.number().meta({
    title: "响应时间",
    description: "完成请求所花费的时间（秒）"
  })
});
const mapHandler = createToolHandler({
  inputSchema: mapInputSchema,
  outputSchema: mapOutputSchema,
  secretSchema: mapSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await mapInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await mapTool(parsedInput);
    return mapOutputType.parseAsync(output);
  },
});

const searchSecretSchema = z.object({});
const searchInputSchema = z.object({
  "query": z.string().meta({
    title: "搜索内容",
    description: "要搜索的内容",
    toolDescription: "The search query string"
  }),
  "autoParameters": z.boolean().optional().meta({
    title: "自动参数",
    description: "是否让 Tavily 根据查询自动配置搜索参数"
  }),
  "auto_parameters": z.boolean().optional().meta({
    title: "自动参数（旧版）",
    description: "兼容旧版 Tavily 参数 auto_parameters"
  }),
  "searchDepth": z.enum(["basic","advanced"]).optional().meta({
    title: "搜索深度",
    description: "基础搜索 (1 credit) | 高级搜索 (2 credits)"
  }),
  "search_depth": z.enum(["basic","advanced"]).optional().meta({
    title: "搜索深度（旧版）",
    description: "兼容旧版 Tavily 参数 search_depth"
  }),
  "chunksPerSource": z.number().optional().meta({
    title: "每个来源片段数",
    description: "高级搜索下每个来源返回的内容片段数 (1-3)"
  }),
  "chunks_per_source": z.number().optional().meta({
    title: "每个来源片段数（旧版）",
    description: "兼容旧版 Tavily 参数 chunks_per_source"
  }),
  "maxResults": z.number().optional().meta({
    title: "最大结果数",
    description: "返回的最大搜索结果数量 (1-20)"
  }),
  "max_results": z.number().optional().meta({
    title: "最大结果数（旧版）",
    description: "兼容旧版 Tavily 参数 max_results"
  }),
  "includeAnswer": z.union([z.boolean(), z.enum(["basic","advanced"])]).optional().meta({
    title: "生成 AI 摘要",
    description: "是否生成 AI 摘要答案"
  }),
  "include_answer": z.union([z.boolean(), z.enum(["basic","advanced"])]).optional().meta({
    title: "生成 AI 摘要（旧版）",
    description: "兼容旧版 Tavily 参数 include_answer"
  }),
  "searchTopic": z.enum(["general","news","finance"]).optional().meta({
    title: "搜索主题",
    description: "搜索主题"
  }),
  "topic": z.enum(["general","news","finance"]).optional().meta({
    title: "搜索主题（旧版）",
    description: "兼容旧版 Tavily 参数 topic"
  }),
  "includeRawContent": z.union([z.enum(["none","text","markdown"]), z.boolean()]).optional().meta({
    title: "包含原始内容",
    description: "是否包含原始内容"
  }),
  "include_raw_content": z.union([z.enum(["none","text","markdown"]), z.boolean()]).optional().meta({
    title: "包含原始内容（旧版）",
    description: "兼容旧版 Tavily 参数 include_raw_content"
  }),
  "timeRange": z.enum(["none","day","week","month","year","d","w","m","y"]).nullable().optional().meta({
    title: "时间范围",
    description: "搜索时间范围"
  }),
  "time_range": z.enum(["none","day","week","month","year","d","w","m","y"]).nullable().optional().meta({
    title: "时间范围（旧版）",
    description: "兼容旧版 Tavily 参数 time_range"
  }),
  "startDate": z.string().optional().meta({
    title: "开始日期",
    description: "返回指定日期之后的结果，格式 YYYY-MM-DD"
  }),
  "start_date": z.string().optional().meta({
    title: "开始日期（旧版）",
    description: "兼容旧版 Tavily 参数 start_date"
  }),
  "endDate": z.string().optional().meta({
    title: "结束日期",
    description: "返回指定日期之前的结果，格式 YYYY-MM-DD"
  }),
  "end_date": z.string().optional().meta({
    title: "结束日期（旧版）",
    description: "兼容旧版 Tavily 参数 end_date"
  }),
  "includeImages": z.boolean().optional().meta({
    title: "包含图片",
    description: "是否包含图片"
  }),
  "include_images": z.boolean().optional().meta({
    title: "包含图片（旧版）",
    description: "兼容旧版 Tavily 参数 include_images"
  }),
  "includeImageDescriptions": z.boolean().optional().meta({
    title: "包含图片描述",
    description: "是否包含图片描述"
  }),
  "include_image_descriptions": z.boolean().optional().meta({
    title: "包含图片描述（旧版）",
    description: "兼容旧版 Tavily 参数 include_image_descriptions"
  }),
  "includeFavicon": z.boolean().optional().meta({
    title: "包含 favicon",
    description: "是否包含 favicon"
  }),
  "include_favicon": z.boolean().optional().meta({
    title: "包含 favicon（旧版）",
    description: "兼容旧版 Tavily 参数 include_favicon"
  }),
  "includeDomains": z.union([z.array(z.string()), z.string()]).optional().meta({
    title: "包含的域名",
    description: "搜索结果中包含的域名"
  }),
  "include_domains": z.union([z.array(z.string()), z.string()]).optional().meta({
    title: "包含的域名（旧版）",
    description: "兼容旧版 Tavily 参数 include_domains"
  }),
  "excludeDomains": z.union([z.array(z.string()), z.string()]).optional().meta({
    title: "排除的域名",
    description: "搜索结果中排除的域名"
  }),
  "exclude_domains": z.union([z.array(z.string()), z.string()]).optional().meta({
    title: "排除的域名（旧版）",
    description: "兼容旧版 Tavily 参数 exclude_domains"
  }),
  "country": z.string().optional().meta({
    title: "国家",
    description: "优先返回指定国家的搜索结果"
  })
});
const searchOutputSchema = z.object({
  "answer": z.string().optional().meta({
    title: "AI 摘要",
    description: "AI 生成的答案摘要"
  }),
  "results": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "结构化的搜索结果数组"
  })
});
const searchHandler = createToolHandler({
  inputSchema: searchInputSchema,
  outputSchema: searchOutputSchema,
  secretSchema: searchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await searchTool(parsedInput);
    return searchOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "tavily",
    name: {
      en: "Tavily Search",
      "zh-CN": "Tavily 搜索",
    },
    description: {
      en: "Provides Tavily AI search and content extraction capabilities",
      "zh-CN": "提供 Tavily AI 搜索和内容提取功能,支持智能搜索和网页内容抽取",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "A Tavily AI search toolset with SEARCH and EXTRACT operations.\n    Use these tools to perform AI-powered web searches with advanced filtering\n    and extract structured content from web pages.",
    tags: ["search"],
  },
  secretSchema,
  children: [
    {
      id: "crawl",
      name: {
        en: "Web Crawler",
        "zh-CN": "网站爬取",
      },
      description: {
        en: "Graph-based parallel website crawling with intelligent discovery",
        "zh-CN": "使用基于图的并行网站爬取功能，深度探索网站内容",
      },
      toolDescription:
        "Crawl hundreds of website paths in parallel with built-in extraction and intelligent discovery. Perfect for comprehensive site exploration, documentation scraping, and content aggregation.",
      handler: crawlHandler,
    },
    {
      id: "extract",
      name: {
        en: "Content Extract",
        "zh-CN": "内容提取",
      },
      description: {
        en: "Extract structured content from web pages",
        "zh-CN": "从网页提取结构化内容",
      },
      toolDescription:
        "Extract clean, structured content from web pages in Markdown or text format. Supports batch extraction from multiple URLs.",
      handler: extractHandler,
    },
    {
      id: "map",
      name: {
        en: "Site Map",
        "zh-CN": "网站地图",
      },
      description: {
        en: "Traverse websites like a graph and explore hundreds of paths in parallel to generate comprehensive site maps",
        "zh-CN": "像图一样遍历网站，并行探索数百个路径以生成全面的站点地图",
      },
      toolDescription:
        "Map website structure by discovering and cataloging all accessible URLs. Perfect for understanding site architecture, content inventory, and planning crawls.",
      handler: mapHandler,
    },
    {
      id: "search",
      name: {
        en: "AI Search",
        "zh-CN": "AI 搜索",
      },
      description: {
        en: "Perform AI-powered intelligent web search using Tavily",
        "zh-CN": "使用 Tavily 执行 AI 驱动的智能网络搜索",
      },
      toolDescription:
        "Search the web with AI-powered relevance ranking and answer generation.",
      handler: searchHandler,
    },
  ],
});

export default toolSet;
