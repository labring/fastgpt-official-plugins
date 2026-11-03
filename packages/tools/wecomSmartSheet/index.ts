import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
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
const wecomSmartSheetDocInputSchema = defineInputSchema({
  accessToken: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "调用凭证（access_token）" },
    description: {
      en: "Access token for the WeCom API.",
      "zh-CN": "企业微信 API 的调用凭证。",
    },
    isToolParam: false,
  },
  doc_name: {
    type: z.string(),
    title: { en: "Document name", "zh-CN": "文档名称" },
    description: {
      en: "Name of the document to create.",
      "zh-CN": "要新建的文档名称。",
    },
    isToolParam: true,
  },
  spaceid: {
    type: z.string().optional(),
    title: { en: "Space ID", "zh-CN": "空间 ID（spaceid）" },
    description: {
      en: "Optional ID of the space where the document will be stored.",
      "zh-CN": "可选，指定文档存储空间的 ID。",
    },
    isToolParam: true,
  },
  fatherid: {
    type: z.string().optional(),
    title: { en: "Parent directory ID", "zh-CN": "父目录 ID（fatherid）" },
    description: {
      en: "Optional parent directory file ID; use the space ID for the root directory.",
      "zh-CN": "可选，父目录 fileid；根目录时填写空间 spaceid。",
    },
    isToolParam: true,
  },
  admin_users: {
    type: z.string().optional(),
    title: { en: "Administrators", "zh-CN": "管理员列表" },
    description: {
      en: "Optional comma-separated list of document administrator user IDs.",
      "zh-CN": "可选的文档管理员 userid 列表，多个用户 ID 用逗号分隔。",
    },
    isToolParam: true,
  },
});
const wecomSmartSheetDocOutputSchema = defineOutputSchema({
  docid: {
    type: z.string().optional(),
    title: { en: "Document ID", "zh-CN": "文档 ID" },
    description: {
      en: "Unique identifier of the created document.",
      "zh-CN": "新建文档的唯一标识。",
    },
  },
  url: {
    type: z.string().optional(),
    title: { en: "Document URL", "zh-CN": "文档链接" },
    description: {
      en: "Link to access the created document.",
      "zh-CN": "新建文档的访问链接。",
    },
  },
});
const wecomSmartSheetDocHandler = createToolHandler({
  inputSchema: wecomSmartSheetDocInputSchema,
  outputSchema: wecomSmartSheetDocOutputSchema,
  secretSchema: wecomSmartSheetDocSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wecomSmartSheetDocInputType.parseAsync(input);
    const output = await wecomSmartSheetDocTool(parsedInput);
    return wecomSmartSheetDocOutputType.parseAsync(output);
  },
});

const wecomSmartSheetFieldAdvancedSecretSchema = z.object({});
const wecomSmartSheetFieldAdvancedInputSchema = defineInputSchema({
  accessToken: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "调用凭证（access_token）" },
    description: {
      en: "Access token for the WeCom API.",
      "zh-CN": "企业微信 API 的调用凭证。",
    },
    isToolParam: false,
  },
  docid: {
    type: z.string(),
    title: { en: "Document ID", "zh-CN": "文档 ID（docid）" },
    description: {
      en: "Unique identifier of the Smart Sheet document.",
      "zh-CN": "智能表文档的唯一标识。",
    },
    isToolParam: true,
  },
  sheet_id: {
    type: z.string(),
    title: { en: "Sheet ID", "zh-CN": "子表 ID" },
    description: {
      en: "ID of the sheet containing the fields to operate on.",
      "zh-CN": "要操作的字段所属子表 ID。",
    },
    isToolParam: true,
  },
  action: {
    type: z.enum(["add", "del", "update", "list"]),
    title: { en: "Action", "zh-CN": "操作类型" },
    description: {
      en: "Operation to perform: add, del, update, or list.",
      "zh-CN":
        "要执行的操作：add（新增）、del（删除）、update（更新）或 list（查询列表）。",
    },
    isToolParam: true,
  },
  fields: {
    type: z.array(z.record(z.string(), z.unknown())).optional(),
    title: {
      en: "Field configurations (JSON array)",
      "zh-CN": "字段配置（JSON 数组）",
    },
    description: {
      en: "Array of field configurations for add or update operations.",
      "zh-CN": "新增或更新操作使用的字段配置数组。",
    },
    isToolParam: true,
  },
  field_ids: {
    type: z.array(z.string()).optional(),
    title: { en: "Field IDs", "zh-CN": "字段 ID 列表" },
    description: {
      en: "Array of field IDs to delete.",
      "zh-CN": "删除操作使用的字段 ID 数组。",
    },
    isToolParam: true,
  },
  view_id: {
    type: z.string().optional(),
    title: { en: "View ID", "zh-CN": "视图 ID" },
    description: {
      en: "View ID to use when listing fields.",
      "zh-CN": "查询字段列表时使用的视图 ID。",
    },
    isToolParam: true,
  },
  offset: {
    type: z.number().optional(),
    title: { en: "Offset", "zh-CN": "偏移量" },
    description: {
      en: "Pagination offset for listing fields.",
      "zh-CN": "查询字段列表时的分页偏移量。",
    },
    isToolParam: true,
  },
  limit: {
    type: z.number().optional(),
    title: { en: "Limit", "zh-CN": "限制条数" },
    description: {
      en: "Maximum number of fields to return in a page.",
      "zh-CN": "分页查询时最多返回的字段数量。",
    },
    isToolParam: true,
  },
});
const wecomSmartSheetFieldAdvancedOutputSchema = defineOutputSchema({
  result: {
    type: z.unknown(),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Result of the field operation.",
      "zh-CN": "字段操作结果。",
    },
  },
});
const wecomSmartSheetFieldAdvancedHandler = createToolHandler({
  inputSchema: wecomSmartSheetFieldAdvancedInputSchema,
  outputSchema: wecomSmartSheetFieldAdvancedOutputSchema,
  secretSchema: wecomSmartSheetFieldAdvancedSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetFieldAdvancedInputType.parseAsync(input);
    const output = await wecomSmartSheetFieldAdvancedTool(parsedInput);
    return wecomSmartSheetFieldAdvancedOutputType.parseAsync(output);
  },
});

const wecomSmartSheetFieldSimpleSecretSchema = z.object({});
const wecomSmartSheetFieldSimpleInputSchema = defineInputSchema({
  accessToken: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "调用凭证（access_token）" },
    description: {
      en: "Access token for the WeCom API.",
      "zh-CN": "企业微信 API 的调用凭证。",
    },
    isToolParam: false,
  },
  docid: {
    type: z.string(),
    title: { en: "Document ID", "zh-CN": "文档 ID（docid）" },
    description: {
      en: "Unique identifier of the Smart Sheet document.",
      "zh-CN": "智能表文档的唯一标识。",
    },
    isToolParam: true,
  },
  sheet_id: {
    type: z.string(),
    title: { en: "Sheet ID", "zh-CN": "子表 ID" },
    description: {
      en: "ID of the sheet containing the fields to operate on.",
      "zh-CN": "要操作的字段所属子表 ID。",
    },
    isToolParam: true,
  },
  action: {
    type: z.enum(["add", "del", "update", "list"]),
    title: { en: "Action", "zh-CN": "操作类型" },
    description: {
      en: "Operation to perform: add, del (delete by name), update, or list.",
      "zh-CN":
        "要执行的操作：add（新增）、del（按名称删除）、update（修改名称）或 list（查询列表）。",
    },
    isToolParam: true,
  },
  field_title: {
    type: z.string().optional(),
    title: { en: "Field name / old name", "zh-CN": "字段名称 / 旧名称" },
    description: {
      en: "Field name, or its previous name when updating.",
      "zh-CN": "字段名称，或修改前的旧名称。",
    },
    isToolParam: true,
  },
  new_field_title: {
    type: z.string().optional(),
    title: { en: "New field name", "zh-CN": "新字段名称（修改时使用）" },
    description: {
      en: "New name to assign to the field when updating it.",
      "zh-CN": "更新字段名称时使用的新名称。",
    },
    isToolParam: true,
  },
  field_type: {
    type: z
      .enum([
        "FIELD_TYPE_TEXT",
        "FIELD_TYPE_NUMBER",
        "FIELD_TYPE_DATE_TIME",
        "FIELD_TYPE_SINGLE_SELECT",
        "FIELD_TYPE_SELECT",
        "FIELD_TYPE_CHECKBOX",
        "FIELD_TYPE_USER",
        "FIELD_TYPE_PHONE_NUMBER",
        "FIELD_TYPE_URL",
        "FIELD_TYPE_RATING",
      ])
      .optional(),
    title: { en: "Field type", "zh-CN": "字段类型" },
    description: {
      en: "Type to assign when adding a field.",
      "zh-CN": "新增字段时使用的字段类型。",
    },
    isToolParam: true,
  },
  options: {
    type: z.string().optional(),
    title: {
      en: "Options (single/multiple select)",
      "zh-CN": "选项（单选 / 多选）",
    },
    description: {
      en: "Comma-separated options for selection fields, for example: male,female.",
      "zh-CN": "选择类型字段的选项，使用英文逗号分隔，例如“男,女”。",
    },
    isToolParam: true,
  },
  decimal_places: {
    type: z.number().optional(),
    title: { en: "Decimal places", "zh-CN": "小数位数" },
    description: {
      en: "Number of decimal places for a number field.",
      "zh-CN": "数字类型字段的小数位数。",
    },
    isToolParam: true,
  },
});
const wecomSmartSheetFieldSimpleOutputSchema = defineOutputSchema({
  result: {
    type: z.unknown(),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Result of the field operation.",
      "zh-CN": "字段操作结果。",
    },
  },
});
const wecomSmartSheetFieldSimpleHandler = createToolHandler({
  inputSchema: wecomSmartSheetFieldSimpleInputSchema,
  outputSchema: wecomSmartSheetFieldSimpleOutputSchema,
  secretSchema: wecomSmartSheetFieldSimpleSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetFieldSimpleInputType.parseAsync(input);
    const output = await wecomSmartSheetFieldSimpleTool(parsedInput);
    return wecomSmartSheetFieldSimpleOutputType.parseAsync(output);
  },
});

const wecomSmartSheetRecordAdvancedSecretSchema = z.object({});
const wecomSmartSheetRecordAdvancedInputSchema = defineInputSchema({
  accessToken: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "调用凭证（access_token）" },
    description: {
      en: "Access token for the WeCom API.",
      "zh-CN": "企业微信 API 的调用凭证。",
    },
    isToolParam: false,
  },
  docid: {
    type: z.string(),
    title: { en: "Document ID", "zh-CN": "文档 ID（docid）" },
    description: {
      en: "Unique identifier of the Smart Sheet document.",
      "zh-CN": "智能表文档的唯一标识。",
    },
    isToolParam: true,
  },
  sheet_id: {
    type: z.string(),
    title: { en: "Sheet ID", "zh-CN": "子表 ID" },
    description: {
      en: "ID of the sheet containing the records to operate on.",
      "zh-CN": "要操作的记录所属子表 ID。",
    },
    isToolParam: true,
  },
  action: {
    type: z.enum(["add", "del", "update", "list"]),
    title: { en: "Action", "zh-CN": "操作类型" },
    description: {
      en: "Operation to perform: add, del, update, or list.",
      "zh-CN":
        "要执行的操作：add（新增）、del（删除）、update（更新）或 list（查询列表）。",
    },
    isToolParam: true,
  },
  records: {
    type: z.array(z.record(z.string(), z.unknown())).optional(),
    title: { en: "Records (JSON array)", "zh-CN": "记录列表（JSON 数组）" },
    description: {
      en: "Complete array of records for add or update operations, in WeCom format.",
      "zh-CN": "新增或更新操作使用的完整记录数组，采用企业微信数据格式。",
    },
    isToolParam: true,
  },
  record_ids: {
    type: z.array(z.string()).optional(),
    title: { en: "Record IDs", "zh-CN": "记录 ID 列表" },
    description: {
      en: "Record IDs to delete or query individually.",
      "zh-CN": "删除记录或查询指定记录时使用的 ID 数组。",
    },
    isToolParam: true,
  },
  query_params: {
    type: z.record(z.string(), z.unknown()).optional(),
    title: {
      en: "Advanced query parameters (JSON)",
      "zh-CN": "高级查询参数（JSON）",
    },
    description: {
      en: "JSON object for query options such as filter_spec, sort, and view_id.",
      "zh-CN": "查询参数 JSON 对象，例如 filter_spec、sort 和 view_id。",
    },
    isToolParam: true,
  },
  key_type: {
    type: z
      .enum(["CELL_VALUE_KEY_TYPE_FIELD_TITLE", "CELL_VALUE_KEY_TYPE_FIELD_ID"])
      .optional(),
    title: { en: "Key type", "zh-CN": "键类型" },
    description: {
      en: "Whether cell values are keyed by field title or field ID.",
      "zh-CN": "指定单元格值的键使用字段名称还是字段 ID。",
    },
    isToolParam: true,
  },
});
const wecomSmartSheetRecordAdvancedOutputSchema = defineOutputSchema({
  result: {
    type: z.unknown(),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Result of the record operation.",
      "zh-CN": "记录操作结果。",
    },
  },
});
const wecomSmartSheetRecordAdvancedHandler = createToolHandler({
  inputSchema: wecomSmartSheetRecordAdvancedInputSchema,
  outputSchema: wecomSmartSheetRecordAdvancedOutputSchema,
  secretSchema: wecomSmartSheetRecordAdvancedSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetRecordAdvancedInputType.parseAsync(input);
    const output = await wecomSmartSheetRecordAdvancedTool(parsedInput);
    return wecomSmartSheetRecordAdvancedOutputType.parseAsync(output);
  },
});

const wecomSmartSheetRecordSimpleSecretSchema = z.object({});
const wecomSmartSheetRecordSimpleInputSchema = defineInputSchema({
  accessToken: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "调用凭证（access_token）" },
    description: {
      en: "Access token for the WeCom API.",
      "zh-CN": "企业微信 API 的调用凭证。",
    },
    isToolParam: false,
  },
  docid: {
    type: z.string(),
    title: { en: "Document ID", "zh-CN": "文档 ID（docid）" },
    description: {
      en: "Unique identifier of the Smart Sheet document.",
      "zh-CN": "智能表文档的唯一标识。",
    },
    isToolParam: true,
  },
  sheet_id: {
    type: z.string(),
    title: { en: "Sheet ID", "zh-CN": "子表 ID" },
    description: {
      en: "ID of the sheet containing the records to operate on.",
      "zh-CN": "要操作的记录所属子表 ID。",
    },
    isToolParam: true,
  },
  action: {
    type: z.enum(["add", "del", "update", "list"]),
    title: { en: "Action", "zh-CN": "操作类型" },
    description: {
      en: "Operation to perform: add, del, update, or list.",
      "zh-CN":
        "要执行的操作：add（新增）、del（删除）、update（更新）或 list（查询列表）。",
    },
    isToolParam: true,
  },
  data: {
    type: z.record(z.string(), z.unknown()).optional(),
    title: { en: "Record data", "zh-CN": "记录数据" },
    description: {
      en: 'Key-value object used when adding or updating a record, for example {name: "Alex", age: 20}.',
      "zh-CN": '新增或更新记录时使用的键值对，例如 {name: "张三", age: 20}。',
    },
    isToolParam: true,
  },
  record_id: {
    type: z.string().optional(),
    title: { en: "Record ID", "zh-CN": "记录 ID" },
    description: {
      en: "Unique record identifier used when updating or deleting a record.",
      "zh-CN": "更新或删除记录时使用的唯一标识。",
    },
    isToolParam: true,
  },
  limit: {
    type: z.number().optional(),
    title: { en: "Limit", "zh-CN": "限制条数" },
    description: {
      en: "Maximum number of records to return when listing; defaults to 10.",
      "zh-CN": "查询记录列表时的返回条数上限，默认为 10。",
    },
    isToolParam: true,
  },
});
const wecomSmartSheetRecordSimpleOutputSchema = defineOutputSchema({
  result: {
    type: z.unknown(),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Result of the record operation.",
      "zh-CN": "记录操作结果。",
    },
  },
});
const wecomSmartSheetRecordSimpleHandler = createToolHandler({
  inputSchema: wecomSmartSheetRecordSimpleInputSchema,
  outputSchema: wecomSmartSheetRecordSimpleOutputSchema,
  secretSchema: wecomSmartSheetRecordSimpleSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await wecomSmartSheetRecordSimpleInputType.parseAsync(input);
    const output = await wecomSmartSheetRecordSimpleTool(parsedInput);
    return wecomSmartSheetRecordSimpleOutputType.parseAsync(output);
  },
});

const wecomSmartSheetTableSecretSchema = z.object({});
const wecomSmartSheetTableInputSchema = defineInputSchema({
  accessToken: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "调用凭证（access_token）" },
    description: {
      en: "Access token for the WeCom API.",
      "zh-CN": "企业微信 API 的调用凭证。",
    },
    isToolParam: false,
  },
  docid: {
    type: z.string(),
    title: { en: "Document ID", "zh-CN": "文档 ID（docid）" },
    description: {
      en: "Unique identifier of the Smart Sheet document.",
      "zh-CN": "智能表文档的唯一标识。",
    },
    isToolParam: true,
  },
  action: {
    type: z.enum(["add", "delete", "update", "get"]),
    title: { en: "Action", "zh-CN": "操作类型" },
    description: {
      en: "Operation to perform: add, delete, update, or get a sub-sheet.",
      "zh-CN":
        "要执行的子表操作：add（添加）、delete（删除）、update（更新）或 get（查询）。",
    },
    isToolParam: true,
  },
  sheet_id: {
    type: z.string().optional(),
    title: { en: "Sheet ID", "zh-CN": "子表 ID" },
    description: {
      en: "ID of the sub-sheet; used for delete, update, and get operations.",
      "zh-CN": "子表 ID；删除、更新或查询时使用。",
    },
    isToolParam: true,
  },
  title: {
    type: z.string().optional(),
    title: { en: "Sheet title", "zh-CN": "子表标题" },
    description: {
      en: "Title of the sub-sheet; used when adding or updating it.",
      "zh-CN": "子表标题；添加或更新时使用。",
    },
    isToolParam: true,
  },
  need_all_type_sheet: {
    type: z.boolean().optional(),
    title: { en: "Include all sheet types", "zh-CN": "获取所有类型子表" },
    description: {
      en: "Whether to include all sheet types, including dashboards and instruction pages, when querying.",
      "zh-CN": "查询时是否获取所有类型的子表，包括仪表盘和说明页。",
    },
    isToolParam: true,
  },
});
const wecomSmartSheetTableOutputSchema = defineOutputSchema({
  result: {
    type: z.unknown(),
    title: { en: "Result", "zh-CN": "操作结果" },
    description: {
      en: "Raw result returned by the WeCom API.",
      "zh-CN": "企业微信 API 返回的原始结果。",
    },
  },
});
const wecomSmartSheetTableHandler = createToolHandler({
  inputSchema: wecomSmartSheetTableInputSchema,
  outputSchema: wecomSmartSheetTableOutputSchema,
  secretSchema: wecomSmartSheetTableSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wecomSmartSheetTableInputType.parseAsync(input);
    const output = await wecomSmartSheetTableTool(parsedInput);
    return wecomSmartSheetTableOutputType.parseAsync(output);
  },
});

const wecomSmartSheetViewSecretSchema = z.object({});
const wecomSmartSheetViewInputSchema = defineInputSchema({
  accessToken: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "调用凭证（access_token）" },
    description: {
      en: "Access token for the WeCom API.",
      "zh-CN": "企业微信 API 的调用凭证。",
    },
    isToolParam: false,
  },
  docid: {
    type: z.string(),
    title: { en: "Document ID", "zh-CN": "文档 ID（docid）" },
    description: {
      en: "Unique identifier of the Smart Sheet document.",
      "zh-CN": "智能表文档的唯一标识。",
    },
    isToolParam: true,
  },
  sheet_id: {
    type: z.string(),
    title: { en: "Sheet ID", "zh-CN": "子表 ID" },
    description: {
      en: "ID of the sheet containing the views to operate on.",
      "zh-CN": "要操作的视图所属子表 ID。",
    },
    isToolParam: true,
  },
  action: {
    type: z.enum(["add", "del", "update", "list"]),
    title: { en: "Action", "zh-CN": "操作类型" },
    description: {
      en: "Operation to perform: add, del, update, or list.",
      "zh-CN":
        "要执行的操作：add（新增）、del（删除）、update（修改）或 list（查询列表）。",
    },
    isToolParam: true,
  },
  view_title: {
    type: z.string().optional(),
    title: { en: "View title", "zh-CN": "视图标题" },
    description: { en: "Name of the view.", "zh-CN": "视图名称。" },
    isToolParam: true,
  },
  view_id: {
    type: z.string().optional(),
    title: { en: "View ID", "zh-CN": "视图 ID" },
    description: {
      en: "Unique identifier of the view, used when updating or deleting it.",
      "zh-CN": "视图的唯一标识，修改或删除时使用。",
    },
    isToolParam: true,
  },
  view_type: {
    type: z
      .enum([
        "VIEW_TYPE_GRID",
        "VIEW_TYPE_KANBAN",
        "VIEW_TYPE_GALLERY",
        "VIEW_TYPE_GANTT",
        "VIEW_TYPE_CALENDAR",
      ])
      .optional(),
    title: { en: "View type", "zh-CN": "视图类型" },
    description: {
      en: "Type to use when adding a view.",
      "zh-CN": "新增视图时使用的视图类型。",
    },
    isToolParam: true,
  },
});
const wecomSmartSheetViewOutputSchema = defineOutputSchema({
  result: {
    type: z.unknown(),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Result of the view operation.",
      "zh-CN": "视图操作结果。",
    },
  },
});
const wecomSmartSheetViewHandler = createToolHandler({
  inputSchema: wecomSmartSheetViewInputSchema,
  outputSchema: wecomSmartSheetViewOutputSchema,
  secretSchema: wecomSmartSheetViewSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wecomSmartSheetViewInputType.parseAsync(input);
    const output = await wecomSmartSheetViewTool(parsedInput);
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
      en: "Comprehensive WeCom Smart Sheet tools for creating documents and managing sheets, views, fields, and records with complete CRUD operations.",
      "zh-CN":
        "提供企业微信智能表的完整操作功能，包括文档创建、子表管理、视图管理、字段管理及记录的增删改查。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
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
        en: "Manage WeCom Smart Sheet documents and create new smart sheets.",
        "zh-CN": "管理企业微信智能表文档并新建智能表。",
      },
      handler: wecomSmartSheetDocHandler,
    },
    {
      id: "wecomSmartSheetFieldAdvanced",
      name: {
        en: "Smart Sheet Field (Advanced)",
        "zh-CN": "智能表字段管理 (高级版)",
      },
      description: {
        en: "Advanced field management with bulk add, update, and delete operations, view ID and pagination support, and raw JSON field configurations.",
        "zh-CN":
          "高级模式管理字段，支持批量新增、更新、删除、视图 ID 和分页查询，并可使用原始 JSON 字段配置。",
      },
      handler: wecomSmartSheetFieldAdvancedHandler,
    },
    {
      id: "wecomSmartSheetFieldSimple",
      name: {
        en: "Smart Sheet Field (Simple)",
        "zh-CN": "智能表字段管理 (极简版)",
      },
      description: {
        en: "Manage fields in simple mode: add or list fields, delete by name, and use simple field names and types.",
        "zh-CN":
          "极简模式管理字段：支持新增字段、查询列表、根据名称删除，并使用简单的字段名称和类型。",
      },
      handler: wecomSmartSheetFieldSimpleHandler,
    },
    {
      id: "wecomSmartSheetRecordAdvanced",
      name: {
        en: "Smart Sheet Record (Advanced)",
        "zh-CN": "智能表记录管理 (高级版)",
      },
      description: {
        en: "Advanced record management with bulk operations, complex filtering and sorting, and raw JSON configurations.",
        "zh-CN":
          "高级模式管理记录，支持批量操作、复杂过滤和排序，并可使用原始 JSON 配置。",
      },
      handler: wecomSmartSheetRecordAdvancedHandler,
    },
    {
      id: "wecomSmartSheetRecordSimple",
      name: {
        en: "Smart Sheet Record (Simple)",
        "zh-CN": "智能表记录管理 (极简版)",
      },
      description: {
        en: "Manage records in simple mode: add, update, list, and delete records using simple JSON objects.",
        "zh-CN":
          "极简模式管理记录：支持新增、更新、查询和删除，可使用简单 JSON 对象操作。",
      },
      handler: wecomSmartSheetRecordSimpleHandler,
    },
    {
      id: "wecomSmartSheetTable",
      name: {
        en: "Smart Sheet Table Management",
        "zh-CN": "智能表子表管理",
      },
      description: {
        en: "Manage WeCom Smart Sheet sub-sheets by adding, deleting, updating, or querying sheet information.",
        "zh-CN":
          "管理企业微信智能表中的子表，支持添加、删除、更新和查询子表信息。",
      },
      handler: wecomSmartSheetTableHandler,
    },
    {
      id: "wecomSmartSheetView",
      name: {
        en: "Smart Sheet View",
        "zh-CN": "智能表视图管理",
      },
      description: {
        en: "Manage WeCom Smart Sheet views, including adding, deleting, updating, and listing views.",
        "zh-CN": "管理企业微信智能表视图，支持新增、删除、更新和查询视图。",
      },
      handler: wecomSmartSheetViewHandler,
    },
  ],
});

export default toolSet;
