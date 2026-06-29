import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  token: z.string().min(1).meta({
    title: "Airtable PAT",
    description: "Airtable Personal Access Token，用于 Bearer token 鉴权",
    toolDescription:
      "Airtable Personal Access Token used as a Bearer token for Airtable Web API calls.",
    isSecret: true,
  }),
});

const airtableTableInputSchema = {
  baseId: z.string().min(1).meta({
    title: "Base ID",
    description: "Airtable base ID，例如 appXXXXXXXXXXXXXX",
    toolDescription: "Airtable base ID, for example appXXXXXXXXXXXXXX.",
  }),
  tableIdOrName: z.string().min(1).meta({
    title: "Table ID or Name",
    description: "Airtable table ID 或表名",
    toolDescription: "Airtable table ID or table name.",
  }),
};

const fieldsInputSchema = z
  .union([z.record(z.string(), z.unknown()), z.string()])
  .meta({
    title: "字段数据",
    description: "Airtable record fields 对象或 JSON 字符串",
    toolDescription:
      "Airtable record fields as an object or a JSON object string.",
  });

const sortInputSchema = z
  .union([
    z.array(
      z.object({
        field: z.string().min(1),
        direction: z.enum(["asc", "desc"]).optional().nullable(),
      }),
    ),
    z.string(),
  ])
  .optional()
  .nullable()
  .meta({
    title: "排序",
    description:
      "排序规则数组或 JSON 字符串，例如 [{\"field\":\"Created\",\"direction\":\"desc\"}]",
    toolDescription:
      "Optional Airtable sort rules as an array or JSON array string, for example [{\"field\":\"Created\",\"direction\":\"desc\"}].",
  });

const listRecordsHandler = createToolHandler({
  inputSchema: z.object({
    ...airtableTableInputSchema,
    maxRecords: z.number().int().positive().max(100).optional().nullable().meta({
      title: "返回数量",
      description: "最多返回记录数，范围 1-100，默认 100",
      toolDescription: "Maximum number of records to return, from 1 to 100.",
    }),
    pageSize: z.number().int().positive().max(100).optional().nullable().meta({
      title: "分页大小",
      description: "Airtable pageSize，范围 1-100，默认不超过返回数量",
      toolDescription:
        "Airtable pageSize, from 1 to 100. Defaults to at most maxRecords.",
    }),
    filterByFormula: z.string().optional().nullable().meta({
      title: "公式过滤",
      description: "Airtable filterByFormula 表达式",
      toolDescription: "Optional Airtable filterByFormula expression.",
    }),
    view: z.string().optional().nullable().meta({
      title: "视图",
      description: "可选 Airtable view 名称或 ID",
      toolDescription: "Optional Airtable view name or ID.",
    }),
    sort: sortInputSchema,
  }),
  outputSchema: listRecordsOutputType,
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
  inputSchema: z.object({
    ...airtableTableInputSchema,
    fields: fieldsInputSchema,
    typecast: z.boolean().optional().nullable().meta({
      title: "Typecast",
      description: "是否允许 Airtable 自动转换字段值类型",
      toolDescription: "Whether Airtable should typecast field values.",
    }),
  }),
  outputSchema: createRecordOutputType,
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
  inputSchema: z.object({
    ...airtableTableInputSchema,
    recordId: z.string().min(1).meta({
      title: "Record ID",
      description: "要更新的 Airtable record ID，例如 recXXXXXXXXXXXXXX",
      toolDescription: "Airtable record ID to update.",
    }),
    fields: fieldsInputSchema,
    typecast: z.boolean().optional().nullable().meta({
      title: "Typecast",
      description: "是否允许 Airtable 自动转换字段值类型",
      toolDescription: "Whether Airtable should typecast field values.",
    }),
  }),
  outputSchema: updateRecordOutputType,
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
      en: "List, create, and update Airtable records through the official Web API.",
      "zh-CN": "通过 Airtable 官方 Web API 列出、创建和更新记录。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "Airtable record operations toolset. Use it to list records with safe query limits, create one record, or update one record in a chosen base and table. It only calls https://api.airtable.com/v0 and does not delete records.",
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
        en: "List records from an Airtable table",
        "zh-CN": "列出 Airtable 表中的记录",
      },
      toolDescription:
        "List Airtable records from a base and table with optional formula, view, and sort filters.",
      handler: listRecordsHandler,
    },
    {
      id: "createRecord",
      name: {
        en: "Create Record",
        "zh-CN": "创建记录",
      },
      description: {
        en: "Create one Airtable record",
        "zh-CN": "创建一条 Airtable 记录",
      },
      toolDescription:
        "Create one Airtable record with a bounded fields object.",
      handler: createRecordHandler,
    },
    {
      id: "updateRecord",
      name: {
        en: "Update Record",
        "zh-CN": "更新记录",
      },
      description: {
        en: "Update one Airtable record",
        "zh-CN": "更新一条 Airtable 记录",
      },
      toolDescription:
        "Update one Airtable record by record ID with a bounded fields object.",
      handler: updateRecordHandler,
    },
  ],
});

export default toolSet;
