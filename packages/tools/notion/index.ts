import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
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
    description: "Notion internal integration secret, for example ntn_... .",
    "x-i18n": {
      title: { en: "Notion Integration Token", "zh-CN": "Notion 集成令牌" },
      description: {
        en: "Notion internal integration secret, for example ntn_... .",
        "zh-CN": "Notion 内部集成密钥，例如 ntn_...。",
      },
    },
    isSecret: true,
  }),
});

const searchSecretSchema = z.object({});
const searchInputSchema = defineInputSchema({
  query: {
    type: z.string().optional(),
    title: { en: "Query", "zh-CN": "查询词" },
    description: {
      en: "Text to search for in Notion; when omitted, results use Notion's default ordering.",
      "zh-CN": "在 Notion 中搜索的文本；留空时按 Notion 默认排序返回结果。",
    },
    isToolParam: true,
  },
  objectType: {
    type: z.enum(["page", "database", "data_source"]).optional(),
    title: { en: "Object Type", "zh-CN": "对象类型" },
    description: {
      en: "Optional filter that limits results to pages, databases, or data sources.",
      "zh-CN": "可选的对象类型筛选，可限制为页面、数据库或数据源。",
    },
    isToolParam: true,
  },
  pageSize: {
    type: z.number().int().min(1).max(100).optional(),
    title: { en: "Page Size", "zh-CN": "每页数量" },
    description: {
      en: "Number of results to return, from 1 to 100; defaults to 10.",
      "zh-CN": "返回数量，范围为 1–100，默认 10。",
    },
    isToolParam: true,
  },
  cursor: {
    type: z.string().optional(),
    title: { en: "Cursor", "zh-CN": "分页游标" },
    description: {
      en: "Pagination cursor from a previous search call.",
      "zh-CN": "上一次搜索调用返回的分页游标。",
    },
    isToolParam: true,
  },
});
const searchOutputSchema = defineOutputSchema({
  results: {
    type: z.array(
      defineOutputSchema({
        object: {
          type: z.string(),
          title: { en: "Object Type", "zh-CN": "对象类型" },
          description: {
            en: "Notion object type.",
            "zh-CN": "Notion 对象类型。",
          },
        },
        id: {
          type: z.string(),
          title: { en: "Object ID", "zh-CN": "对象 ID" },
          description: {
            en: "Notion object identifier.",
            "zh-CN": "Notion 对象标识符。",
          },
        },
        title: {
          type: z.string(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the Notion object.",
            "zh-CN": "Notion 对象标题。",
          },
        },
        url: {
          type: z.string(),
          title: { en: "URL", "zh-CN": "链接" },
          description: {
            en: "URL of the Notion object.",
            "zh-CN": "Notion 对象链接。",
          },
        },
        archived: {
          type: z.boolean(),
          title: { en: "Archived", "zh-CN": "已归档" },
          description: {
            en: "Whether the object is archived.",
            "zh-CN": "该对象是否已归档。",
          },
        },
        in_trash: {
          type: z.boolean(),
          title: { en: "In Trash", "zh-CN": "已移至回收站" },
          description: {
            en: "Whether the object is in the trash.",
            "zh-CN": "该对象是否已移至回收站。",
          },
        },
        created_time: {
          type: z.string(),
          title: { en: "Created At", "zh-CN": "创建时间" },
          description: {
            en: "Object creation timestamp.",
            "zh-CN": "对象创建时间。",
          },
        },
        last_edited_time: {
          type: z.string(),
          title: { en: "Last Edited At", "zh-CN": "最后编辑时间" },
          description: {
            en: "Timestamp of the most recent edit.",
            "zh-CN": "对象最近一次编辑时间。",
          },
        },
      }),
    ),
    title: { en: "Search Results", "zh-CN": "搜索结果" },
    description: {
      en: "Pages, databases, or data sources matching the search.",
      "zh-CN": "符合搜索条件的页面、数据库或数据源。",
    },
  },
  has_more: {
    type: z.boolean(),
    title: { en: "More Results Available", "zh-CN": "是否有更多结果" },
    description: {
      en: "Whether additional results are available.",
      "zh-CN": "是否还有更多结果可供查询。",
    },
  },
  next_cursor: {
    type: z.string(),
    title: { en: "Next Cursor", "zh-CN": "下一页游标" },
    description: {
      en: "Cursor to use when requesting the next page.",
      "zh-CN": "请求下一页时使用的游标。",
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

const getPageSecretSchema = z.object({});
const getPageInputSchema = defineInputSchema({
  pageId: {
    type: z.string(),
    title: { en: "Page ID", "zh-CN": "页面 ID" },
    description: {
      en: "Notion page ID to retrieve.",
      "zh-CN": "要读取的 Notion 页面 ID。",
    },
    isToolParam: true,
  },
});
const getPageOutputSchema = defineOutputSchema({
  id: {
    type: z.string(),
    title: { en: "Page ID", "zh-CN": "页面 ID" },
    description: {
      en: "Notion page identifier.",
      "zh-CN": "Notion 页面标识符。",
    },
  },
  title: {
    type: z.string(),
    title: { en: "Title", "zh-CN": "标题" },
    description: {
      en: "Title of the Notion page.",
      "zh-CN": "Notion 页面的标题。",
    },
  },
  url: {
    type: z.string(),
    title: { en: "URL", "zh-CN": "链接" },
    description: {
      en: "URL of the Notion page.",
      "zh-CN": "Notion 页面链接。",
    },
  },
  archived: {
    type: z.boolean(),
    title: { en: "Archived", "zh-CN": "已归档" },
    description: {
      en: "Whether the page is archived.",
      "zh-CN": "页面是否已归档。",
    },
  },
  in_trash: {
    type: z.boolean(),
    title: { en: "In Trash", "zh-CN": "已移至回收站" },
    description: {
      en: "Whether the page is in the trash.",
      "zh-CN": "页面是否已移至回收站。",
    },
  },
  created_time: {
    type: z.string(),
    title: { en: "Created At", "zh-CN": "创建时间" },
    description: { en: "Page creation timestamp.", "zh-CN": "页面创建时间。" },
  },
  last_edited_time: {
    type: z.string(),
    title: { en: "Last Edited At", "zh-CN": "最后编辑时间" },
    description: {
      en: "Timestamp of the most recent page edit.",
      "zh-CN": "页面最近一次编辑时间。",
    },
  },
  properties_json: {
    type: z.string(),
    title: { en: "Properties JSON", "zh-CN": "属性 JSON" },
    description: {
      en: "Page properties serialized as a JSON string.",
      "zh-CN": "以 JSON 字符串序列化的页面属性。",
    },
  },
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
const getBlockChildrenInputSchema = defineInputSchema({
  blockId: {
    type: z.string(),
    title: { en: "Block or Page ID", "zh-CN": "块或页面 ID" },
    description: {
      en: "Notion block or page ID whose children should be listed.",
      "zh-CN": "要列出其子项的 Notion 块或页面 ID。",
    },
    isToolParam: true,
  },
  pageSize: {
    type: z.number().int().min(1).max(100).optional(),
    title: { en: "Page Size", "zh-CN": "每页数量" },
    description: {
      en: "Number of child blocks to return, from 1 to 100; defaults to 20.",
      "zh-CN": "要返回的子块数量，范围为 1–100，默认 20。",
    },
    isToolParam: true,
  },
  cursor: {
    type: z.string().optional(),
    title: { en: "Cursor", "zh-CN": "分页游标" },
    description: {
      en: "Pagination cursor from a previous block-children call.",
      "zh-CN": "上一次查询子块调用返回的分页游标。",
    },
    isToolParam: true,
  },
});
const getBlockChildrenOutputSchema = defineOutputSchema({
  blocks: {
    type: z.array(
      defineOutputSchema({
        id: {
          type: z.string(),
          title: { en: "Block ID", "zh-CN": "块 ID" },
          description: {
            en: "Notion block identifier.",
            "zh-CN": "Notion 块标识符。",
          },
        },
        type: {
          type: z.string(),
          title: { en: "Block Type", "zh-CN": "块类型" },
          description: { en: "Notion block type.", "zh-CN": "Notion 块类型。" },
        },
        text: {
          type: z.string(),
          title: { en: "Text", "zh-CN": "文本" },
          description: {
            en: "Plain text extracted from the block.",
            "zh-CN": "从块中提取的纯文本。",
          },
        },
        has_children: {
          type: z.boolean(),
          title: { en: "Has Children", "zh-CN": "包含子项" },
          description: {
            en: "Whether the block has child blocks.",
            "zh-CN": "该块是否包含子块。",
          },
        },
        archived: {
          type: z.boolean(),
          title: { en: "Archived", "zh-CN": "已归档" },
          description: {
            en: "Whether the block is archived.",
            "zh-CN": "该块是否已归档。",
          },
        },
        in_trash: {
          type: z.boolean(),
          title: { en: "In Trash", "zh-CN": "已移至回收站" },
          description: {
            en: "Whether the block is in the trash.",
            "zh-CN": "该块是否已移至回收站。",
          },
        },
      }),
    ),
    title: { en: "Child Blocks", "zh-CN": "子块列表" },
    description: {
      en: "Child blocks returned for the requested Notion block or page.",
      "zh-CN": "所请求 Notion 块或页面返回的子块。",
    },
  },
  has_more: {
    type: z.boolean(),
    title: { en: "More Blocks Available", "zh-CN": "是否有更多子块" },
    description: {
      en: "Whether additional child blocks are available.",
      "zh-CN": "是否还有更多子块可供查询。",
    },
  },
  next_cursor: {
    type: z.string(),
    title: { en: "Next Cursor", "zh-CN": "下一页游标" },
    description: {
      en: "Cursor to use when requesting the next block page.",
      "zh-CN": "请求下一页子块时使用的游标。",
    },
  },
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
const queryDataSourceInputSchema = defineInputSchema({
  dataSourceId: {
    type: z.string(),
    title: { en: "Data Source ID", "zh-CN": "数据源 ID" },
    description: {
      en: "Notion data source ID to query.",
      "zh-CN": "要查询的 Notion 数据源 ID。",
    },
    isToolParam: true,
  },
  filterJson: {
    type: z.string().optional(),
    title: { en: "Filter JSON", "zh-CN": "筛选条件 JSON" },
    description: {
      en: "Optional Notion filter JSON object.",
      "zh-CN": "可选的 Notion 筛选条件 JSON 对象。",
    },
    isToolParam: true,
  },
  sortsJson: {
    type: z.string().optional(),
    title: { en: "Sorts JSON", "zh-CN": "排序 JSON" },
    description: {
      en: 'Optional JSON object containing a sorts array, for example {"sorts":[...]}.',
      "zh-CN": '可选的排序 JSON 对象，包含 sorts 数组，例如 {"sorts":[...]}。',
    },
    isToolParam: true,
  },
  pageSize: {
    type: z.number().int().min(1).max(100).optional(),
    title: { en: "Page Size", "zh-CN": "每页数量" },
    description: {
      en: "Number of results to return, from 1 to 100; defaults to 20.",
      "zh-CN": "返回数量，范围为 1–100，默认 20。",
    },
    isToolParam: true,
  },
  cursor: {
    type: z.string().optional(),
    title: { en: "Cursor", "zh-CN": "分页游标" },
    description: {
      en: "Pagination cursor from a previous data-source query.",
      "zh-CN": "上一次数据源查询返回的分页游标。",
    },
    isToolParam: true,
  },
});
const queryDataSourceOutputSchema = defineOutputSchema({
  results: {
    type: z.array(
      defineOutputSchema({
        object: {
          type: z.string(),
          title: { en: "Object Type", "zh-CN": "对象类型" },
          description: {
            en: "Notion object type.",
            "zh-CN": "Notion 对象类型。",
          },
        },
        id: {
          type: z.string(),
          title: { en: "Object ID", "zh-CN": "对象 ID" },
          description: {
            en: "Notion object identifier.",
            "zh-CN": "Notion 对象标识符。",
          },
        },
        title: {
          type: z.string(),
          title: { en: "Title", "zh-CN": "标题" },
          description: {
            en: "Title of the returned Notion page.",
            "zh-CN": "返回的 Notion 页面标题。",
          },
        },
        url: {
          type: z.string(),
          title: { en: "URL", "zh-CN": "链接" },
          description: {
            en: "URL of the returned Notion page.",
            "zh-CN": "返回的 Notion 页面链接。",
          },
        },
        archived: {
          type: z.boolean(),
          title: { en: "Archived", "zh-CN": "已归档" },
          description: {
            en: "Whether the page is archived.",
            "zh-CN": "页面是否已归档。",
          },
        },
        in_trash: {
          type: z.boolean(),
          title: { en: "In Trash", "zh-CN": "已移至回收站" },
          description: {
            en: "Whether the page is in the trash.",
            "zh-CN": "页面是否已移至回收站。",
          },
        },
        created_time: {
          type: z.string(),
          title: { en: "Created At", "zh-CN": "创建时间" },
          description: {
            en: "Page creation timestamp.",
            "zh-CN": "页面创建时间。",
          },
        },
        last_edited_time: {
          type: z.string(),
          title: { en: "Last Edited At", "zh-CN": "最后编辑时间" },
          description: {
            en: "Timestamp of the most recent page edit.",
            "zh-CN": "页面最近一次编辑时间。",
          },
        },
        properties_json: {
          type: z.string(),
          title: { en: "Properties JSON", "zh-CN": "属性 JSON" },
          description: {
            en: "Page properties serialized as a JSON string.",
            "zh-CN": "以 JSON 字符串序列化的页面属性。",
          },
        },
      }),
    ),
    title: { en: "Query Results", "zh-CN": "查询结果" },
    description: {
      en: "Pages returned from the Notion data-source query.",
      "zh-CN": "Notion 数据源查询返回的页面。",
    },
  },
  has_more: {
    type: z.boolean(),
    title: { en: "More Results Available", "zh-CN": "是否有更多结果" },
    description: {
      en: "Whether additional pages are available.",
      "zh-CN": "是否还有更多页面可供查询。",
    },
  },
  next_cursor: {
    type: z.string(),
    title: { en: "Next Cursor", "zh-CN": "下一页游标" },
    description: {
      en: "Cursor to use when requesting the next page.",
      "zh-CN": "请求下一页时使用的游标。",
    },
  },
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
const createPageInputSchema = defineInputSchema({
  parentType: {
    type: z.enum(["page_id", "data_source_id"]),
    title: { en: "Parent Type", "zh-CN": "父级类型" },
    description: {
      en: "Parent reference type for the new page: page_id or data_source_id.",
      "zh-CN": "新页面的父级引用类型，可选 page_id 或 data_source_id。",
    },
    isToolParam: true,
  },
  parentId: {
    type: z.string(),
    title: { en: "Parent ID", "zh-CN": "父级 ID" },
    description: {
      en: "ID of the parent page or data source.",
      "zh-CN": "父级页面或数据源的 ID。",
    },
    isToolParam: true,
  },
  propertiesJson: {
    type: z.string(),
    title: { en: "Properties JSON", "zh-CN": "属性 JSON" },
    description: {
      en: "Notion properties JSON object for the page to create.",
      "zh-CN": "要创建页面的 Notion properties JSON 对象。",
    },
    isToolParam: true,
  },
  childrenJson: {
    type: z.string().optional(),
    title: { en: "Children JSON", "zh-CN": "子块 JSON" },
    description: {
      en: "Optional JSON array of Notion block children to add to the page.",
      "zh-CN": "可选的 Notion block children JSON 数组，用于添加到页面。",
    },
    isToolParam: true,
  },
});
const createPageOutputSchema = defineOutputSchema({
  id: {
    type: z.string(),
    title: { en: "Page ID", "zh-CN": "页面 ID" },
    description: {
      en: "Identifier of the created Notion page.",
      "zh-CN": "新建 Notion 页面的标识符。",
    },
  },
  url: {
    type: z.string(),
    title: { en: "Page URL", "zh-CN": "页面链接" },
    description: {
      en: "URL of the created Notion page.",
      "zh-CN": "新建 Notion 页面的链接。",
    },
  },
  archived: {
    type: z.boolean(),
    title: { en: "Archived", "zh-CN": "已归档" },
    description: {
      en: "Whether the created page is archived.",
      "zh-CN": "新建页面是否已归档。",
    },
  },
  in_trash: {
    type: z.boolean(),
    title: { en: "In Trash", "zh-CN": "已移至回收站" },
    description: {
      en: "Whether the created page is in the trash.",
      "zh-CN": "新建页面是否已移至回收站。",
    },
  },
  created_time: {
    type: z.string(),
    title: { en: "Created At", "zh-CN": "创建时间" },
    description: { en: "Page creation timestamp.", "zh-CN": "页面创建时间。" },
  },
  last_edited_time: {
    type: z.string(),
    title: { en: "Last Edited At", "zh-CN": "最后编辑时间" },
    description: {
      en: "Timestamp of the most recent page edit.",
      "zh-CN": "页面最近一次编辑时间。",
    },
  },
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
      en: "Search Notion pages, databases, and data sources; retrieve pages and blocks; query data sources; and create pages.",
      "zh-CN":
        "搜索 Notion 页面、数据库和数据源；读取页面和子块；查询数据源；并创建页面。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial Notion tool suite",
      "zh-CN": "初始 Notion 工具集版本",
    },
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
        en: "Search Notion pages, databases, or data sources with optional type filters and cursor pagination.",
        "zh-CN":
          "搜索 Notion 页面、数据库或数据源，支持可选类型筛选和游标分页。",
      },
      handler: searchHandler,
    },
    {
      id: "getPage",
      name: {
        en: "Get Page",
        "zh-CN": "获取页面",
      },
      description: {
        en: "Retrieve a Notion page by ID and return its metadata and properties as JSON.",
        "zh-CN":
          "根据 ID 读取 Notion 页面，并返回页面元数据和 JSON 格式的属性。",
      },
      handler: getPageHandler,
    },
    {
      id: "getBlockChildren",
      name: {
        en: "Get Block Children",
        "zh-CN": "获取子块",
      },
      description: {
        en: "List child blocks for a Notion block or page, extracting their plain text with cursor pagination.",
        "zh-CN": "列出 Notion 块或页面的子块，提取纯文本并支持游标分页。",
      },
      handler: getBlockChildrenHandler,
    },
    {
      id: "queryDataSource",
      name: {
        en: "Query Data Source",
        "zh-CN": "查询数据源",
      },
      description: {
        en: "Query a Notion data source with optional filter and sorts JSON, returning page metadata and properties JSON.",
        "zh-CN":
          "使用可选的筛选条件和排序 JSON 查询 Notion 数据源，并返回页面元数据和属性 JSON。",
      },
      handler: queryDataSourceHandler,
    },
    {
      id: "createPage",
      name: {
        en: "Create Page",
        "zh-CN": "创建页面",
      },
      description: {
        en: "Create a Notion page under a parent page or data source using properties JSON and optional block children.",
        "zh-CN":
          "使用 properties JSON 在父页面或数据源下创建 Notion 页面，并可选添加子块。",
      },
      handler: createPageHandler,
    },
  ],
});

export default toolSet;
