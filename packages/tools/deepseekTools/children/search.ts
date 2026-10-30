import {
  defineInputSchema,
  defineOutputSchema,
} from "@fastgpt-plugin/sdk-factory";
import { z } from "zod";
import {
  type DeepSeekSearchResponse,
  formatSearchResultsText,
  postDeepSeek,
} from "../utils/client";

export const inputSchema = defineInputSchema({
  query: {
    type: z.string().trim().min(1).max(128),
    title: { en: "Search query", "zh-CN": "搜索查询词" },
    description: {
      en: "Search terms or query string (1-128 characters), supporting operators like site:, -site:, lang:, after:, before:.",
      "zh-CN":
        "搜索关键词或查询语句（1-128个字符）。支持高级操作符如 site:、-site:、lang:、after:、before: 等。",
    },
    isToolParam: true,
  },
  count: {
    type: z.number().int().min(1).max(50).optional().default(10),
    title: { en: "Result count", "zh-CN": "返回数量" },
    description: {
      en: "Number of results to return (1-50, default: 10).",
      "zh-CN": "返回结果数量（1-50），默认为 10。",
    },
    isToolParam: true,
  },
  need_content: {
    type: z.boolean().optional().default(false),
    title: { en: "Include webpage content", "zh-CN": "返回正文内容" },
    description: {
      en: "Whether to return full webpage content in Markdown format, default: false.",
      "zh-CN": "是否在结果中返回网页正文 Markdown 内容，默认为 false。",
    },
    isToolParam: true,
  },
  ori_question: {
    type: z.string().max(128).optional(),
    title: { en: "Original question", "zh-CN": "用户原始问题" },
    description: {
      en: "User's original question that triggered the search, improving search understanding.",
      "zh-CN":
        "触发搜索的用户原始问题（1-128个字符），用于提升搜索理解准确度。",
    },
    isToolParam: true,
  },
  localization: {
    type: z.string().optional(),
    title: { en: "Localization IP", "zh-CN": "本地化 IP" },
    description: {
      en: "Optional IP address used to localize search results.",
      "zh-CN": "用于根据地理位置本地化搜索结果的 IP 地址。",
    },
    isToolParam: false,
  },
});

export const outputSchema = defineOutputSchema({
  results: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.string().default(""),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the search result.",
            "zh-CN": "搜索结果标题。",
          },
        },
        url: {
          type: z.string().default(""),
          title: { en: "URL", "zh-CN": "链接" },
          description: {
            en: "URL of the search result.",
            "zh-CN": "搜索结果链接。",
          },
        },
        snippet: {
          type: z.string().default(""),
          title: { en: "Snippet", "zh-CN": "摘要" },
          description: {
            en: "Short snippet (100-200 chars) for UI presentation.",
            "zh-CN": "简短摘要（100-200字），适合界面直接展示。",
          },
        },
        summary: {
          type: z.string().default(""),
          title: { en: "Summary", "zh-CN": "详细摘要" },
          description: {
            en: "Long summary (600-800 chars) designed for LLM context.",
            "zh-CN": "较长摘要（600-800字），专为大语言模型阅读设计。",
          },
        },
        content: {
          type: z.string().optional(),
          title: { en: "Content", "zh-CN": "网页正文" },
          description: {
            en: "Webpage markdown content when need_content is true.",
            "zh-CN": "抓取到的网页正文 Markdown 内容（需开启 need_content）。",
          },
        },
        site_name: {
          type: z.string().nullable().optional(),
          title: { en: "Site name", "zh-CN": "网站名称" },
          description: {
            en: "Name of the website.",
            "zh-CN": "网站名称。",
          },
        },
        site_icon: {
          type: z.string().nullable().optional(),
          title: { en: "Site icon", "zh-CN": "网站图标" },
          description: {
            en: "Icon URL of the website.",
            "zh-CN": "网站图标。",
          },
        },
        date: {
          type: z.string().nullable().optional(),
          title: { en: "Publish date", "zh-CN": "发布日期" },
          description: {
            en: "Publication date in UTC RFC 3339 format.",
            "zh-CN": "发布日期。",
          },
        },
        rerank_score: {
          type: z.number().optional(),
          title: { en: "Rerank score", "zh-CN": "相关性得分" },
          description: {
            en: "Relevance score between 0 and 3, scores >= 1.5 are high quality.",
            "zh-CN": "0到3之间的相关度评分，1.5分以上为高质量结果。",
          },
        },
        authority: {
          type: z.number().optional(),
          title: { en: "Authority tier", "zh-CN": "权威度评级" },
          description: {
            en: "Authority tier (0-4), tier >= 3 indicates high authority sources.",
            "zh-CN":
              "0到4的网站权威等级（-1表示未知），3及以上代表高权威度来源。",
          },
        },
      }),
    ),
    title: { en: "Search results", "zh-CN": "搜索结果列表" },
    description: {
      en: "Structured list of search results returned by DeepSeek Search.",
      "zh-CN": "DeepSeek 搜索返回的结构化网页结果列表。",
    },
  },
  formatText: {
    type: z.string(),
    title: { en: "Formatted text", "zh-CN": "格式化文本" },
    description: {
      en: "Pre-formatted Markdown text suitable for direct LLM context ingestion.",
      "zh-CN":
        "预先排版好的 Markdown 格式搜索结果，便于直接提供给大模型作为参考上下文。",
    },
  },
});

export async function tool(
  input: z.infer<typeof inputSchema>,
  apiKey: string,
): Promise<z.infer<typeof outputSchema>> {
  const { query, count, need_content, ori_question, localization } = input;

  const payload: Record<string, unknown> = {
    query,
    count,
    need_content,
  };

  if (ori_question?.trim()) {
    payload.ori_question = ori_question.trim();
  }

  if (localization?.trim()) {
    payload.localization = localization.trim();
  }

  const response = await postDeepSeek<DeepSeekSearchResponse>(
    "/v1/tools/search",
    apiKey,
    payload,
  );

  const rawResults = response?.results || [];

  const results = rawResults.map((item) => ({
    title: item.title || "",
    url: item.url || "",
    snippet: item.snippet || "",
    summary: item.summary || "",
    content: item.content || undefined,
    site_name: item.site_name ?? null,
    site_icon: item.site_icon ?? null,
    date: item.date ?? null,
    rerank_score:
      typeof item.rerank_score === "number" ? item.rerank_score : undefined,
    authority: typeof item.authority === "number" ? item.authority : undefined,
  }));

  const formatText = formatSearchResultsText(results);

  return {
    results,
    formatText,
  };
}
