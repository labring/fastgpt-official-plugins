import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as jinaAiReaderInputType,
  OutputType as jinaAiReaderOutputType,
  tool as jinaAiReaderTool,
} from "./children/jinaAiReader";
import {
  InputType as jinaAiSearchInputType,
  OutputType as jinaAiSearchOutputType,
  tool as jinaAiSearchTool,
} from "./children/jinaAiSearch";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "Jina AI API key",
    description: "Jina AI API key in the format jina_xxxxxxxxxxxxxxxx.",
    isSecret: true,
    "x-i18n": {
      title: { en: "Jina AI API key", "zh-CN": "Jina AI API 密钥" },
      description: {
        en: "Jina AI API key in the format jina_xxxxxxxxxxxxxxxx.",
        "zh-CN": "Jina AI API 密钥，格式：jina_xxxxxxxxxxxxxxxx",
      },
    },
  }),
});

const jinaAiReaderSecretSchema = z.object({});
const jinaAiReaderInputSchema = defineInputSchema({
  url: {
    type: z.string(),
    title: { en: "Web page URL", "zh-CN": "目标网页" },
    description: {
      en: "URL of the web page to read.",
      "zh-CN": "需要解析的网页 URL 地址",
    },
    isToolParam: true,
  },
  returnFormat: {
    type: z
      .enum(["default", "markdown", "html", "text", "screenshot", "pageshot"])
      .optional(),
    title: { en: "Return format", "zh-CN": "输出格式" },
    description: {
      en: "Format for the returned page content.",
      "zh-CN": "指定内容返回的格式类型",
    },
    isToolParam: true,
  },
});
const jinaAiReaderOutputSchema = defineOutputSchema({
  title: {
    type: z.string(),
    title: { en: "Page title", "zh-CN": "页面标题" },
    description: { en: "Title of the web page.", "zh-CN": "网页的标题信息" },
  },
  description: {
    type: z.string(),
    title: { en: "Page description", "zh-CN": "页面描述" },
    description: {
      en: "Description of the web page.",
      "zh-CN": "网页的描述信息",
    },
  },
  content: {
    type: z.string(),
    title: { en: "Page content", "zh-CN": "页面内容" },
    description: {
      en: "Main content of the web page.",
      "zh-CN": "网页的主要内容",
    },
  },
});

const jinaAiReaderHandler = createToolHandler({
  inputSchema: jinaAiReaderInputSchema,
  outputSchema: jinaAiReaderOutputSchema,
  secretSchema: jinaAiReaderSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await jinaAiReaderInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await jinaAiReaderTool(parsedInput);
    return jinaAiReaderOutputType.parseAsync(output);
  },
});

const jinaAiSearchSecretSchema = z.object({});
const jinaAiSearchInputSchema = defineInputSchema({
  query: {
    type: z.string(),
    title: { en: "Search query", "zh-CN": "搜索关键词" },
    description: {
      en: "Keywords or query to search for.",
      "zh-CN": "要搜索的关键词或查询语句",
    },
    isToolParam: true,
  },
  country: {
    type: z.enum(["CN", "US", "GB", "JP", "KR", "FR"]).optional(),
    title: { en: "Search country", "zh-CN": "搜索地区" },
    description: {
      en: "Country or region code to search in.",
      "zh-CN": "指定搜索的国家或地区代码",
    },
    isToolParam: true,
  },
  language: {
    type: z.enum(["zh-cn", "en", "ja", "ko", "fr"]).optional(),
    title: { en: "Search language", "zh-CN": "搜索语言" },
    description: {
      en: "Language code for search results.",
      "zh-CN": "指定搜索所用的语言代码",
    },
    isToolParam: true,
  },
  readFullContent: {
    type: z.boolean().optional(),
    title: { en: "Read full content", "zh-CN": "读取完整内容" },
    description: {
      en: "Visit each result URL and return its full content.",
      "zh-CN": "是否访问搜索结果中的每个 URL 并返回完整内容",
    },
    isToolParam: true,
  },
});
const jinaAiSearchOutputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.string(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Search result title.",
            "zh-CN": "搜索结果标题。",
          },
        },
        description: {
          type: z.string(),
          title: { en: "Description", "zh-CN": "描述" },
          description: {
            en: "Search result description.",
            "zh-CN": "搜索结果描述。",
          },
        },
        url: {
          type: z.string(),
          title: { en: "URL", "zh-CN": "链接" },
          description: { en: "Search result URL.", "zh-CN": "搜索结果 URL。" },
        },
        content: {
          type: z.string().optional(),
          title: { en: "Content", "zh-CN": "正文" },
          description: {
            en: "Optional full content for the search result.",
            "zh-CN": "搜索结果的可选完整正文。",
          },
        },
      }),
    ),
    title: { en: "Search results", "zh-CN": "搜索结果" },
    description: {
      en: "Structured Jina AI results containing title, URL, description, and optional content.",
      "zh-CN": "Jina AI 返回的结构化搜索结果，包含标题、URL、描述和可选正文。",
    },
  },
});

const jinaAiSearchHandler = createToolHandler({
  inputSchema: jinaAiSearchInputSchema,
  outputSchema: jinaAiSearchOutputSchema,
  secretSchema: jinaAiSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await jinaAiSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await jinaAiSearchTool(parsedInput);
    return jinaAiSearchOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "jinaAi",
    name: {
      en: "Jina AI Tool Set",
      "zh-CN": "Jina AI 工具集",
    },
    description: {
      en: "Jina AI intelligent search and web content extraction tool set, including search engine and web reader functionality",
      "zh-CN":
        "Jina AI 提供的智能搜索和网页内容提取工具集，包含搜索引擎和网页阅读器功能",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "jinaAiReader",
      name: {
        en: "Jina AI Web Parser",
        "zh-CN": "Jina AI 网页解析",
      },
      description: {
        en: "Intelligent web content parsing powered by Jina AI Reader with multiple output formats",
        "zh-CN": "基于 Jina AI Reader 的智能网页内容解析工具，支持多种格式输出",
      },
      handler: jinaAiReaderHandler,
    },
    {
      id: "jinaAiSearch",
      name: {
        en: "Jina AI Search",
        "zh-CN": "Jina AI 搜索",
      },
      description: {
        en: "Intelligent web search powered by Jina AI search engine with multi-language and region support",
        "zh-CN":
          "基于 Jina AI 搜索引擎的智能网络搜索工具，支持多语言和地区定制",
      },
      handler: jinaAiSearchHandler,
    },
  ],
});

export default toolSet;
