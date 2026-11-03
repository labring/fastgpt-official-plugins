import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as abstractExtractionInputType,
  OutputType as abstractExtractionOutputType,
  tool as abstractExtractionTool,
} from "./children/abstractExtraction";
import {
  InputType as arxivIDSearchInputType,
  OutputType as arxivIDSearchOutputType,
  tool as arxivIDSearchTool,
} from "./children/arxivIDSearch";
import {
  InputType as authorSearchInputType,
  OutputType as authorSearchOutputType,
  tool as authorSearchTool,
} from "./children/authorSearch";
import {
  InputType as keywordSearchInputType,
  OutputType as keywordSearchOutputType,
  tool as keywordSearchTool,
} from "./children/keywordSearch";
import {
  InputType as metadataExtractionInputType,
  OutputType as metadataExtractionOutputType,
  tool as metadataExtractionTool,
} from "./children/metadataExtraction";

const secretSchema = z.object({});

const abstractExtractionSecretSchema = z.object({});
const abstractExtractionInputSchema = defineInputSchema({
  arxivId: {
    type: z.string(),
    title: { en: "ArXiv ID", "zh-CN": "ArXiv 论文 ID" },
    description: {
      en: "ArXiv ID of the paper whose abstract to extract, e.g. 2301.00001 or arXiv:2301.00001.",
      "zh-CN":
        "要提取摘要的论文 ArXiv ID，例如：2301.00001 或 arXiv:2301.00001。",
    },
    isToolParam: true,
  },
});
const abstractExtractionOutputSchema = defineOutputSchema({
  abstract: {
    type: defineOutputSchema({
      arxivId: {
        type: z.string().default(""),
        title: { en: "ArXiv ID", "zh-CN": "ArXiv 论文 ID" },
      },
      title: {
        type: z.string().default(""),
        title: { en: "Title", "zh-CN": "标题" },
      },
      abstract: {
        type: z.string().default(""),
        title: { en: "Abstract", "zh-CN": "摘要" },
      },
      authors: {
        type: z.array(z.string()).default([]),
        title: { en: "Authors", "zh-CN": "作者列表" },
      },
      published: {
        type: z.string().default(""),
        title: { en: "Published date", "zh-CN": "发布日期" },
      },
      link: {
        type: z.string().default(""),
        title: { en: "Paper link", "zh-CN": "论文链接" },
      },
    }).nullable(),
    title: { en: "Abstract information", "zh-CN": "摘要信息" },
    description: {
      en: "Extracted paper abstract details, including title, authors, abstract, publication date, and links; null if not found.",
      "zh-CN":
        "提取的论文摘要信息，包含标题、作者、摘要内容、发布时间和链接；未找到时为 null。",
    },
  },
});

const arxivIDSearchSecretSchema = z.object({});
const arxivIDSearchInputSchema = defineInputSchema({
  arxivId: {
    type: z.string(),
    title: { en: "ArXiv ID", "zh-CN": "ArXiv 论文 ID" },
    description: {
      en: "ArXiv ID of the paper to find, e.g. 2301.00001 or arXiv:2301.00001.",
      "zh-CN": "要查找的论文 ArXiv ID，例如：2301.00001 或 arXiv:2301.00001。",
    },
    isToolParam: true,
  },
});
const arxivIDSearchOutputSchema = defineOutputSchema({
  paper: {
    type: defineOutputSchema({
      title: {
        type: z.string().default(""),
        title: { en: "Title", "zh-CN": "标题" },
      },
      authors: {
        type: z.array(z.string()).default([]),
        title: { en: "Authors", "zh-CN": "作者列表" },
      },
      summary: {
        type: z.string().default(""),
        title: { en: "Summary", "zh-CN": "摘要" },
      },
      link: {
        type: z.string().default(""),
        title: { en: "Paper link", "zh-CN": "论文链接" },
      },
      published: {
        type: z.string().default(""),
        title: { en: "Published date", "zh-CN": "发布日期" },
      },
      arxivId: {
        type: z.string().default(""),
        title: { en: "ArXiv ID", "zh-CN": "ArXiv 论文 ID" },
      },
    }).nullable(),
    title: { en: "Paper information", "zh-CN": "论文信息" },
    description: {
      en: "Detailed paper information, including title, authors, abstract, and links; null if not found.",
      "zh-CN":
        "查找到的论文详细信息，包含标题、作者、摘要和链接；未找到时为 null。",
    },
  },
});

const abstractExtractionHandler = createToolHandler({
  inputSchema: abstractExtractionInputSchema,
  outputSchema: abstractExtractionOutputSchema,
  secretSchema: abstractExtractionSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await abstractExtractionInputType.parseAsync(input);
    const output = await abstractExtractionTool(parsedInput);
    return abstractExtractionOutputType.parseAsync(output);
  },
});

const arxivIDSearchHandler = createToolHandler({
  inputSchema: arxivIDSearchInputSchema,
  outputSchema: arxivIDSearchOutputSchema,
  secretSchema: arxivIDSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await arxivIDSearchInputType.parseAsync(input);
    const output = await arxivIDSearchTool(parsedInput);
    return arxivIDSearchOutputType.parseAsync(output);
  },
});

const authorSearchSecretSchema = z.object({});
const authorSearchInputSchema = defineInputSchema({
  author: {
    type: z.string(),
    title: { en: "Author", "zh-CN": "作者名" },
    description: {
      en: "Paper author name to search for, e.g. Yann LeCun or Smith, J.",
      "zh-CN": "要搜索的论文作者名，例如：Yann LeCun 或 Smith, J。",
    },
    isToolParam: true,
  },
  maxResults: {
    type: z.number().optional(),
    title: { en: "Maximum results", "zh-CN": "最大结果数" },
    description: {
      en: "Maximum number of papers to return (1–50).",
      "zh-CN": "返回的最大论文数量（1-50）。",
    },
    isToolParam: true,
  },
  sortBy: {
    type: z.enum(["relevance", "lastUpdatedDate", "submittedDate"]).optional(),
    title: { en: "Sort order", "zh-CN": "排序方式" },
    description: { en: "How to sort the results.", "zh-CN": "结果排序方式。" },
    isToolParam: true,
  },
});
const authorSearchOutputSchema = defineOutputSchema({
  papers: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.string().default(""),
          title: { en: "Title", "zh-CN": "标题" },
        },
        authors: {
          type: z.array(z.string()).default([]),
          title: { en: "Authors", "zh-CN": "作者列表" },
        },
        summary: {
          type: z.string().default(""),
          title: { en: "Summary", "zh-CN": "摘要" },
        },
        link: {
          type: z.string().default(""),
          title: { en: "Paper link", "zh-CN": "论文链接" },
        },
        published: {
          type: z.string().default(""),
          title: { en: "Published date", "zh-CN": "发布日期" },
        },
      }),
    ),
    title: { en: "Papers", "zh-CN": "论文列表" },
    description: {
      en: "Papers found, including titles, authors, abstracts, and links.",
      "zh-CN": "搜索到的论文列表，包含标题、作者、摘要、链接等信息。",
    },
  },
});

const authorSearchHandler = createToolHandler({
  inputSchema: authorSearchInputSchema,
  outputSchema: authorSearchOutputSchema,
  secretSchema: authorSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await authorSearchInputType.parseAsync(input);
    const output = await authorSearchTool(parsedInput);
    return authorSearchOutputType.parseAsync(output);
  },
});

const keywordSearchSecretSchema = z.object({});
const keywordSearchInputSchema = defineInputSchema({
  keyword: {
    type: z.string(),
    title: { en: "Keyword", "zh-CN": "搜索关键词" },
    description: {
      en: "Paper search keyword, e.g. machine learning or neural networks.",
      "zh-CN": "要搜索的论文关键词，例如：machine learning、neural networks。",
    },
    isToolParam: true,
  },
  maxResults: {
    type: z.number().default(5),
    title: { en: "Maximum results", "zh-CN": "最大结果数" },
    description: {
      en: "Maximum number of papers to return (1–50).",
      "zh-CN": "返回的最大论文数量（1-50）。",
    },
    isToolParam: true,
  },
  sortBy: {
    type: z.enum(["relevance", "lastUpdatedDate", "submittedDate"]),
    title: { en: "Sort order", "zh-CN": "排序方式" },
    description: { en: "How to sort the results.", "zh-CN": "结果排序方式。" },
    isToolParam: true,
  },
});
const keywordSearchOutputSchema = defineOutputSchema({
  papers: {
    type: z.array(
      defineOutputSchema({
        title: {
          type: z.string().default(""),
          title: { en: "Title", "zh-CN": "标题" },
        },
        authors: {
          type: z.array(z.string()).default([]),
          title: { en: "Authors", "zh-CN": "作者列表" },
        },
        summary: {
          type: z.string().default(""),
          title: { en: "Summary", "zh-CN": "摘要" },
        },
        link: {
          type: z.string().default(""),
          title: { en: "Paper link", "zh-CN": "论文链接" },
        },
        published: {
          type: z.string().default(""),
          title: { en: "Published date", "zh-CN": "发布日期" },
        },
      }),
    ),
    title: { en: "Papers", "zh-CN": "论文列表" },
    description: {
      en: "Papers found, including titles, authors, abstracts, and links.",
      "zh-CN": "搜索到的论文列表，包含标题、作者、摘要、链接等信息。",
    },
  },
});

const keywordSearchHandler = createToolHandler({
  inputSchema: keywordSearchInputSchema,
  outputSchema: keywordSearchOutputSchema,
  secretSchema: keywordSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await keywordSearchInputType.parseAsync(input);
    const output = await keywordSearchTool(parsedInput);
    return keywordSearchOutputType.parseAsync(output);
  },
});

const metadataExtractionSecretSchema = z.object({});
const metadataExtractionInputSchema = defineInputSchema({
  arxivId: {
    type: z.string(),
    title: { en: "ArXiv ID", "zh-CN": "ArXiv 论文 ID" },
    description: {
      en: "ArXiv ID of the paper whose metadata to extract, e.g. 2301.00001 or arXiv:2301.00001.",
      "zh-CN":
        "要提取元数据的论文 ArXiv ID，例如：2301.00001 或 arXiv:2301.00001。",
    },
    isToolParam: true,
  },
});
const metadataExtractionOutputSchema = defineOutputSchema({
  metadata: {
    type: defineOutputSchema({
      arxivId: {
        type: z.string().default(""),
        title: { en: "ArXiv ID", "zh-CN": "ArXiv 论文 ID" },
      },
      title: {
        type: z.string().default(""),
        title: { en: "Title", "zh-CN": "标题" },
      },
      authors: {
        type: z.array(z.string()).default([]),
        title: { en: "Authors", "zh-CN": "作者列表" },
      },
      abstract: {
        type: z.string().default(""),
        title: { en: "Abstract", "zh-CN": "摘要" },
      },
      categories: {
        type: z.array(z.string()).default([]),
        title: { en: "Categories", "zh-CN": "分类" },
      },
      primaryCategory: {
        type: z.string().default(""),
        title: { en: "Primary category", "zh-CN": "主要分类" },
      },
      published: {
        type: z.string().default(""),
        title: { en: "Published date", "zh-CN": "发布日期" },
      },
      updated: {
        type: z.string().default(""),
        title: { en: "Updated date", "zh-CN": "更新日期" },
      },
      version: {
        type: z.string().default(""),
        title: { en: "Version", "zh-CN": "版本" },
      },
      doi: {
        type: z.string().default(""),
        title: { en: "DOI", "zh-CN": "DOI" },
      },
      journalRef: {
        type: z.string().default(""),
        title: { en: "Journal reference", "zh-CN": "期刊引用" },
      },
      comments: {
        type: z.string().default(""),
        title: { en: "Comments", "zh-CN": "评论" },
      },
      links: {
        type: defineOutputSchema({
          abstract: {
            type: z.string().default(""),
            title: { en: "Abstract link", "zh-CN": "摘要链接" },
          },
          pdf: {
            type: z.string().default(""),
            title: { en: "PDF link", "zh-CN": "PDF 链接" },
          },
          source: {
            type: z.string().default(""),
            title: { en: "Source link", "zh-CN": "源文件链接" },
          },
        }),
        title: { en: "Links", "zh-CN": "链接" },
      },
      downloadUrls: {
        type: defineOutputSchema({
          pdf: {
            type: z.string().default(""),
            title: { en: "PDF download URL", "zh-CN": "PDF 下载链接" },
          },
          source: {
            type: z.string().default(""),
            title: { en: "Source download URL", "zh-CN": "源文件下载链接" },
          },
          other: {
            type: z.array(z.string()).default([]),
            title: { en: "Other download URLs", "zh-CN": "其他下载链接" },
          },
        }),
        title: { en: "Download URLs", "zh-CN": "下载链接" },
      },
    }).nullable(),
    title: { en: "Paper metadata", "zh-CN": "论文元数据" },
    description: {
      en: "Complete paper metadata including title, authors, abstract, categories, versions, DOI, and PDF URL; null if not found.",
      "zh-CN":
        "提取的论文完整元数据，包含标题、作者、摘要、分类、版本、DOI 和 PDF 下载链接等；未找到时为 null。",
    },
  },
});

const metadataExtractionHandler = createToolHandler({
  inputSchema: metadataExtractionInputSchema,
  outputSchema: metadataExtractionOutputSchema,
  secretSchema: metadataExtractionSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await metadataExtractionInputType.parseAsync(input);
    const output = await metadataExtractionTool(parsedInput);
    return metadataExtractionOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "arxiv",
    name: {
      en: "ArXiv Tools",
      "zh-CN": "ArXiv 工具集",
    },
    description: {
      en: "Provides ArXiv paper search functionalities, including keyword search, sorting, etc.",
      "zh-CN": "提供 ArXiv 论文检索相关功能，包括关键词搜索、排序等",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["scientific"],
  },
  secretSchema,
  children: [
    {
      id: "abstractExtraction",
      name: {
        en: "ArXiv Abstract Extraction",
        "zh-CN": "ArXiv 摘要提取",
      },
      description: {
        en: "Extract paper abstract information by ArXiv ID, including title, authors, abstract content, etc.",
        "zh-CN": "通过 ArXiv ID 提取论文摘要信息，包括标题、作者、摘要内容等",
      },
      handler: abstractExtractionHandler,
    },
    {
      id: "arxivIDSearch",
      name: {
        en: "ArXiv ID Paper Search",
        "zh-CN": "ArXiv ID 论文检索",
      },
      description: {
        en: "Search specific ArXiv paper by its ID to get detailed information",
        "zh-CN": "通过 ArXiv ID 精确查找特定论文的详细信息",
      },
      handler: arxivIDSearchHandler,
    },
    {
      id: "authorSearch",
      name: {
        en: "ArXiv Author Paper Search",
        "zh-CN": "ArXiv 作者论文检索",
      },
      description: {
        en: "Search ArXiv papers by author, supporting sorting by date and limiting result count",
        "zh-CN": "通过作者名搜索 ArXiv 论文，支持按时间排序和结果数量限制",
      },
      handler: authorSearchHandler,
    },
    {
      id: "keywordSearch",
      name: {
        en: "ArXiv Paper Search",
        "zh-CN": "ArXiv 论文检索",
      },
      description: {
        en: "Search ArXiv papers by keywords, supporting sorting by date and limiting result count",
        "zh-CN": "通过关键词搜索 ArXiv 论文，支持按时间排序和结果数量限制",
      },
      handler: keywordSearchHandler,
    },
    {
      id: "metadataExtraction",
      name: {
        en: "ArXiv Metadata Extraction",
        "zh-CN": "ArXiv 元数据提取",
      },
      description: {
        en: "Extract complete paper metadata by ArXiv ID, including title, authors, categories, PDF download links and other detailed information",
        "zh-CN":
          "通过 ArXiv ID 提取论文完整元数据，包括标题、作者、分类、PDF下载链接等详细信息",
      },
      handler: metadataExtractionHandler,
    },
  ],
});

export default toolSet;
