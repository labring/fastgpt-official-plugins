import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as wecomSmartSheetDocInputType,
  OutputType as wecomSmartSheetDocOutputType,
  tool as wecomSmartSheetDocTool,
} from "./children/wecomSmartSheetDoc";
import {
  InputType as wecomSmartSheetFieldAdvancedInputType,
  OutputType as wecomSmartSheetFieldAdvancedOutputType,
  tool as wecomSmartSheetFieldAdvancedTool,
} from "./children/wecomSmartSheetFieldAdvanced";
import {
  InputType as wecomSmartSheetFieldSimpleInputType,
  OutputType as wecomSmartSheetFieldSimpleOutputType,
  tool as wecomSmartSheetFieldSimpleTool,
} from "./children/wecomSmartSheetFieldSimple";
import {
  InputType as wecomSmartSheetRecordAdvancedInputType,
  OutputType as wecomSmartSheetRecordAdvancedOutputType,
  tool as wecomSmartSheetRecordAdvancedTool,
} from "./children/wecomSmartSheetRecordAdvanced";
import {
  InputType as wecomSmartSheetRecordSimpleInputType,
  OutputType as wecomSmartSheetRecordSimpleOutputType,
  tool as wecomSmartSheetRecordSimpleTool,
} from "./children/wecomSmartSheetRecordSimple";
import {
  InputType as wecomSmartSheetTableInputType,
  OutputType as wecomSmartSheetTableOutputType,
  tool as wecomSmartSheetTableTool,
} from "./children/wecomSmartSheetTable";
import {
  InputType as wecomSmartSheetViewInputType,
  OutputType as wecomSmartSheetViewOutputType,
  tool as wecomSmartSheetViewTool,
} from "./children/wecomSmartSheetView";

const secretSchema = z.object({});
const wecomSmartSheetDocSecretSchema = z.object({});
const wecomSmartSheetDocInputSchema = z.object({
  "accessToken": z.string().meta({
    title: "调用凭证 (access_token)",
    description: "企业微信的调用凭证",
    toolDescription: "The access token for WeCom API"
  }),
  "doc_name": z.string().meta({
    title: "文档名称",
    description: "要新建的文档名称",
    toolDescription: "The name of the document to create"
  }),
  "spaceid": z.string().optional().meta({
    title: "空间 ID (spaceid)",
    description: "可选，指定存储的空间 ID",
    toolDescription: "Optional space ID where the document will be created"
  }),
  "fatherid": z.string().optional().meta({
    title: "父目录 ID (fatherid)",
    description: "可选，父目录 fileid，根目录时为空间 spaceid",
    toolDescription: "Optional father directory ID"
  }),
  "admin_users": z.string().optional().meta({
    title: "管理员列表",
    description: "可选，文档管理员的 userid 列表，多个用逗号隔开",
    toolDescription: "Optional list of user IDs for document administrators, separated by commas"
  })
});
const wecomSmartSheetDocOutputSchema = z.object({
  "docid": z.string().optional().meta({
    title: "文档 ID",
    description: "新建文档的唯一标识"
  }),
  "url": z.string().optional().meta({
    title: "文档链接",
    description: "新建文档的访问链接"
  })
});
const wecomSmartSheetDocHandler = createToolHandler({
  inputSchema: wecomSmartSheetDocInputSchema,
  outputSchema: wecomSmartSheetDocOutputSchema,
  secretSchema: wecomSmartSheetDocSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wecomSmartSheetDocInputType.parseAsync(input);
    const output = await wecomSmartSheetDocTool(parsedInput, ctx);
    return wecomSmartSheetDocOutputType.parseAsync(output);
  },
});

const wecomSmartSheetFieldAdvancedSecretSchema = z.object({});
const wecomSmartSheetFieldAdvancedInputSchema = z.object({
  "accessToken": z.string().meta({
    title: "调用凭证 (access_token)",
    description: "企业微信的调用凭证",
    toolDescription: "The access token for WeCom API"
  }),
  "docid": z.string().meta({
    title: "文档 ID (docid)",
    description: "智能表文档的唯一标识",
    toolDescription: "The unique ID of the smart sheet document"
  }),
  "sheet_id": z.string().meta({
    title: "子表 ID",
    description: "操作所属的子表 ID",
    toolDescription: "The ID of the sheet where fields belong"
  }),
  "action": z.enum(["add","del","update","list"]).meta({
    title: "操作类型",
    description: "执行的操作：add (新增), del (删除), update (更新), list (查询列表)",
    toolDescription: "The action to perform"
  }),
  "fields": z.array(z.record(z.string(), z.unknown())).optional().meta({
    title: "字段配置 (JSON Array)",
    description: "新增或更新时的字段配置数组",
    toolDescription: "Array of field configurations"
  }),
  "field_ids": z.array(z.string()).optional().meta({
    title: "字段 ID 列表",
    description: "删除操作时的字段 ID 数组",
    toolDescription: "Array of field IDs to delete"
  }),
  "view_id": z.string().optional().meta({
    title: "视图 ID",
    description: "查询列表时的视图 ID",
    toolDescription: "View ID for listing fields"
  }),
  "offset": z.number().optional().meta({
    title: "偏移量",
    description: "查询列表的分页偏移"
  }),
  "limit": z.number().optional().meta({
    title: "限制条数",
    description: "查询列表的分页限制"
  })
});
const wecomSmartSheetFieldAdvancedOutputSchema = z.object({
  "result": z.unknown().meta({
    title: "结果",
    description: "操作结果"
  })
});
const wecomSmartSheetFieldAdvancedHandler = createToolHandler({
  inputSchema: wecomSmartSheetFieldAdvancedInputSchema,
  outputSchema: wecomSmartSheetFieldAdvancedOutputSchema,
  secretSchema: wecomSmartSheetFieldAdvancedSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetFieldAdvancedInputType.parseAsync(input);
    const output = await wecomSmartSheetFieldAdvancedTool(parsedInput, ctx);
    return wecomSmartSheetFieldAdvancedOutputType.parseAsync(output);
  },
});

const wecomSmartSheetFieldSimpleSecretSchema = z.object({});
const wecomSmartSheetFieldSimpleInputSchema = z.object({
  "accessToken": z.string().meta({
    title: "调用凭证 (access_token)",
    description: "企业微信的调用凭证",
    toolDescription: "The access token for WeCom API"
  }),
  "docid": z.string().meta({
    title: "文档 ID (docid)",
    description: "智能表文档的唯一标识",
    toolDescription: "The unique ID of the smart sheet document"
  }),
  "sheet_id": z.string().meta({
    title: "子表 ID",
    description: "操作所属的子表 ID",
    toolDescription: "The ID of the sheet where fields belong"
  }),
  "action": z.enum(["add","del","update","list"]).meta({
    title: "操作类型",
    description: "执行的操作：add (新增), del (根据名称删除), update (修改名称), list (查询列表)",
    toolDescription: "The action to perform: add, del, update, or list"
  }),
  "field_title": z.string().optional().meta({
    title: "字段名称 / 旧名称",
    description: "字段的名称，或修改前的旧名称",
    toolDescription: "The name of the field or the old name when updating"
  }),
  "new_field_title": z.string().optional().meta({
    title: "新字段名称 (修改时使用)",
    description: "修改字段名称时的新名称",
    toolDescription: "The new name for the field"
  }),
  "field_type": z.enum(["FIELD_TYPE_TEXT","FIELD_TYPE_NUMBER","FIELD_TYPE_DATE_TIME","FIELD_TYPE_SINGLE_SELECT","FIELD_TYPE_SELECT","FIELD_TYPE_CHECKBOX","FIELD_TYPE_USER","FIELD_TYPE_PHONE_NUMBER","FIELD_TYPE_URL","FIELD_TYPE_RATING"]).optional().meta({
    title: "字段类型",
    description: "新增字段时的类型",
    toolDescription: "The type of the field"
  }),
  "options": z.string().optional().meta({
    title: "选项 (单选/多选)",
    description: "多个选项用英文逗号隔开，如“男,女”",
    toolDescription: "Comma separated options for select types"
  }),
  "decimal_places": z.number().optional().meta({
    title: "小数位数",
    description: "数字类型字段的小数位数",
    toolDescription: "Decimal places for number type"
  })
});
const wecomSmartSheetFieldSimpleOutputSchema = z.object({
  "result": z.unknown().meta({
    title: "结果",
    description: "操作结果"
  })
});
const wecomSmartSheetFieldSimpleHandler = createToolHandler({
  inputSchema: wecomSmartSheetFieldSimpleInputSchema,
  outputSchema: wecomSmartSheetFieldSimpleOutputSchema,
  secretSchema: wecomSmartSheetFieldSimpleSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetFieldSimpleInputType.parseAsync(input);
    const output = await wecomSmartSheetFieldSimpleTool(parsedInput, ctx);
    return wecomSmartSheetFieldSimpleOutputType.parseAsync(output);
  },
});

const wecomSmartSheetRecordAdvancedSecretSchema = z.object({});
const wecomSmartSheetRecordAdvancedInputSchema = z.object({
  "accessToken": z.string().meta({
    title: "调用凭证 (access_token)",
    description: "企业微信的调用凭证",
    toolDescription: "The access token for WeCom API"
  }),
  "docid": z.string().meta({
    title: "文档 ID (docid)",
    description: "智能表文档的唯一标识",
    toolDescription: "The unique ID of the smart sheet document"
  }),
  "sheet_id": z.string().meta({
    title: "子表 ID",
    description: "操作所属的子表 ID",
    toolDescription: "The ID of the sheet where records belong"
  }),
  "action": z.enum(["add","del","update","list"]).meta({
    title: "操作类型",
    description: "执行的操作：add (新增), del (删除), update (更新), list (查询列表)",
    toolDescription: "The action to perform"
  }),
  "records": z.array(z.record(z.string(), z.unknown())).optional().meta({
    title: "记录列表 (JSON Array)",
    description: "新增或更新时的完整记录数组",
    toolDescription: "Array of records in WeCom format"
  }),
  "record_ids": z.array(z.string()).optional().meta({
    title: "记录 ID 列表",
    description: "删除或查询特定记录时的 ID 数组",
    toolDescription: "Array of record IDs"
  }),
  "query_params": z.record(z.string(), z.unknown()).optional().meta({
    title: "高级查询参数 (JSON)",
    description: "查询时的 filter_spec, sort, view_id 等",
    toolDescription: "JSON object for filtering, sorting, etc."
  }),
  "key_type": z.enum(["CELL_VALUE_KEY_TYPE_FIELD_TITLE","CELL_VALUE_KEY_TYPE_FIELD_ID"]).optional().meta({
    title: "Key 类型",
    description: "CELL_VALUE_KEY_TYPE_FIELD_TITLE 或 CELL_VALUE_KEY_TYPE_FIELD_ID"
  })
});
const wecomSmartSheetRecordAdvancedOutputSchema = z.object({
  "result": z.unknown().meta({
    title: "结果",
    description: "操作结果"
  })
});
const wecomSmartSheetRecordAdvancedHandler = createToolHandler({
  inputSchema: wecomSmartSheetRecordAdvancedInputSchema,
  outputSchema: wecomSmartSheetRecordAdvancedOutputSchema,
  secretSchema: wecomSmartSheetRecordAdvancedSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetRecordAdvancedInputType.parseAsync(input);
    const output = await wecomSmartSheetRecordAdvancedTool(parsedInput, ctx);
    return wecomSmartSheetRecordAdvancedOutputType.parseAsync(output);
  },
});

const wecomSmartSheetRecordSimpleSecretSchema = z.object({});
const wecomSmartSheetRecordSimpleInputSchema = z.object({
  "accessToken": z.string().meta({
    title: "调用凭证 (access_token)",
    description: "企业微信的调用凭证",
    toolDescription: "The access token for WeCom API"
  }),
  "docid": z.string().meta({
    title: "文档 ID (docid)",
    description: "智能表文档的唯一标识",
    toolDescription: "The unique ID of the smart sheet document"
  }),
  "sheet_id": z.string().meta({
    title: "子表 ID",
    description: "操作所属的子表 ID",
    toolDescription: "The ID of the sheet where records belong"
  }),
  "action": z.enum(["add","del","update","list"]).meta({
    title: "操作类型",
    description: "执行的操作：add (新增), del (删除), update (更新), list (查询列表)",
    toolDescription: "The action to perform"
  }),
  "data": z.record(z.string(), z.unknown()).optional().meta({
    title: "记录数据",
    description: "新增或更新时的键值对，如 {\姓名\: \"张三\", \年龄\: 20}",
    toolDescription: "Record data as a simple object"
  }),
  "record_id": z.string().optional().meta({
    title: "记录 ID",
    description: "更新或删除时的记录唯一标识",
    toolDescription: "The ID of the record"
  }),
  "limit": z.number().optional().meta({
    title: "限制条数",
    description: "查询列表时的条数限制 (默认 10)"
  })
});
const wecomSmartSheetRecordSimpleOutputSchema = z.object({
  "result": z.unknown().meta({
    title: "结果",
    description: "操作结果"
  })
});
const wecomSmartSheetRecordSimpleHandler = createToolHandler({
  inputSchema: wecomSmartSheetRecordSimpleInputSchema,
  outputSchema: wecomSmartSheetRecordSimpleOutputSchema,
  secretSchema: wecomSmartSheetRecordSimpleSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetRecordSimpleInputType.parseAsync(input);
    const output = await wecomSmartSheetRecordSimpleTool(parsedInput, ctx);
    return wecomSmartSheetRecordSimpleOutputType.parseAsync(output);
  },
});

const wecomSmartSheetTableSecretSchema = z.object({});
const wecomSmartSheetTableInputSchema = z.object({
  "accessToken": z.string().meta({
    title: "调用凭证 (access_token)",
    description: "企业微信的调用凭证",
    toolDescription: "The access token for WeCom API"
  }),
  "docid": z.string().meta({
    title: "文档 ID (docid)",
    description: "智能表文档的唯一标识",
    toolDescription: "The unique ID of the smart sheet document"
  }),
  "action": z.enum(["add","delete","update","get"]).meta({
    title: "操作类型",
    description: "执行的操作：add (添加子表), delete (删除子表), update (更新子表), get (查询子表)",
    toolDescription: "The action to perform: add, delete, update, or get"
  }),
  "sheet_id": z.string().optional().meta({
    title: "子表 ID",
    description: "操作所属的子表 ID (删除、更新、查询时使用)",
    toolDescription: "The ID of the sub-sheet"
  }),
  "title": z.string().optional().meta({
    title: "子表标题",
    description: "子表标题 (添加、更新时使用)",
    toolDescription: "The title of the sub-sheet"
  }),
  "need_all_type_sheet": z.boolean().optional().meta({
    title: "获取所有类型子表",
    description: "是否获取所有类型的子表，包含仪表盘和说明页 (查询时使用)",
    toolDescription: "Whether to get all types of sheets (dashboard, external, etc.)"
  })
});
const wecomSmartSheetTableOutputSchema = z.object({
  "result": z.unknown().meta({
    title: "操作结果",
    description: "API 返回的原始结果"
  })
});
const wecomSmartSheetTableHandler = createToolHandler({
  inputSchema: wecomSmartSheetTableInputSchema,
  outputSchema: wecomSmartSheetTableOutputSchema,
  secretSchema: wecomSmartSheetTableSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wecomSmartSheetTableInputType.parseAsync(input);
    const output = await wecomSmartSheetTableTool(parsedInput, ctx);
    return wecomSmartSheetTableOutputType.parseAsync(output);
  },
});

const wecomSmartSheetViewSecretSchema = z.object({});
const wecomSmartSheetViewInputSchema = z.object({
  "accessToken": z.string().meta({
    title: "调用凭证 (access_token)",
    description: "企业微信的调用凭证",
    toolDescription: "The access token for WeCom API"
  }),
  "docid": z.string().meta({
    title: "文档 ID (docid)",
    description: "智能表文档的唯一标识",
    toolDescription: "The unique ID of the smart sheet document"
  }),
  "sheet_id": z.string().meta({
    title: "子表 ID",
    description: "操作所属的子表 ID",
    toolDescription: "The ID of the sheet where views belong"
  }),
  "action": z.enum(["add","del","update","list"]).meta({
    title: "操作类型",
    description: "执行的操作：add (新增), del (删除), update (修改), list (查询列表)",
    toolDescription: "The action to perform: add, del, update, or list"
  }),
  "view_title": z.string().optional().meta({
    title: "视图标题",
    description: "视图的名称",
    toolDescription: "The title of the view"
  }),
  "view_id": z.string().optional().meta({
    title: "视图 ID",
    description: "视图的唯一标识 (修改/删除时使用)",
    toolDescription: "The unique ID of the view"
  }),
  "view_type": z.enum(["VIEW_TYPE_GRID","VIEW_TYPE_KANBAN","VIEW_TYPE_GALLERY","VIEW_TYPE_GANTT","VIEW_TYPE_CALENDAR"]).optional().meta({
    title: "视图类型",
    description: "新增视图时的类型",
    toolDescription: "The type of the view"
  })
});
const wecomSmartSheetViewOutputSchema = z.object({
  "result": z.unknown().meta({
    title: "结果",
    description: "操作结果"
  })
});
const wecomSmartSheetViewHandler = createToolHandler({
  inputSchema: wecomSmartSheetViewInputSchema,
  outputSchema: wecomSmartSheetViewOutputSchema,
  secretSchema: wecomSmartSheetViewSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wecomSmartSheetViewInputType.parseAsync(input);
    const output = await wecomSmartSheetViewTool(parsedInput, ctx);
    return wecomSmartSheetViewOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "wecomSmartSheet",
    name: {
      en: "WeCom Smart Sheet",
      "zh-CN": "企业微信智能表",
    },
    description: {
      en: "Provides comprehensive WeCom Smart Sheet operations including document creation, sheet management, view management, field management, and record CRUD.",
      "zh-CN":
        "提供企业微信智能表的完整操作功能，包括文档创建、子表管理、视图管理、字段管理及记录 CRUD 等。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "A comprehensive WeCom (Work WeChat) Smart Sheet toolset for managing documents, sheets, views, fields, and records.\nSupports complete CRUD operations for efficient data management within WeCom.",
    tags: ["tools"],
    author: "FastGPT Team",
  },
  secretSchema,
  children: [
    {
      id: "wecomSmartSheetDoc",
      name: {
        en: "Create Smart Sheet",
        "zh-CN": "新增智能表",
      },
      description: {
        en: "Manage WeCom Smart Sheet documents, supporting the creation of new smart sheets.",
        "zh-CN": "管理企微智能表文档，支持新建智能表。",
      },
      toolDescription: "Create a new WeCom Smart Sheet document.",
      handler: wecomSmartSheetDocHandler,
    },
    {
      id: "wecomSmartSheetFieldAdvanced",
      name: {
        en: "Smart Sheet Field (Advanced)",
        "zh-CN": "智能表字段管理 (高级版)",
      },
      description: {
        en: "Advanced field management: bulk add, update, delete, with view ID and pagination support.",
        "zh-CN":
          "高级模式管理字段：支持批量新增、更新、删除，支持视图 ID 和分页查询。",
      },
      toolDescription:
        "Advanced field management in WeCom Smart Sheet using raw JSON configurations.",
      handler: wecomSmartSheetFieldAdvancedHandler,
    },
    {
      id: "wecomSmartSheetFieldSimple",
      name: {
        en: "Smart Sheet Field (Simple)",
        "zh-CN": "智能表字段管理 (极简版)",
      },
      description: {
        en: "Manage fields in simple mode: add fields, list fields, or delete by name.",
        "zh-CN": "极简模式管理字段：支持新增字段、查询列表、根据名称删除。",
      },
      toolDescription:
        "Manage fields in a WeCom Smart Sheet using simple names and types.",
      handler: wecomSmartSheetFieldSimpleHandler,
    },
    {
      id: "wecomSmartSheetRecordAdvanced",
      name: {
        en: "Smart Sheet Record (Advanced)",
        "zh-CN": "智能表记录管理 (高级版)",
      },
      description: {
        en: "Advanced record management: bulk operations, complex filtering and sorting.",
        "zh-CN":
          "高级模式管理记录：支持批量新增、更新、删除，支持复杂的过滤和排序。",
      },
      toolDescription:
        "Advanced record management in WeCom Smart Sheet using raw JSON configurations.",
      handler: wecomSmartSheetRecordAdvancedHandler,
    },
    {
      id: "wecomSmartSheetRecordSimple",
      name: {
        en: "Smart Sheet Record (Simple)",
        "zh-CN": "智能表记录管理 (极简版)",
      },
      description: {
        en: "Manage records in simple mode: add, update, list, delete. Uses simple JSON objects.",
        "zh-CN":
          "极简模式管理记录：支持新增、更新、查询、删除。输入简单 JSON 对象即可操作。",
      },
      toolDescription:
        "Manage records in a WeCom Smart Sheet using simple data objects.",
      handler: wecomSmartSheetRecordSimpleHandler,
    },
    {
      id: "wecomSmartSheetTable",
      name: {
        en: "Smart Sheet Table Management",
        "zh-CN": "智能表子表管理",
      },
      description: {
        en: "Manage sub-sheets in WeCom Smart Sheet (Add, Delete, Update, Get)",
        "zh-CN": "管理企业微信智能表中的子表（增删改查）",
      },
      toolDescription:
        "A unified tool to manage sub-sheets in WeCom Smart Sheet, supporting adding, deleting, updating, and querying sheet information.",
      handler: wecomSmartSheetTableHandler,
    },
    {
      id: "wecomSmartSheetView",
      name: {
        en: "Smart Sheet View",
        "zh-CN": "智能表视图管理",
      },
      description: {
        en: "Manage WeCom Smart Sheet views, supporting CRUD operations for views.",
        "zh-CN": "管理企微智能表视图，支持视图的增删改查。",
      },
      toolDescription:
        "Manage views in a WeCom Smart Sheet (add, delete, update, list).",
      handler: wecomSmartSheetViewHandler,
    },
  ],
});

export default toolSet;
