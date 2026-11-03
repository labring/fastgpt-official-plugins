import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
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
  tavilyApiKey: z.string().meta({
    title: "Tavily API Key",
    description:
      "Tavily API 密钥 (格式: tvly-xxxxxxxxxxxxxxxxxxxxxxxx), 在 https://app.tavily.com 获取",
    isSecret: true,
    "x-i18n": {
      title: { en: "Tavily API Key", "zh-CN": "Tavily API 密钥" },
      description: {
        en: "Tavily API key (format: tvly-xxxxxxxxxxxxxxxxxxxxxxxx), available at https://app.tavily.com.",
        "zh-CN":
          "Tavily API 密钥（格式：tvly-xxxxxxxxxxxxxxxxxxxxxxxx），可在 https://app.tavily.com 获取。",
      },
    },
  }),
});
const crawlSecretSchema = z.object({});
const crawlInputSchema = defineInputSchema({
  url: {
    type: z.string(),
    title: { en: "Starting URL", "zh-CN": "起始 URL" },
    description: {
      en: "Root URL to begin crawling.",
      "zh-CN": "开始爬取的根 URL。",
    },
    isToolParam: true,
  },
  instructions: {
    type: z.string().optional(),
    title: { en: "Crawl instructions", "zh-CN": "爬取指令" },
    description: {
      en: "Natural-language instructions to guide the crawler toward specific content; usage increases cost.",
      "zh-CN": "使用自然语言指令引导爬虫查找特定内容；使用此参数会增加成本。",
    },
    isToolParam: true,
  },
  maxDepth: {
    type: z.number().optional(),
    title: { en: "Maximum depth", "zh-CN": "最大深度" },
    description: {
      en: "Maximum crawl depth (1–5).",
      "zh-CN": "爬取的最大深度（1-5）。",
    },
    isToolParam: true,
  },
  maxBreadth: {
    type: z.number().optional(),
    title: { en: "Maximum breadth", "zh-CN": "最大广度" },
    description: {
      en: "Maximum number of links to follow per level.",
      "zh-CN": "每层跟随的最大链接数。",
    },
    isToolParam: true,
  },
  limit: {
    type: z.number().optional(),
    title: { en: "Total limit", "zh-CN": "总限制" },
    description: {
      en: "Maximum total number of links to process.",
      "zh-CN": "处理的总链接数上限。",
    },
    isToolParam: true,
  },
  selectPaths: {
    type: z.string().optional(),
    title: { en: "Include paths", "zh-CN": "包含路径" },
    description: {
      en: "Regex patterns selecting specific paths, one per line.",
      "zh-CN": "用于选择特定路径的正则表达式模式，每行一个。",
    },
    isToolParam: true,
  },
  excludePaths: {
    type: z.string().optional(),
    title: { en: "Exclude paths", "zh-CN": "排除路径" },
    description: {
      en: "Regex patterns excluding specific paths, one per line.",
      "zh-CN": "用于排除特定路径的正则表达式模式，每行一个。",
    },
    isToolParam: true,
  },
  allowExternal: {
    type: z.boolean().optional(),
    title: { en: "Allow external links", "zh-CN": "允许外部链接" },
    description: {
      en: "Whether to include links from external domains in the results.",
      "zh-CN": "是否在结果中包含外部域链接。",
    },
    isToolParam: true,
  },
  includeImages: {
    type: z.boolean().optional(),
    title: { en: "Include images", "zh-CN": "包含图片" },
    description: {
      en: "Whether to include images in crawl results.",
      "zh-CN": "是否在爬取结果中包含图片。",
    },
    isToolParam: true,
  },
  extractDepth: {
    type: z.enum(["basic", "advanced"]).optional(),
    title: { en: "Extraction depth", "zh-CN": "提取深度" },
    description: {
      en: "Basic extraction (1 credit per 5 pages) or advanced extraction (2 credits per 5 pages).",
      "zh-CN":
        "基础提取（每 5 页消耗 1 个 credit）或高级提取（每 5 页消耗 2 个 credits）。",
    },
    isToolParam: true,
  },
  format: {
    type: z.enum(["markdown", "text"]).optional(),
    title: { en: "Output format", "zh-CN": "输出格式" },
    description: {
      en: "Format for extracted content.",
      "zh-CN": "提取内容的输出格式。",
    },
    isToolParam: true,
  },
  includeFavicon: {
    type: z.boolean().optional(),
    title: { en: "Include favicon", "zh-CN": "包含图标" },
    description: {
      en: "Whether to include a favicon URL for each result.",
      "zh-CN": "是否为每个结果包含 favicon URL。",
    },
    isToolParam: true,
  },
  timeout: {
    type: z.number().optional(),
    title: { en: "Timeout (seconds)", "zh-CN": "超时时间（秒）" },
    description: {
      en: "Maximum time to wait for the crawl (10–150 seconds).",
      "zh-CN": "爬取操作的最大等待时间（10-150 秒）。",
    },
    isToolParam: true,
  },
});
const crawlOutputSchema = defineOutputSchema({
  baseUrl: {
    type: z.string(),
    title: { en: "Base URL", "zh-CN": "基础 URL" },
    description: {
      en: "Base URL that was crawled.",
      "zh-CN": "被爬取的基础 URL。",
    },
  },
  results: {
    type: z.array(z.record(z.string(), z.unknown())),
    title: { en: "Crawl results", "zh-CN": "爬取结果" },
    description: {
      en: "Content extracted from crawled URLs.",
      "zh-CN": "从爬取 URL 中提取的内容列表。",
    },
  },
  successCount: {
    type: z.number(),
    title: { en: "Successful pages", "zh-CN": "成功数量" },
    description: {
      en: "Number of pages crawled successfully.",
      "zh-CN": "成功爬取的页面数量。",
    },
  },
  responseTime: {
    type: z.number(),
    title: { en: "Response time", "zh-CN": "响应时间" },
    description: {
      en: "Time taken to complete the request, in seconds.",
      "zh-CN": "完成请求所花费的时间（秒）。",
    },
  },
});
const crawlHandler = createToolHandler({
  inputSchema: crawlInputSchema,
  outputSchema: crawlOutputSchema,
  secretSchema: crawlSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await crawlInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await crawlTool(parsedInput);
    return crawlOutputType.parseAsync(output);
  },
});
const extractSecretSchema = z.object({});
const extractInputSchema = defineInputSchema({
  urls: {
    type: z.string(),
    title: { en: "URLs", "zh-CN": "URL 地址" },
    description: {
      en: "A single URL or multiple URLs, separated by newlines.",
      "zh-CN": "单个或多个 URL，多个 URL 请用换行分隔。",
    },
    isToolParam: true,
  },
  extract_depth: {
    type: z.enum(["basic", "advanced"]).optional(),
    title: { en: "Extraction depth", "zh-CN": "提取深度" },
    description: {
      en: "Choose basic or advanced content extraction.",
      "zh-CN": "选择基础或高级内容提取。",
    },
    isToolParam: true,
  },
  format: {
    type: z.enum(["markdown", "text"]).optional(),
    title: { en: "Output format", "zh-CN": "输出格式" },
    description: {
      en: "Format for extracted content.",
      "zh-CN": "提取内容的输出格式。",
    },
    isToolParam: true,
  },
  include_images: {
    type: z.boolean().optional(),
    title: { en: "Include images", "zh-CN": "包含图片" },
    description: {
      en: "Whether to include images in the extraction results.",
      "zh-CN": "是否在提取结果中包含图片。",
    },
    isToolParam: true,
  },
  include_favicon: {
    type: z.boolean().optional(),
    title: { en: "Include favicon", "zh-CN": "包含 favicon" },
    description: {
      en: "Whether to include a favicon URL for each result.",
      "zh-CN": "是否为每个结果包含 favicon URL。",
    },
    isToolParam: true,
  },
  timeout: {
    type: z.number().optional(),
    title: { en: "Timeout (seconds)", "zh-CN": "超时时间（秒）" },
    description: {
      en: "Maximum wait time (1–60 seconds); the default depends on extraction depth.",
      "zh-CN": "最大等待时间（1-60 秒），默认值根据提取深度设置。",
    },
    isToolParam: true,
  },
});
const extractOutputSchema = defineOutputSchema({
  results: {
    type: z.array(z.record(z.string(), z.unknown())),
    title: { en: "Extraction results", "zh-CN": "提取结果" },
    description: {
      en: "Array of successfully extracted content.",
      "zh-CN": "成功提取的内容数组。",
    },
  },
  successCount: {
    type: z.number(),
    title: { en: "Successful URLs", "zh-CN": "成功数量" },
    description: {
      en: "Number of URLs extracted successfully.",
      "zh-CN": "成功提取的 URL 数量。",
    },
  },
  failedUrls: {
    type: z.array(z.string()),
    title: { en: "Failed URLs", "zh-CN": "失败列表" },
    description: {
      en: "URLs that failed extraction and the reasons for failure.",
      "zh-CN": "提取失败的 URL 及失败原因。",
    },
  },
});
const extractHandler = createToolHandler({
  inputSchema: extractInputSchema,
  outputSchema: extractOutputSchema,
  secretSchema: extractSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await extractInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await extractTool(parsedInput);
    return extractOutputType.parseAsync(output);
  },
});

const mapSecretSchema = z.object({});
const mapInputSchema = defineInputSchema({
  url: {
    type: z.string(),
    title: { en: "Starting URL", "zh-CN": "起始 URL" },
    description: {
      en: "Root URL to begin mapping.",
      "zh-CN": "开始映射的根 URL。",
    },
    isToolParam: true,
  },
  instructions: {
    type: z.string().optional(),
    title: { en: "Mapping instructions", "zh-CN": "映射指令" },
    description: {
      en: "Natural-language instructions to guide discovery of specific content; usage increases cost.",
      "zh-CN": "使用自然语言指令引导映射器查找特定内容；使用此参数会增加成本。",
    },
    isToolParam: true,
  },
  maxDepth: {
    type: z.number().optional(),
    title: { en: "Maximum depth", "zh-CN": "最大深度" },
    description: {
      en: "Maximum mapping depth (1–5).",
      "zh-CN": "映射的最大深度（1-5）。",
    },
    isToolParam: true,
  },
  maxBreadth: {
    type: z.number().optional(),
    title: { en: "Maximum breadth", "zh-CN": "最大广度" },
    description: {
      en: "Maximum number of links to follow per level.",
      "zh-CN": "每层跟随的最大链接数。",
    },
    isToolParam: true,
  },
  limit: {
    type: z.number().optional(),
    title: { en: "Total limit", "zh-CN": "总限制" },
    description: {
      en: "Maximum total number of links to process.",
      "zh-CN": "处理的总链接数上限。",
    },
    isToolParam: true,
  },
  selectPaths: {
    type: z.string().optional(),
    title: { en: "Include paths", "zh-CN": "包含路径" },
    description: {
      en: "Regex patterns selecting specific paths, one per line.",
      "zh-CN": "用于选择特定路径的正则表达式模式，每行一个。",
    },
    isToolParam: true,
  },
  selectDomains: {
    type: z.string().optional(),
    title: { en: "Include domains", "zh-CN": "包含域名" },
    description: {
      en: "Regex patterns selecting specific domains or subdomains, one per line.",
      "zh-CN": "用于选择特定域名或子域名的正则表达式模式，每行一个。",
    },
    isToolParam: true,
  },
  excludePaths: {
    type: z.string().optional(),
    title: { en: "Exclude paths", "zh-CN": "排除路径" },
    description: {
      en: "Regex patterns excluding specific paths, one per line.",
      "zh-CN": "用于排除特定路径的正则表达式模式，每行一个。",
    },
    isToolParam: true,
  },
  excludeDomains: {
    type: z.string().optional(),
    title: { en: "Exclude domains", "zh-CN": "排除域名" },
    description: {
      en: "Regex patterns excluding specific domains or subdomains, one per line.",
      "zh-CN": "用于排除特定域名或子域名的正则表达式模式，每行一个。",
    },
    isToolParam: true,
  },
  allowExternal: {
    type: z.boolean().optional(),
    title: { en: "Allow external links", "zh-CN": "允许外部链接" },
    description: {
      en: "Whether to include links from external domains in the final results.",
      "zh-CN": "是否在最终结果列表中包含外部域链接。",
    },
    isToolParam: true,
  },
  timeout: {
    type: z.number().optional(),
    title: { en: "Timeout (seconds)", "zh-CN": "超时时间（秒）" },
    description: {
      en: "Maximum time to wait for mapping (10–150 seconds).",
      "zh-CN": "映射操作的最大等待时间（10-150 秒）。",
    },
    isToolParam: true,
  },
});
const mapOutputSchema = defineOutputSchema({
  baseUrl: {
    type: z.string(),
    title: { en: "Base URL", "zh-CN": "基础 URL" },
    description: {
      en: "Base URL that was mapped.",
      "zh-CN": "被映射的基础 URL。",
    },
  },
  results: {
    type: z.array(z.string()),
    title: { en: "Discovered URLs", "zh-CN": "发现的 URL" },
    description: {
      en: "URLs discovered while mapping the site.",
      "zh-CN": "映射过程中发现的 URL 列表。",
    },
  },
  urlCount: {
    type: z.number(),
    title: { en: "URL count", "zh-CN": "URL 数量" },
    description: {
      en: "Total number of URLs discovered.",
      "zh-CN": "发现的 URL 总数。",
    },
  },
  responseTime: {
    type: z.number(),
    title: { en: "Response time", "zh-CN": "响应时间" },
    description: {
      en: "Time taken to complete the request, in seconds.",
      "zh-CN": "完成请求所花费的时间（秒）。",
    },
  },
});

const mapHandler = createToolHandler({
  inputSchema: mapInputSchema,
  outputSchema: mapOutputSchema,
  secretSchema: mapSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await mapInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await mapTool(parsedInput);
    return mapOutputType.parseAsync(output);
  },
});

const searchSecretSchema = z.object({});
const searchInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "搜索内容" },
    description: { en: "The search query string.", "zh-CN": "要搜索的内容。" },
    isToolParam: true,
  },
  autoParameters: {
    type: z.boolean().optional(),
    title: { en: "Automatic parameters", "zh-CN": "自动参数" },
    description: {
      en: "Whether Tavily automatically configures search parameters based on the query.",
      "zh-CN": "是否让 Tavily 根据查询自动配置搜索参数。",
    },
    isToolParam: true,
  },
  auto_parameters: {
    type: z.boolean().optional(),
    title: { en: "Automatic parameters (legacy)", "zh-CN": "自动参数（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily auto_parameters option.",
      "zh-CN": "兼容旧版 Tavily 参数 auto_parameters。",
    },
    isToolParam: true,
  },
  searchDepth: {
    type: z.enum(["basic", "advanced"]).optional(),
    title: { en: "Search depth", "zh-CN": "搜索深度" },
    description: {
      en: "Basic search (1 credit) or advanced search (2 credits).",
      "zh-CN": "基础搜索（1 credit）或高级搜索（2 credits）。",
    },
    isToolParam: true,
  },
  search_depth: {
    type: z.enum(["basic", "advanced"]).optional(),
    title: { en: "Search depth (legacy)", "zh-CN": "搜索深度（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily search_depth option.",
      "zh-CN": "兼容旧版 Tavily 参数 search_depth。",
    },
    isToolParam: true,
  },
  chunksPerSource: {
    type: z.number().optional(),
    title: { en: "Chunks per source", "zh-CN": "每个来源片段数" },
    description: {
      en: "Number of content chunks returned per source with advanced search (1–3).",
      "zh-CN": "高级搜索下每个来源返回的内容片段数（1-3）。",
    },
    isToolParam: true,
  },
  chunks_per_source: {
    type: z.number().optional(),
    title: {
      en: "Chunks per source (legacy)",
      "zh-CN": "每个来源片段数（旧版）",
    },
    description: {
      en: "Compatibility with the legacy Tavily chunks_per_source option.",
      "zh-CN": "兼容旧版 Tavily 参数 chunks_per_source。",
    },
    isToolParam: true,
  },
  maxResults: {
    type: z.number().optional(),
    title: { en: "Maximum results", "zh-CN": "最大结果数" },
    description: {
      en: "Maximum number of search results to return (1–20).",
      "zh-CN": "返回的最大搜索结果数量（1-20）。",
    },
    isToolParam: true,
  },
  max_results: {
    type: z.number().optional(),
    title: { en: "Maximum results (legacy)", "zh-CN": "最大结果数（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily max_results option.",
      "zh-CN": "兼容旧版 Tavily 参数 max_results。",
    },
    isToolParam: true,
  },
  includeAnswer: {
    type: z.union([z.boolean(), z.enum(["basic", "advanced"])]).optional(),
    title: { en: "Include AI answer", "zh-CN": "生成 AI 摘要" },
    description: {
      en: "Whether to generate an AI answer, optionally specifying its depth.",
      "zh-CN": "是否生成 AI 答案摘要，也可指定摘要深度。",
    },
    isToolParam: true,
  },
  include_answer: {
    type: z.union([z.boolean(), z.enum(["basic", "advanced"])]).optional(),
    title: {
      en: "Include AI answer (legacy)",
      "zh-CN": "生成 AI 摘要（旧版）",
    },
    description: {
      en: "Compatibility with the legacy Tavily include_answer option.",
      "zh-CN": "兼容旧版 Tavily 参数 include_answer。",
    },
    isToolParam: true,
  },
  searchTopic: {
    type: z.enum(["general", "news", "finance"]).optional(),
    title: { en: "Search topic", "zh-CN": "搜索主题" },
    description: { en: "Topic for the search.", "zh-CN": "搜索主题。" },
    isToolParam: true,
  },
  topic: {
    type: z.enum(["general", "news", "finance"]).optional(),
    title: { en: "Search topic (legacy)", "zh-CN": "搜索主题（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily topic option.",
      "zh-CN": "兼容旧版 Tavily 参数 topic。",
    },
    isToolParam: true,
  },
  includeRawContent: {
    type: z
      .union([z.enum(["none", "text", "markdown"]), z.boolean()])
      .optional(),
    title: { en: "Include raw content", "zh-CN": "包含原始内容" },
    description: {
      en: "Whether and how to include raw content.",
      "zh-CN": "是否包含原始内容以及内容格式。",
    },
    isToolParam: true,
  },
  include_raw_content: {
    type: z
      .union([z.enum(["none", "text", "markdown"]), z.boolean()])
      .optional(),
    title: {
      en: "Include raw content (legacy)",
      "zh-CN": "包含原始内容（旧版）",
    },
    description: {
      en: "Compatibility with the legacy Tavily include_raw_content option.",
      "zh-CN": "兼容旧版 Tavily 参数 include_raw_content。",
    },
    isToolParam: true,
  },
  timeRange: {
    type: z
      .enum(["none", "day", "week", "month", "year", "d", "w", "m", "y"])
      .nullable()
      .optional(),
    title: { en: "Time range", "zh-CN": "时间范围" },
    description: {
      en: "Time range for search results.",
      "zh-CN": "搜索结果的时间范围。",
    },
    isToolParam: true,
  },
  time_range: {
    type: z
      .enum(["none", "day", "week", "month", "year", "d", "w", "m", "y"])
      .nullable()
      .optional(),
    title: { en: "Time range (legacy)", "zh-CN": "时间范围（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily time_range option.",
      "zh-CN": "兼容旧版 Tavily 参数 time_range。",
    },
    isToolParam: true,
  },
  startDate: {
    type: z.string().optional(),
    title: { en: "Start date", "zh-CN": "开始日期" },
    description: {
      en: "Return results published after this date, in YYYY-MM-DD format.",
      "zh-CN": "返回指定日期之后的结果，格式为 YYYY-MM-DD。",
    },
    isToolParam: true,
  },
  start_date: {
    type: z.string().optional(),
    title: { en: "Start date (legacy)", "zh-CN": "开始日期（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily start_date option.",
      "zh-CN": "兼容旧版 Tavily 参数 start_date。",
    },
    isToolParam: true,
  },
  endDate: {
    type: z.string().optional(),
    title: { en: "End date", "zh-CN": "结束日期" },
    description: {
      en: "Return results published before this date, in YYYY-MM-DD format.",
      "zh-CN": "返回指定日期之前的结果，格式为 YYYY-MM-DD。",
    },
    isToolParam: true,
  },
  end_date: {
    type: z.string().optional(),
    title: { en: "End date (legacy)", "zh-CN": "结束日期（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily end_date option.",
      "zh-CN": "兼容旧版 Tavily 参数 end_date。",
    },
    isToolParam: true,
  },
  includeImages: {
    type: z.boolean().optional(),
    title: { en: "Include images", "zh-CN": "包含图片" },
    description: {
      en: "Whether to include images.",
      "zh-CN": "是否包含图片。",
    },
    isToolParam: true,
  },
  include_images: {
    type: z.boolean().optional(),
    title: { en: "Include images (legacy)", "zh-CN": "包含图片（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily include_images option.",
      "zh-CN": "兼容旧版 Tavily 参数 include_images。",
    },
    isToolParam: true,
  },
  includeImageDescriptions: {
    type: z.boolean().optional(),
    title: { en: "Include image descriptions", "zh-CN": "包含图片描述" },
    description: {
      en: "Whether to include image descriptions.",
      "zh-CN": "是否包含图片描述。",
    },
    isToolParam: true,
  },
  include_image_descriptions: {
    type: z.boolean().optional(),
    title: {
      en: "Include image descriptions (legacy)",
      "zh-CN": "包含图片描述（旧版）",
    },
    description: {
      en: "Compatibility with the legacy Tavily include_image_descriptions option.",
      "zh-CN": "兼容旧版 Tavily 参数 include_image_descriptions。",
    },
    isToolParam: true,
  },
  includeFavicon: {
    type: z.boolean().optional(),
    title: { en: "Include favicon", "zh-CN": "包含 favicon" },
    description: {
      en: "Whether to include favicons.",
      "zh-CN": "是否包含 favicon。",
    },
    isToolParam: true,
  },
  include_favicon: {
    type: z.boolean().optional(),
    title: { en: "Include favicon (legacy)", "zh-CN": "包含 favicon（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily include_favicon option.",
      "zh-CN": "兼容旧版 Tavily 参数 include_favicon。",
    },
    isToolParam: true,
  },
  includeDomains: {
    type: z.union([z.array(z.string()), z.string()]).optional(),
    title: { en: "Included domains", "zh-CN": "包含的域名" },
    description: {
      en: "Domains to include in search results.",
      "zh-CN": "搜索结果中包含的域名。",
    },
    isToolParam: true,
  },
  include_domains: {
    type: z.union([z.array(z.string()), z.string()]).optional(),
    title: { en: "Included domains (legacy)", "zh-CN": "包含的域名（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily include_domains option.",
      "zh-CN": "兼容旧版 Tavily 参数 include_domains。",
    },
    isToolParam: true,
  },
  excludeDomains: {
    type: z.union([z.array(z.string()), z.string()]).optional(),
    title: { en: "Excluded domains", "zh-CN": "排除的域名" },
    description: {
      en: "Domains to exclude from search results.",
      "zh-CN": "搜索结果中排除的域名。",
    },
    isToolParam: true,
  },
  exclude_domains: {
    type: z.union([z.array(z.string()), z.string()]).optional(),
    title: { en: "Excluded domains (legacy)", "zh-CN": "排除的域名（旧版）" },
    description: {
      en: "Compatibility with the legacy Tavily exclude_domains option.",
      "zh-CN": "兼容旧版 Tavily 参数 exclude_domains。",
    },
    isToolParam: true,
  },
  country: {
    type: z.string().optional(),
    title: { en: "Country", "zh-CN": "国家" },
    description: {
      en: "Prioritize search results from the specified country.",
      "zh-CN": "优先返回指定国家的搜索结果。",
    },
    isToolParam: true,
  },
});
const searchOutputSchema = defineOutputSchema({
  answer: {
    type: z.string().optional(),
    title: { en: "AI answer", "zh-CN": "AI 摘要" },
    description: {
      en: "AI-generated answer summary.",
      "zh-CN": "AI 生成的答案摘要。",
    },
  },
  results: {
    type: z.array(z.record(z.string(), z.unknown())),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "Array of structured search results.",
      "zh-CN": "结构化的搜索结果数组。",
    },
  },
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
    pluginId: "tavily",
    name: {
      en: "Tavily Search",
      "zh-CN": "Tavily 搜索",
    },
    description: {
      en: "Provides Tavily AI search and content extraction capabilities. Includes SEARCH and EXTRACT operations for AI-powered web searches with advanced filtering and structured extraction from web pages.",
      "zh-CN":
        "提供 Tavily AI 搜索和内容提取功能，支持智能搜索和网页内容抽取。包含 SEARCH 和 EXTRACT 操作，可执行带高级筛选的 AI 网络搜索并从网页提取结构化内容。",
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
      id: "crawl",
      name: {
        en: "Web Crawler",
        "zh-CN": "网站爬取",
      },
      description: {
        en: "Graph-based parallel website crawling with intelligent discovery. Crawl hundreds of paths with built-in extraction for site exploration, documentation scraping, and content aggregation.",
        "zh-CN":
          "使用基于图的并行爬取和智能发现功能探索网站。可并行爬取数百个路径并提取内容，适用于全面探索网站、抓取文档和汇总内容。",
      },
      handler: crawlHandler,
    },
    {
      id: "extract",
      name: {
        en: "Content Extract",
        "zh-CN": "内容提取",
      },
      description: {
        en: "Extract clean, structured content from web pages in Markdown or text format, including batch extraction from multiple URLs.",
        "zh-CN":
          "以 Markdown 或文本格式从网页中提取整洁、结构化的内容，并支持从多个 URL 批量提取。",
      },
      handler: extractHandler,
    },
    {
      id: "map",
      name: {
        en: "Site Map",
        "zh-CN": "网站地图",
      },
      description: {
        en: "Discover and catalog accessible URLs to map website structure, understand site architecture and content inventory, and plan crawls.",
        "zh-CN":
          "发现并整理可访问的 URL 以映射网站结构，帮助了解站点架构和内容清单并规划爬取。",
      },
      handler: mapHandler,
    },
    {
      id: "search",
      name: {
        en: "AI Search",
        "zh-CN": "AI 搜索",
      },
      description: {
        en: "Search the web with AI-powered relevance ranking and answer generation.",
        "zh-CN": "通过 AI 相关性排序和答案生成进行网络搜索。",
      },
      handler: searchHandler,
    },
  ],
});

export default toolSet;
