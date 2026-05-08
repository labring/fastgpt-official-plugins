import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
const abstractExtractionInputSchema = z
  .object({
    arxivId: z.string().meta({
      title: "ArXiv ID",
      description: "要提取摘要的论文 ArXiv ID",
      toolDescription:
        '要提取摘要的论文 ArXiv ID，例如: "2301.00001", "arXiv:2301.00001", "1706.03762" 等',
    }),
  });
const abstractExtractionOutputSchema = z
  .object({
    abstract: z.record(z.string(), z.unknown()).meta({
      title: "摘要信息",
      description:
        "提取的论文摘要信息，包含标题、作者、摘要内容、发布时间、链接等，如果未找到则为空",
    }),
  });

const abstractExtractionHandler = createToolHandler({
  inputSchema: abstractExtractionInputSchema,
  outputSchema: abstractExtractionOutputSchema,
  secretSchema: abstractExtractionSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await abstractExtractionInputType.parseAsync(input);
    const output = await abstractExtractionTool(parsedInput, ctx);
    return abstractExtractionOutputType.parseAsync(output);
  },
});

const arxivIDSearchSecretSchema = z.object({});
const arxivIDSearchInputSchema = z
  .object({
    arxivId: z.string().meta({
      title: "ArXiv ID",
      description: "要查找的论文 ArXiv ID",
      toolDescription:
        '要查找的论文 ArXiv ID，例如: "2301.00001", "arXiv:2301.00001", "cs-LG/0001001" 等',
    }),
  });
const arxivIDSearchOutputSchema = z
  .object({
    paper: z.record(z.string(), z.unknown()).meta({
      title: "论文信息",
      description:
        "查找到的论文详细信息，包含标题、作者、摘要、链接等，如果未找到则为空",
    }),
  });

const arxivIDSearchHandler = createToolHandler({
  inputSchema: arxivIDSearchInputSchema,
  outputSchema: arxivIDSearchOutputSchema,
  secretSchema: arxivIDSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await arxivIDSearchInputType.parseAsync(input);
    const output = await arxivIDSearchTool(parsedInput, ctx);
    return arxivIDSearchOutputType.parseAsync(output);
  },
});

const authorSearchSecretSchema = z.object({});
const authorSearchInputSchema = z
  .object({
    author: z.string().meta({
      title: "作者名",
      description: "要搜索的论文作者名",
      toolDescription: '要搜索的论文作者名，例如: "Yann LeCun", "Smith, J" 等',
    }),
    maxResults: z.number().optional().meta({
      title: "最大结果数",
      description: "返回的最大论文数量 (1-50)",
    }),
    sortBy: z.enum(["relevance","lastUpdatedDate","submittedDate"]).optional().meta({
      title: "排序方式",
      description: "结果排序方式",
    }),
  });
const authorSearchOutputSchema = z
  .object({
    papers: z.array(z.record(z.string(), z.unknown())).meta({
      title: "论文列表",
      description: "搜索到的论文列表，包含标题、作者、摘要、链接等信息",
    }),
  });

const authorSearchHandler = createToolHandler({
  inputSchema: authorSearchInputSchema,
  outputSchema: authorSearchOutputSchema,
  secretSchema: authorSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await authorSearchInputType.parseAsync(input);
    const output = await authorSearchTool(parsedInput, ctx);
    return authorSearchOutputType.parseAsync(output);
  },
});

const keywordSearchSecretSchema = z.object({});
const keywordSearchInputSchema = z.object({
  keyword: z.string().meta({
    title: "搜索关键词",
    description: "要搜索的论文关键词",
    toolDescription:
      '要搜索的论文关键词，例如: "machine learning", "neural networks" 等',
  }),
  maxResults: z
    .number()
    .meta({
      title: "最大结果数",
      description: "返回的最大论文数量 (1-50)",
    })
    .default(5),
  sortBy: z.enum(["相关度", "最后更新时间", "提交时间"]).meta({
    title: "排序方式",
    description: "结果排序方式",
  }),
});

const keywordSearchOutputSchema = z
  .object({
    papers: z.array(z.record(z.string(), z.unknown())).meta({
      title: "论文列表",
      description: "搜索到的论文列表，包含标题、作者、摘要、链接等信息",
    }),
  });

const keywordSearchHandler = createToolHandler({
  inputSchema: keywordSearchInputSchema,
  outputSchema: keywordSearchOutputSchema,
  secretSchema: keywordSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await keywordSearchInputType.parseAsync(input);
    const output = await keywordSearchTool(parsedInput, ctx);
    return keywordSearchOutputType.parseAsync(output);
  },
});

const metadataExtractionSecretSchema = z.object({});
const metadataExtractionInputSchema = z
  .object({
    arxivId: z.string().meta({
      title: "ArXiv ID",
      description: "要提取元数据的论文 ArXiv ID",
      toolDescription:
        '要提取元数据的论文 ArXiv ID，例如: "2301.00001", "arXiv:2301.00001", "1706.03762" 等',
    }),
  });
const metadataExtractionOutputSchema = z
  .object({
    metadata: z.record(z.string(), z.unknown()).meta({
      title: "论文元数据",
      description:
        "提取的论文完整元数据，包含标题、作者、摘要、分类、版本、DOI、PDF下载链接等详细信息，如果未找到则为空",
    }),
  });

const metadataExtractionHandler = createToolHandler({
  inputSchema: metadataExtractionInputSchema,
  outputSchema: metadataExtractionOutputSchema,
  secretSchema: metadataExtractionSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await metadataExtractionInputType.parseAsync(input);
    const output = await metadataExtractionTool(parsedInput, ctx);
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
      "zh-CN": "Initial version",
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
