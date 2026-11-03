import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as createRecordInputType,
  OutputType as createRecordOutputType,
  tool as createRecordTool,
} from "./children/createRecord";
import {
  InputType as listRecordsInputType,
  OutputType as listRecordsOutputType,
  tool as listRecordsTool,
} from "./children/listRecords";
import {
  InputType as updateRecordInputType,
  OutputType as updateRecordOutputType,
  tool as updateRecordTool,
} from "./children/updateRecord";

const secretSchema = z.object({
  token: z
    .string()
    .min(1)
    .meta({
      title: "Airtable PAT",
      description:
        "Airtable Personal Access Token used for Bearer token authentication.",
      "x-i18n": {
        title: { en: "Airtable PAT", "zh-CN": "Airtable 个人访问令牌" },
        description: {
          en: "Airtable Personal Access Token used for Bearer token authentication.",
          "zh-CN": "用于 Bearer Token 身份验证的 Airtable 个人访问令牌。",
        },
      },
      isSecret: true,
    }),
});

const airtableTableInputSchema = {
  baseId: {
    type: z.string().min(1),
    title: { en: "Base ID", "zh-CN": "Base ID（数据集 ID）" },
    description: {
      en: "Airtable base ID, for example appXXXXXXXXXXXXXX.",
      "zh-CN": "Airtable Base ID，例如 appXXXXXXXXXXXXXX。",
    },
    isToolParam: true,
  },
  tableIdOrName: {
    type: z.string().min(1),
    title: { en: "Table ID or name", "zh-CN": "表格 ID 或名称" },
    description: {
      en: "Airtable table ID or table name.",
      "zh-CN": "Airtable 表格 ID 或表名。",
    },
    isToolParam: true,
  },
};

const fieldsInputSchema = z.union([
  z.record(z.string(), z.unknown()),
  z.string(),
]);

const sortRuleSchema = defineInputSchema({
  field: {
    type: z.string().min(1),
    title: { en: "Field", "zh-CN": "字段" },
    description: {
      en: "Airtable field to sort by.",
      "zh-CN": "用于排序的 Airtable 字段。",
    },
    isToolParam: true,
  },
  direction: {
    type: z.enum(["asc", "desc"]).optional().nullable(),
    title: { en: "Direction", "zh-CN": "排序方向" },
    description: {
      en: "Sort ascending or descending.",
      "zh-CN": "选择升序或降序。",
    },
    isToolParam: true,
  },
});
const sortInputSchema = z
  .union([z.array(sortRuleSchema), z.string()])
  .optional()
  .nullable();

const tableInputFields = {
  ...airtableTableInputSchema,
  fields: {
    type: fieldsInputSchema,
    title: { en: "Fields", "zh-CN": "字段数据" },
    description: {
      en: "Airtable record fields as an object or JSON object string.",
      "zh-CN": "Airtable 记录字段对象或 JSON 字符串。",
    },
    isToolParam: true,
  },
};

const airtableRecordSchema = defineOutputSchema({
  id: { type: z.string(), title: { en: "Record ID", "zh-CN": "记录 ID" } },
  createdTime: {
    type: z.string().optional(),
    title: { en: "Created time", "zh-CN": "创建时间" },
  },
  fields: {
    type: z.record(z.string(), z.unknown()),
    title: { en: "Fields", "zh-CN": "字段数据" },
    description: {
      en: "Airtable record field values.",
      "zh-CN": "Airtable 记录字段值。",
    },
  },
});
const listRecordsOutputSchema = defineOutputSchema({
  records: {
    type: z.array(airtableRecordSchema),
    title: { en: "Records", "zh-CN": "记录列表" },
    description: {
      en: "Records returned from the Airtable table.",
      "zh-CN": "从 Airtable 表格返回的记录。",
    },
  },
  offset: {
    type: z.string().nullable(),
    title: { en: "Offset", "zh-CN": "分页偏移量" },
    description: {
      en: "Offset for retrieving the next page; null when there is no next page.",
      "zh-CN": "用于获取下一页的分页偏移量；没有下一页时为 null。",
    },
  },
  count: {
    type: z.number(),
    title: { en: "Count", "zh-CN": "数量" },
    description: {
      en: "Number of records returned.",
      "zh-CN": "返回的记录数量。",
    },
  },
});
const createRecordOutputSchema = defineOutputSchema({
  record: {
    type: airtableRecordSchema,
    title: { en: "Record", "zh-CN": "记录" },
    description: {
      en: "The created Airtable record.",
      "zh-CN": "创建的 Airtable 记录。",
    },
  },
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "成功" },
    description: {
      en: "Whether record creation succeeded.",
      "zh-CN": "记录是否创建成功。",
    },
  },
});
const updateRecordOutputSchema = defineOutputSchema({
  record: {
    type: airtableRecordSchema,
    title: { en: "Record", "zh-CN": "记录" },
    description: {
      en: "The updated Airtable record.",
      "zh-CN": "更新后的 Airtable 记录。",
    },
  },
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "成功" },
    description: {
      en: "Whether record update succeeded.",
      "zh-CN": "记录是否更新成功。",
    },
  },
});

const listRecordsHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...airtableTableInputSchema,
    maxRecords: {
      type: z.number().int().positive().max(100).optional().nullable(),
      title: { en: "Maximum records", "zh-CN": "返回数量" },
      description: {
        en: "Maximum records to return (1–100; defaults to 100).",
        "zh-CN": "最多返回记录数，范围 1-100，默认 100。",
      },
      isToolParam: true,
    },
    pageSize: {
      type: z.number().int().positive().max(100).optional().nullable(),
      title: { en: "Page size", "zh-CN": "分页大小" },
      description: {
        en: "Airtable page size (1–100); defaults to no more than maxRecords.",
        "zh-CN": "Airtable pageSize，范围 1-100，默认不超过返回数量。",
      },
      isToolParam: true,
    },
    filterByFormula: {
      type: z.string().optional().nullable(),
      title: { en: "Formula filter", "zh-CN": "公式过滤" },
      description: {
        en: "Optional Airtable filterByFormula expression.",
        "zh-CN": "可选的 Airtable filterByFormula 表达式。",
      },
      isToolParam: true,
    },
    view: {
      type: z.string().optional().nullable(),
      title: { en: "View", "zh-CN": "视图" },
      description: {
        en: "Optional Airtable view name or ID.",
        "zh-CN": "可选的 Airtable 视图名称或 ID。",
      },
      isToolParam: true,
    },
    sort: {
      type: sortInputSchema,
      title: { en: "Sort", "zh-CN": "排序" },
      description: {
        en: "Optional sort rules as an array or JSON string.",
        "zh-CN": "可选的排序规则数组或 JSON 字符串。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: listRecordsOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await listRecordsInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await listRecordsTool(parsedInput, ctx);
    return listRecordsOutputType.parseAsync(output);
  },
});

const createRecordHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...tableInputFields,
    typecast: {
      type: z.boolean().optional().nullable(),
      title: { en: "Typecast", "zh-CN": "自动类型转换" },
      description: {
        en: "Whether Airtable should automatically convert field value types.",
        "zh-CN": "是否允许 Airtable 自动转换字段值类型。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: createRecordOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await createRecordInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await createRecordTool(parsedInput, ctx);
    return createRecordOutputType.parseAsync(output);
  },
});

const updateRecordHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...tableInputFields,
    recordId: {
      type: z.string().min(1),
      title: { en: "Record ID", "zh-CN": "记录 ID" },
      description: {
        en: "Airtable record ID to update, for example recXXXXXXXXXXXXXX.",
        "zh-CN": "要更新的 Airtable 记录 ID，例如 recXXXXXXXXXXXXXX。",
      },
      isToolParam: true,
    },
    typecast: {
      type: z.boolean().optional().nullable(),
      title: { en: "Typecast", "zh-CN": "自动类型转换" },
      description: {
        en: "Whether Airtable should automatically convert field value types.",
        "zh-CN": "是否允许 Airtable 自动转换字段值类型。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: updateRecordOutputSchema,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await updateRecordInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await updateRecordTool(parsedInput, ctx);
    return updateRecordOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "airtable",
    name: {
      en: "Airtable",
      "zh-CN": "Airtable",
    },
    description: {
      en: "List, create, and update Airtable records through the official Web API. Use safe query limits and optional formula, view, or sort filters; this toolset does not delete records.",
      "zh-CN":
        "通过 Airtable 官方 Web API 列出、创建和更新记录。支持安全的查询数量限制以及公式、视图或排序筛选；此工具集不会删除记录。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tutorialUrl: "https://airtable.com/developers/web/api/introduction",
    author: "FastGPT Team",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "listRecords",
      name: {
        en: "List Records",
        "zh-CN": "列出记录",
      },
      description: {
        en: "List Airtable records from a base and table with optional formula, view, and sort filters.",
        "zh-CN": "列出 Airtable 表中的记录，并可使用公式、视图和排序条件筛选。",
      },
      handler: listRecordsHandler,
    },
    {
      id: "createRecord",
      name: {
        en: "Create Record",
        "zh-CN": "创建记录",
      },
      description: {
        en: "Create one Airtable record with a bounded fields object.",
        "zh-CN": "使用有限字段对象创建一条 Airtable 记录。",
      },
      handler: createRecordHandler,
    },
    {
      id: "updateRecord",
      name: {
        en: "Update Record",
        "zh-CN": "更新记录",
      },
      description: {
        en: "Update one Airtable record by record ID with a bounded fields object.",
        "zh-CN": "根据记录 ID 使用有限字段对象更新一条 Airtable 记录。",
      },
      handler: updateRecordHandler,
    },
  ],
});

export default toolSet;
