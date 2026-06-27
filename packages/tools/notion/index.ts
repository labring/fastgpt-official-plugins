import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as createPageInputType,
  OutputType as createPageOutputType,
  tool as createPageTool,
} from "./children/createPage";
import {
  InputType as getBlockChildrenInputType,
  OutputType as getBlockChildrenOutputType,
  tool as getBlockChildrenTool,
} from "./children/getBlockChildren";
import {
  InputType as getPageInputType,
  OutputType as getPageOutputType,
  tool as getPageTool,
} from "./children/getPage";
import {
  InputType as queryDataSourceInputType,
  OutputType as queryDataSourceOutputType,
  tool as queryDataSourceTool,
} from "./children/queryDataSource";
import {
  InputType as searchInputType,
  OutputType as searchOutputType,
  tool as searchTool,
} from "./children/search";

const secretSchema = z.object({
  integrationToken: z.string().meta({
    title: "Notion Integration Token",
    description: "Notion Internal Integration Secret，例如 ntn_...",
    isSecret: true,
  }),
});

const searchSecretSchema = z.object({});
const searchInputSchema = z.object({
  query: z.string().optional().meta({
    title: "Query",
    description: "搜索关键词，留空时按 Notion 默认排序返回",
    toolDescription: "Text query for Notion search.",
  }),
  objectType: z.enum(["page", "database", "data_source"]).optional().meta({
    title: "Object Type",
    description: "可选，限制搜索对象类型",
    toolDescription: "Optional Notion object type filter.",
  }),
  pageSize: z.number().int().min(1).max(100).optional().meta({
    title: "Page Size",
    description: "返回数量，范围 1-100，默认 10",
    toolDescription: "Maximum number of Notion search results.",
  }),
  cursor: z.string().optional().meta({
    title: "Cursor",
    description: "分页 cursor",
    toolDescription: "Pagination cursor from a previous search call.",
  }),
});
const searchOutputSchema = z.object({
  results: z.array(
    z.object({
      object: z.string(),
      id: z.string(),
      title: z.string(),
      url: z.string(),
      archived: z.boolean(),
      in_trash: z.boolean(),
      created_time: z.string(),
      last_edited_time: z.string(),
    }),
  ),
  has_more: z.boolean(),
  next_cursor: z.string(),
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

const getPageSecretSchema = z.object({});
const getPageInputSchema = z.object({
  pageId: z.string().meta({
    title: "Page ID",
    description: "Notion page ID",
    toolDescription: "Notion page ID to retrieve.",
  }),
});
const getPageOutputSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  archived: z.boolean(),
  in_trash: z.boolean(),
  created_time: z.string(),
  last_edited_time: z.string(),
  properties_json: z.string(),
});
const getPageHandler = createToolHandler({
  inputSchema: getPageInputSchema,
  outputSchema: getPageOutputSchema,
  secretSchema: getPageSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getPageInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getPageTool(parsedInput);
    return getPageOutputType.parseAsync(output);
  },
});

const getBlockChildrenSecretSchema = z.object({});
const getBlockChildrenInputSchema = z.object({
  blockId: z.string().meta({
    title: "Block ID",
    description: "Notion block/page ID",
    toolDescription: "Notion block or page ID whose children should be listed.",
  }),
  pageSize: z.number().int().min(1).max(100).optional().meta({
    title: "Page Size",
    description: "返回数量，范围 1-100，默认 20",
    toolDescription: "Maximum number of child blocks.",
  }),
  cursor: z.string().optional().meta({
    title: "Cursor",
    description: "分页 cursor",
    toolDescription: "Pagination cursor from a previous block children call.",
  }),
});
const getBlockChildrenOutputSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      text: z.string(),
      has_children: z.boolean(),
      archived: z.boolean(),
      in_trash: z.boolean(),
    }),
  ),
  has_more: z.boolean(),
  next_cursor: z.string(),
});
const getBlockChildrenHandler = createToolHandler({
  inputSchema: getBlockChildrenInputSchema,
  outputSchema: getBlockChildrenOutputSchema,
  secretSchema: getBlockChildrenSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getBlockChildrenInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getBlockChildrenTool(parsedInput);
    return getBlockChildrenOutputType.parseAsync(output);
  },
});

const queryDataSourceSecretSchema = z.object({});
const queryDataSourceInputSchema = z.object({
  dataSourceId: z.string().meta({
    title: "Data Source ID",
    description: "Notion data source ID",
    toolDescription: "Notion data source ID to query.",
  }),
  filterJson: z.string().optional().meta({
    title: "Filter JSON",
    description: "Notion filter JSON object",
    toolDescription: "Optional Notion filter JSON object.",
  }),
  sortsJson: z.string().optional().meta({
    title: "Sorts JSON",
    description: '形如 {"sorts":[...]} 的排序 JSON',
    toolDescription: "Optional JSON object with a sorts array.",
  }),
  pageSize: z.number().int().min(1).max(100).optional().meta({
    title: "Page Size",
    description: "返回数量，范围 1-100，默认 20",
    toolDescription: "Maximum number of pages to return.",
  }),
  cursor: z.string().optional().meta({
    title: "Cursor",
    description: "分页 cursor",
    toolDescription: "Pagination cursor from a previous data source query.",
  }),
});
const queryDataSourceOutputSchema = z.object({
  results: z.array(
    z.object({
      object: z.string(),
      id: z.string(),
      title: z.string(),
      url: z.string(),
      archived: z.boolean(),
      in_trash: z.boolean(),
      created_time: z.string(),
      last_edited_time: z.string(),
      properties_json: z.string(),
    }),
  ),
  has_more: z.boolean(),
  next_cursor: z.string(),
});
const queryDataSourceHandler = createToolHandler({
  inputSchema: queryDataSourceInputSchema,
  outputSchema: queryDataSourceOutputSchema,
  secretSchema: queryDataSourceSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await queryDataSourceInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await queryDataSourceTool(parsedInput);
    return queryDataSourceOutputType.parseAsync(output);
  },
});

const createPageSecretSchema = z.object({});
const createPageInputSchema = z.object({
  parentType: z.enum(["page_id", "data_source_id"]).meta({
    title: "Parent Type",
    description: "父级类型：page_id 或 data_source_id",
    toolDescription: "Notion parent type for the new page.",
  }),
  parentId: z.string().meta({
    title: "Parent ID",
    description: "父级 page/data source ID",
    toolDescription: "Notion parent page or data source ID.",
  }),
  propertiesJson: z.string().meta({
    title: "Properties JSON",
    description: "Notion properties JSON object",
    toolDescription: "Notion page properties JSON object.",
  }),
  childrenJson: z.string().optional().meta({
    title: "Children JSON",
    description: "可选 Notion block children JSON array",
    toolDescription: "Optional Notion children blocks JSON array.",
  }),
});
const createPageOutputSchema = z.object({
  id: z.string(),
  url: z.string(),
  archived: z.boolean(),
  in_trash: z.boolean(),
  created_time: z.string(),
  last_edited_time: z.string(),
});
const createPageHandler = createToolHandler({
  inputSchema: createPageInputSchema,
  outputSchema: createPageOutputSchema,
  secretSchema: createPageSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await createPageInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await createPageTool(parsedInput);
    return createPageOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "notion",
    name: {
      en: "Notion Tool Set",
      "zh-CN": "Notion 工具集",
    },
    description: {
      en: "Search, read, query, and create Notion pages with the Notion API.",
      "zh-CN": "通过 Notion API 搜索、读取、查询和创建 Notion 页面。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial Notion tool suite",
      "zh-CN": "初始 Notion 工具集版本",
    },
    toolDescription:
      "Notion tool suite for search, page retrieval, block children, data source query, and page creation.",
    tags: ["productivity", "tools"],
  },
  secretSchema,
  children: [
    {
      id: "search",
      name: {
        en: "Search",
        "zh-CN": "搜索",
      },
      description: {
        en: "Search Notion pages, databases, or data sources with cursor pagination.",
        "zh-CN": "分页搜索 Notion 页面、database 或 data source。",
      },
      toolDescription:
        "Search Notion pages, databases, or data sources using the Notion search API.",
      handler: searchHandler,
    },
    {
      id: "getPage",
      name: {
        en: "Get Page",
        "zh-CN": "获取页面",
      },
      description: {
        en: "Retrieve a Notion page and return normalized metadata plus raw properties JSON.",
        "zh-CN": "读取 Notion 页面并返回标准化元数据和 properties JSON。",
      },
      toolDescription: "Retrieve a Notion page by page ID.",
      handler: getPageHandler,
    },
    {
      id: "getBlockChildren",
      name: {
        en: "Get Block Children",
        "zh-CN": "获取子块",
      },
      description: {
        en: "List child blocks for a Notion block or page and extract plain text.",
        "zh-CN": "列出 Notion block/page 的子块并抽取纯文本。",
      },
      toolDescription: "List Notion child blocks for a block or page ID.",
      handler: getBlockChildrenHandler,
    },
    {
      id: "queryDataSource",
      name: {
        en: "Query Data Source",
        "zh-CN": "查询数据源",
      },
      description: {
        en: "Query a Notion data source with optional filter and sorts JSON.",
        "zh-CN": "用可选 filter 和 sorts JSON 查询 Notion data source。",
      },
      toolDescription:
        "Query a Notion data source and return page metadata plus raw properties JSON.",
      handler: queryDataSourceHandler,
    },
    {
      id: "createPage",
      name: {
        en: "Create Page",
        "zh-CN": "创建页面",
      },
      description: {
        en: "Create a Notion page under a parent page or data source with Notion properties JSON.",
        "zh-CN":
          "通过 Notion properties JSON 在页面或 data source 下创建页面。",
      },
      toolDescription:
        "Create a Notion page under a parent page or data source using the Notion pages API.",
      handler: createPageHandler,
    },
  ],
});

export default toolSet;
