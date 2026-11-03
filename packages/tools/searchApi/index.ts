import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as baiduSearchInputType,
  OutputType as baiduSearchOutputType,
  tool as baiduSearchTool,
} from "./children/baiduSearch";
import {
  InputType as googleImagesSearchInputType,
  OutputType as googleImagesSearchOutputType,
  tool as googleImagesSearchTool,
} from "./children/googleImagesSearch";
import {
  InputType as googleNewsSearchInputType,
  OutputType as googleNewsSearchOutputType,
  tool as googleNewsSearchTool,
} from "./children/googleNewsSearch";
import {
  InputType as googleSearchInputType,
  OutputType as googleSearchOutputType,
  tool as googleSearchTool,
} from "./children/googleSearch";
import {
  InputType as googleVideosSearchInputType,
  OutputType as googleVideosSearchOutputType,
  tool as googleVideosSearchTool,
} from "./children/googleVideosSearch";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "Search API Key",
    description: "API key used to access the SearchApi service.",
    "x-i18n": {
      title: { en: "Search API Key", "zh-CN": "SearchApi API 密钥" },
      description: {
        en: "API key used to access the SearchApi service.",
        "zh-CN": "用于访问 SearchApi 服务的 API 密钥。",
      },
    },
    isSecret: true,
  }),
});

const baiduSearchSecretSchema = z.object({});
const baiduSearchInputSchema = defineInputSchema({
  q: {
    type: z.string(),
    title: { en: "Search Query", "zh-CN": "搜索关键词" },
    description: {
      en: "Keywords to search for on Baidu.",
      "zh-CN": "要在百度搜索的关键词。",
    },
    isToolParam: true,
  },
  num: {
    type: z.number().optional(),
    title: { en: "Maximum Results", "zh-CN": "最大搜索数量" },
    description: {
      en: "Maximum number of search results to return.",
      "zh-CN": "最多返回的搜索结果数量。",
    },
    isToolParam: true,
  },
});
const baiduSearchOutputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.any().optional(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the Baidu search result.",
            "zh-CN": "百度搜索结果标题。",
          },
        },
        link: {
          type: z.any().optional(),
          title: { en: "Link", "zh-CN": "链接" },
          description: {
            en: "URL of the Baidu search result.",
            "zh-CN": "百度搜索结果链接。",
          },
        },
        snippet: {
          type: z.any().optional(),
          title: { en: "Snippet", "zh-CN": "摘要" },
          description: {
            en: "Text snippet from the result.",
            "zh-CN": "搜索结果文本摘要。",
          },
        },
        snippet_highlighted_words: {
          type: z.any().optional(),
          title: { en: "Highlighted words", "zh-CN": "高亮词语" },
          description: {
            en: "Highlighted terms from the result, when available.",
            "zh-CN": "搜索结果中的高亮词语（如有）。",
          },
        },
      }),
    ),
    title: { en: "Search Results", "zh-CN": "搜索结果" },
    description: {
      en: "Results returned by Baidu search.",
      "zh-CN": "百度搜索返回的结果。",
    },
  },
});

const baiduSearchHandler = createToolHandler({
  inputSchema: baiduSearchInputSchema,
  outputSchema: baiduSearchOutputSchema,
  secretSchema: baiduSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await baiduSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await baiduSearchTool(parsedInput);
    return baiduSearchOutputType.parseAsync(output);
  },
});

const googleImagesSearchSecretSchema = z.object({});
const googleImagesSearchInputSchema = defineInputSchema({
  q: {
    type: z.string(),
    title: { en: "Search Query", "zh-CN": "搜索关键词" },
    description: {
      en: "Keywords to use for the Google Images search.",
      "zh-CN": "用于 Google 图片搜索的关键词。",
    },
    isToolParam: true,
  },
  num: {
    type: z.number().optional(),
    title: { en: "Maximum Results", "zh-CN": "最大搜索数量" },
    description: {
      en: "Maximum number of image search results to return.",
      "zh-CN": "最多返回的图片搜索结果数量。",
    },
    isToolParam: true,
  },
  time_period: {
    type: z
      .enum(["last_hour", "last_day", "last_month", "last_week", "last_year"])
      .optional(),
    title: { en: "Time Period", "zh-CN": "搜索日期范围" },
    description: {
      en: "Optional time range for the image search: last hour, day, week, month, or year.",
      "zh-CN": "可选的图片搜索时间范围：最近一小时、一天、一周、一月或一年。",
    },
    isToolParam: true,
  },
});
const googleImagesSearchOutputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.any().optional(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the image result.",
            "zh-CN": "图片搜索结果标题。",
          },
        },
        source: {
          type: z.any().optional(),
          title: { en: "Source", "zh-CN": "来源" },
          description: {
            en: "Source site for the image.",
            "zh-CN": "图片来源站点。",
          },
        },
        original: {
          type: z.any().optional(),
          title: { en: "Original image URL", "zh-CN": "原始图片链接" },
          description: {
            en: "URL of the original image.",
            "zh-CN": "原始图片 URL。",
          },
        },
        thumbnail: {
          type: z.any().optional(),
          title: { en: "Thumbnail URL", "zh-CN": "缩略图链接" },
          description: {
            en: "URL of the image thumbnail.",
            "zh-CN": "图片缩略图 URL。",
          },
        },
      }),
    ),
    title: { en: "Image Search Results", "zh-CN": "图片搜索结果" },
    description: {
      en: "Image search results returned by Google.",
      "zh-CN": "Google 返回的图片搜索结果。",
    },
  },
});

const googleImagesSearchHandler = createToolHandler({
  inputSchema: googleImagesSearchInputSchema,
  outputSchema: googleImagesSearchOutputSchema,
  secretSchema: googleImagesSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleImagesSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await googleImagesSearchTool(parsedInput);
    return googleImagesSearchOutputType.parseAsync(output);
  },
});

const googleNewsSearchSecretSchema = z.object({});
const googleNewsSearchInputSchema = defineInputSchema({
  q: {
    type: z.string(),
    title: { en: "Search Query", "zh-CN": "搜索关键词" },
    description: {
      en: "Keywords to use for the Google News search.",
      "zh-CN": "用于 Google 新闻搜索的关键词。",
    },
    isToolParam: true,
  },
  num: {
    type: z.number().optional(),
    title: { en: "Maximum Results", "zh-CN": "最大搜索数量" },
    description: {
      en: "Maximum number of news search results to return.",
      "zh-CN": "最多返回的新闻搜索结果数量。",
    },
    isToolParam: true,
  },
  time_period: {
    type: z
      .enum(["last_hour", "last_day", "last_month", "last_week", "last_year"])
      .optional(),
    title: { en: "Time Period", "zh-CN": "搜索日期范围" },
    description: {
      en: "Optional time range for the news search: last hour, day, week, month, or year.",
      "zh-CN": "可选的新闻搜索时间范围：最近一小时、一天、一周、一月或一年。",
    },
    isToolParam: true,
  },
});
const googleNewsSearchOutputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.any().optional(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the news result.",
            "zh-CN": "新闻搜索结果标题。",
          },
        },
        link: {
          type: z.any().optional(),
          title: { en: "Link", "zh-CN": "链接" },
          description: {
            en: "URL of the news result.",
            "zh-CN": "新闻搜索结果链接。",
          },
        },
        snippet: {
          type: z.any().optional(),
          title: { en: "Snippet", "zh-CN": "摘要" },
          description: {
            en: "Text snippet from the news result.",
            "zh-CN": "新闻搜索结果文本摘要。",
          },
        },
        snippet_highlighted_words: {
          type: z.any().optional(),
          title: { en: "Highlighted words", "zh-CN": "高亮词语" },
          description: {
            en: "Highlighted terms from the result, when available.",
            "zh-CN": "搜索结果中的高亮词语（如有）。",
          },
        },
      }),
    ),
    title: { en: "News Search Results", "zh-CN": "新闻搜索结果" },
    description: {
      en: "News search results returned by Google.",
      "zh-CN": "Google 返回的新闻搜索结果。",
    },
  },
});

const googleNewsSearchHandler = createToolHandler({
  inputSchema: googleNewsSearchInputSchema,
  outputSchema: googleNewsSearchOutputSchema,
  secretSchema: googleNewsSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleNewsSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await googleNewsSearchTool(parsedInput);
    return googleNewsSearchOutputType.parseAsync(output);
  },
});

const googleSearchSecretSchema = z.object({});
const googleSearchInputSchema = defineInputSchema({
  q: {
    type: z.string(),
    title: { en: "Search Query", "zh-CN": "搜索关键词" },
    description: {
      en: "Keywords to use for the Google web search.",
      "zh-CN": "用于 Google 网页搜索的关键词。",
    },
    isToolParam: true,
  },
  num: {
    type: z.number().optional(),
    title: { en: "Maximum Results", "zh-CN": "最大搜索数量" },
    description: {
      en: "Maximum number of web search results to return.",
      "zh-CN": "最多返回的网页搜索结果数量。",
    },
    isToolParam: true,
  },
  time_period: {
    type: z
      .enum(["last_hour", "last_day", "last_month", "last_week", "last_year"])
      .optional(),
    title: { en: "Time Period", "zh-CN": "搜索日期范围" },
    description: {
      en: "Optional time range for the search: last hour, day, week, month, or year.",
      "zh-CN": "可选的搜索时间范围：最近一小时、一天、一周、一月或一年。",
    },
    isToolParam: true,
  },
});
const googleSearchOutputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.any().optional(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the web search result.",
            "zh-CN": "网页搜索结果标题。",
          },
        },
        link: {
          type: z.any().optional(),
          title: { en: "Link", "zh-CN": "链接" },
          description: {
            en: "URL of the web search result.",
            "zh-CN": "网页搜索结果链接。",
          },
        },
        snippet: {
          type: z.any().optional(),
          title: { en: "Snippet", "zh-CN": "摘要" },
          description: {
            en: "Text snippet from the result.",
            "zh-CN": "搜索结果文本摘要。",
          },
        },
        snippet_highlighted_words: {
          type: z.any().optional(),
          title: { en: "Highlighted words", "zh-CN": "高亮词语" },
          description: {
            en: "Highlighted terms from the result, when available.",
            "zh-CN": "搜索结果中的高亮词语（如有）。",
          },
        },
      }),
    ),
    title: { en: "Web Search Results", "zh-CN": "网页搜索结果" },
    description: {
      en: "Web search results returned by Google.",
      "zh-CN": "Google 返回的网页搜索结果。",
    },
  },
});

const googleSearchHandler = createToolHandler({
  inputSchema: googleSearchInputSchema,
  outputSchema: googleSearchOutputSchema,
  secretSchema: googleSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await googleSearchTool(parsedInput);
    return googleSearchOutputType.parseAsync(output);
  },
});

const googleVideosSearchSecretSchema = z.object({});
const googleVideosSearchInputSchema = defineInputSchema({
  q: {
    type: z.string(),
    title: { en: "Search Query", "zh-CN": "搜索关键词" },
    description: {
      en: "Keywords to use for the Google video search.",
      "zh-CN": "用于 Google 视频搜索的关键词。",
    },
    isToolParam: true,
  },
  num: {
    type: z.number().optional(),
    title: { en: "Maximum Results", "zh-CN": "最大搜索数量" },
    description: {
      en: "Maximum number of video search results to return.",
      "zh-CN": "最多返回的视频搜索结果数量。",
    },
    isToolParam: true,
  },
  time_period: {
    type: z
      .enum(["last_hour", "last_day", "last_month", "last_week", "last_year"])
      .optional(),
    title: { en: "Time Period", "zh-CN": "搜索日期范围" },
    description: {
      en: "Optional time range for the video search: last hour, day, week, month, or year.",
      "zh-CN": "可选的视频搜索时间范围：最近一小时、一天、一周、一月或一年。",
    },
    isToolParam: true,
  },
});
const googleVideosSearchOutputSchema = defineOutputSchema({
  result: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.any().optional(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the video result.",
            "zh-CN": "视频搜索结果标题。",
          },
        },
        link: {
          type: z.any().optional(),
          title: { en: "Link", "zh-CN": "链接" },
          description: {
            en: "URL of the video result.",
            "zh-CN": "视频搜索结果链接。",
          },
        },
        snippet: {
          type: z.any().optional(),
          title: { en: "Snippet", "zh-CN": "摘要" },
          description: {
            en: "Text snippet from the video result.",
            "zh-CN": "视频搜索结果文本摘要。",
          },
        },
        highlighted: {
          type: z.any().optional(),
          title: { en: "Highlighted details", "zh-CN": "高亮详情" },
          description: {
            en: "Highlighted result details, when available.",
            "zh-CN": "高亮展示的结果详情（如有）。",
          },
        },
      }),
    ),
    title: { en: "Video Search Results", "zh-CN": "视频搜索结果" },
    description: {
      en: "Video search results returned by Google.",
      "zh-CN": "Google 返回的视频搜索结果。",
    },
  },
});

const googleVideosSearchHandler = createToolHandler({
  inputSchema: googleVideosSearchInputSchema,
  outputSchema: googleVideosSearchOutputSchema,
  secretSchema: googleVideosSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleVideosSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await googleVideosSearchTool(parsedInput);
    return googleVideosSearchOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "searchApi",
    name: {
      en: "SearchApi Search Tools",
      "zh-CN": "SearchApi 搜索工具",
    },
    description: {
      en: "Search the web, images, news, and videos using Baidu and Google through SearchApi.",
      "zh-CN": "通过 SearchApi 使用百度和 Google 搜索网页、图片、新闻和视频。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial release",
      "zh-CN": "初始版本",
    },
    tags: ["search"],
  },
  secretSchema,
  children: [
    {
      id: "baiduSearch",
      name: {
        en: "Baidu Search",
        "zh-CN": "百度搜索",
      },
      description: {
        en: "Search the web with Baidu and return results for the supplied query.",
        "zh-CN": "使用百度搜索网页，并返回指定查询词的结果。",
      },
      handler: baiduSearchHandler,
    },
    {
      id: "googleImagesSearch",
      name: {
        en: "Google Image Search",
        "zh-CN": "Google 图片搜索",
      },
      description: {
        en: "Search Google Images for the supplied query, optionally restricted to a time range.",
        "zh-CN": "使用指定查询词搜索 Google 图片，并可按时间范围筛选。",
      },
      handler: googleImagesSearchHandler,
    },
    {
      id: "googleNewsSearch",
      name: {
        en: "Google News Search",
        "zh-CN": "Google 新闻搜索",
      },
      description: {
        en: "Search Google News for the supplied query, optionally restricted to a time range.",
        "zh-CN": "使用指定查询词搜索 Google 新闻，并可按时间范围筛选。",
      },
      handler: googleNewsSearchHandler,
    },
    {
      id: "googleSearch",
      name: {
        en: "Google Search",
        "zh-CN": "Google 搜索",
      },
      description: {
        en: "Search the web with Google and optionally restrict results to a time range.",
        "zh-CN": "使用 Google 搜索网页，并可按时间范围筛选结果。",
      },
      handler: googleSearchHandler,
    },
    {
      id: "googleVideosSearch",
      name: {
        en: "Google Video Search",
        "zh-CN": "Google 视频搜索",
      },
      description: {
        en: "Search Google Videos for the supplied query, optionally restricted to a time range.",
        "zh-CN": "使用指定查询词搜索 Google 视频，并可按时间范围筛选。",
      },
      handler: googleVideosSearchHandler,
    },
  ],
});

export default toolSet;
