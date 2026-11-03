import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as biTableCreateInputType,
  OutputType as biTableCreateOutputType,
  tool as biTableCreateTool,
} from "./children/biTableCreate";
import {
  InputType as biTableGetInputType,
  OutputType as biTableGetOutputType,
  tool as biTableGetTool,
} from "./children/biTableGet";
import {
  InputType as biTableUpdateInputType,
  OutputType as biTableUpdateOutputType,
  tool as biTableUpdateTool,
} from "./children/biTableUpdate";
import {
  InputType as dataTableCreateInputType,
  OutputType as dataTableCreateOutputType,
  tool as dataTableCreateTool,
} from "./children/dataTableCreate";
import {
  InputType as dataTableDeleteInputType,
  OutputType as dataTableDeleteOutputType,
  tool as dataTableDeleteTool,
} from "./children/dataTableDelete";
import {
  InputType as dataTableGetTableFieldsInputType,
  OutputType as dataTableGetTableFieldsOutputType,
  tool as dataTableGetTableFieldsTool,
} from "./children/dataTableGetTableFields";
import {
  InputType as dataTableGetTablesInputType,
  OutputType as dataTableGetTablesOutputType,
  tool as dataTableGetTablesTool,
} from "./children/dataTableGetTables";
import {
  InputType as dataTableUpdateInputType,
  OutputType as dataTableUpdateOutputType,
  tool as dataTableUpdateTool,
} from "./children/dataTableUpdate";
import {
  InputType as recordCreateInputType,
  OutputType as recordCreateOutputType,
  tool as recordCreateTool,
} from "./children/recordCreate";
import {
  InputType as recordDeleteInputType,
  OutputType as recordDeleteOutputType,
  tool as recordDeleteTool,
} from "./children/recordDelete";
import {
  InputType as recordGetInputType,
  OutputType as recordGetOutputType,
  tool as recordGetTool,
} from "./children/recordGet";
import {
  InputType as recordListInputType,
  OutputType as recordListOutputType,
  tool as recordListTool,
} from "./children/recordList";
import {
  InputType as recordUpdateInputType,
  OutputType as recordUpdateOutputType,
  tool as recordUpdateTool,
} from "./children/recordUpdate";

const secretSchema = z.object({
  appId: z.string().meta({
    title: "应用 ID (App ID)",
    description: "飞书机器人应用的 App ID，cli_xxx",
    "x-i18n": {
      title: { en: "Application ID (App ID)", "zh-CN": "应用 ID (App ID)" },
      description: {
        en: "App ID of the Feishu bot application (cli_xxx).",
        "zh-CN": "飞书机器人应用的 App ID，cli_xxx。",
      },
    },
    isSecret: false,
  }),
  appSecret: z.string().meta({
    title: "应用密钥 (App Secret)",
    description: "飞书机器人应用的 App Secret",
    "x-i18n": {
      title: {
        en: "Application secret (App Secret)",
        "zh-CN": "应用密钥 (App Secret)",
      },
      description: {
        en: "App Secret of the Feishu bot application.",
        "zh-CN": "飞书机器人应用的 App Secret。",
      },
    },
    isSecret: true,
  }),
});
const biTableCreateSecretSchema = z.object({});
const biTableCreateInputSchema = defineInputSchema({
  name: {
    type: z.string(),
    title: { en: "Application name", "zh-CN": "应用名称" },
    description: {
      en: "Name of the Bitable application to create.",
      "zh-CN": "多维表格应用的名称。",
    },
    isToolParam: true,
  },
  folderToken: {
    type: z.string().optional(),
    title: { en: "Folder token", "zh-CN": "文件夹 Token" },
    description: {
      en: "Optional identifier of the folder where the application will be created.",
      "zh-CN": "创建应用的目标文件夹标识（可选）。",
    },
    isToolParam: true,
  },
});
const biTableCreateOutputSchema = defineOutputSchema({
  id: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
  },
  url: {
    type: z.string().optional(),
    title: { en: "Bitable application URL", "zh-CN": "多维表格链接" },
  },
});
const biTableCreateHandler = createToolHandler({
  inputSchema: biTableCreateInputSchema,
  outputSchema: biTableCreateOutputSchema,
  secretSchema: biTableCreateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await biTableCreateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await biTableCreateTool(parsedInput);
    return biTableCreateOutputType.parseAsync(output);
  },
});

const biTableGetSecretSchema = z.object({});
const biTableGetInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
});
const biTableGetOutputSchema = defineOutputSchema({
  name: {
    type: z.string(),
    title: { en: "Application name", "zh-CN": "应用名称" },
    description: {
      en: "Name of the Bitable application.",
      "zh-CN": "多维表格应用名称。",
    },
  },
});
const biTableGetHandler = createToolHandler({
  inputSchema: biTableGetInputSchema,
  outputSchema: biTableGetOutputSchema,
  secretSchema: biTableGetSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await biTableGetInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await biTableGetTool(parsedInput);
    return biTableGetOutputType.parseAsync(output);
  },
});

const biTableUpdateSecretSchema = z.object({});
const biTableUpdateInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application to update.",
      "zh-CN": "要更新的多维表格应用唯一标识（app token）。",
    },
    isToolParam: true,
  },
  name: {
    type: z.string(),
    title: { en: "Application name", "zh-CN": "应用名称" },
    description: {
      en: "New name for the Bitable application.",
      "zh-CN": "多维表格应用的新名称。",
    },
    isToolParam: true,
  },
});
const biTableUpdateOutputSchema = defineOutputSchema({
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "是否成功" },
    description: {
      en: "Whether the operation succeeded.",
      "zh-CN": "操作是否成功。",
    },
  },
});
const biTableUpdateHandler = createToolHandler({
  inputSchema: biTableUpdateInputSchema,
  outputSchema: biTableUpdateOutputSchema,
  secretSchema: biTableUpdateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await biTableUpdateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await biTableUpdateTool(parsedInput);
    return biTableUpdateOutputType.parseAsync(output);
  },
});

const dataTableCreateSecretSchema = z.object({});
const dataTableCreateInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  tableName: {
    type: z.string(),
    title: { en: "Table name", "zh-CN": "数据表名称" },
    description: {
      en: "Name of the new table.",
      "zh-CN": "新建数据表的名称。",
    },
    isToolParam: true,
  },
});
const dataTableCreateOutputSchema = defineOutputSchema({
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique identifier of the created table.",
      "zh-CN": "创建的数据表唯一标识。",
    },
  },
});
const dataTableCreateHandler = createToolHandler({
  inputSchema: dataTableCreateInputSchema,
  outputSchema: dataTableCreateOutputSchema,
  secretSchema: dataTableCreateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableCreateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await dataTableCreateTool(parsedInput);
    return dataTableCreateOutputType.parseAsync(output);
  },
});

const dataTableDeleteSecretSchema = z.object({});
const dataTableDeleteInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table to delete.",
      "zh-CN": "要删除的数据表唯一标识。",
    },
    isToolParam: true,
  },
});
const dataTableDeleteOutputSchema = defineOutputSchema({
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "是否成功" },
    description: {
      en: "Whether the operation succeeded.",
      "zh-CN": "操作是否成功。",
    },
  },
});
const dataTableDeleteHandler = createToolHandler({
  inputSchema: dataTableDeleteInputSchema,
  outputSchema: dataTableDeleteOutputSchema,
  secretSchema: dataTableDeleteSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableDeleteInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await dataTableDeleteTool(parsedInput);
    return dataTableDeleteOutputType.parseAsync(output);
  },
});

const dataTableGetTableFieldsSecretSchema = z.object({});
const dataTableGetTableFieldsInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table whose fields to retrieve.",
      "zh-CN": "要获取字段信息的数据表唯一标识。",
    },
    isToolParam: true,
  },
});
const dataTableGetTableFieldsOutputSchema = defineOutputSchema({
  fields: {
    type: z.array(
      defineOutputSchema({
        fieldId: {
          type: z.string(),
          title: { en: "Field ID", "zh-CN": "字段 ID" },
          description: {
            en: "Unique identifier of the field.",
            "zh-CN": "字段的唯一标识。",
          },
        },
        fieldName: {
          type: z.string(),
          title: { en: "Field name", "zh-CN": "字段名称" },
          description: {
            en: "Display name of the field.",
            "zh-CN": "字段显示名称。",
          },
        },
        type: {
          type: z.number(),
          title: { en: "Field type", "zh-CN": "字段类型" },
          description: {
            en: "Feishu Bitable field type code.",
            "zh-CN": "飞书多维表格字段类型代码。",
          },
        },
        isPrimary: {
          type: z.boolean().optional(),
          title: { en: "Primary field", "zh-CN": "主字段" },
          description: {
            en: "Whether this is the primary field.",
            "zh-CN": "该字段是否为主字段。",
          },
        },
        description: {
          type: z.any().optional(),
          title: { en: "Field description", "zh-CN": "字段说明" },
          description: {
            en: "Optional description configured for the field.",
            "zh-CN": "字段的可选说明。",
          },
        },
      }),
    ),
    title: { en: "Field list", "zh-CN": "字段列表" },
    description: {
      en: "Field configuration entries, including fieldId, fieldName, and type.",
      "zh-CN": "字段配置信息数组，包含 fieldId、fieldName、type 等。",
    },
  },
});
const dataTableGetTableFieldsHandler = createToolHandler({
  inputSchema: dataTableGetTableFieldsInputSchema,
  outputSchema: dataTableGetTableFieldsOutputSchema,
  secretSchema: dataTableGetTableFieldsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableGetTableFieldsInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await dataTableGetTableFieldsTool(parsedInput);
    return dataTableGetTableFieldsOutputType.parseAsync(output);
  },
});

const dataTableGetTablesSecretSchema = z.object({});
const dataTableGetTablesInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
});
const dataTableGetTablesOutputSchema = defineOutputSchema({
  tables: {
    type: z.array(
      defineOutputSchema({
        dataTableId: {
          type: z.string(),
          title: { en: "Table ID", "zh-CN": "数据表 ID" },
          description: {
            en: "Unique identifier of the table.",
            "zh-CN": "数据表的唯一标识。",
          },
        },
        name: {
          type: z.string(),
          title: { en: "Table name", "zh-CN": "数据表名称" },
          description: {
            en: "Display name of the table.",
            "zh-CN": "数据表显示名称。",
          },
        },
        revision: {
          type: z.number().optional(),
          title: { en: "Revision", "zh-CN": "版本号" },
          description: {
            en: "Optional table revision number.",
            "zh-CN": "数据表的可选版本号。",
          },
        },
      }),
    ),
    title: { en: "Tables", "zh-CN": "数据表列表" },
    description: {
      en: "Table entries, each containing a tableId and name.",
      "zh-CN": "数据表信息数组，每个元素包含 tableId 和 name。",
    },
  },
});
const dataTableGetTablesHandler = createToolHandler({
  inputSchema: dataTableGetTablesInputSchema,
  outputSchema: dataTableGetTablesOutputSchema,
  secretSchema: dataTableGetTablesSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableGetTablesInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await dataTableGetTablesTool(parsedInput);
    return dataTableGetTablesOutputType.parseAsync(output);
  },
});

const dataTableUpdateSecretSchema = z.object({});
const dataTableUpdateInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table to update.",
      "zh-CN": "要更新的数据表唯一标识。",
    },
    isToolParam: true,
  },
  name: {
    type: z.string(),
    title: { en: "New table name", "zh-CN": "新的数据表名称" },
    description: { en: "New name for the table.", "zh-CN": "数据表的新名称。" },
    isToolParam: true,
  },
});
const dataTableUpdateOutputSchema = defineOutputSchema({
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "是否成功" },
    description: {
      en: "Whether the operation succeeded.",
      "zh-CN": "操作是否成功。",
    },
  },
});
const dataTableUpdateHandler = createToolHandler({
  inputSchema: dataTableUpdateInputSchema,
  outputSchema: dataTableUpdateOutputSchema,
  secretSchema: dataTableUpdateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableUpdateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await dataTableUpdateTool(parsedInput);
    return dataTableUpdateOutputType.parseAsync(output);
  },
});

const recordCreateSecretSchema = z.object({});
const recordCreateInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table to create the record in.",
      "zh-CN": "要创建记录的数据表唯一标识。",
    },
    isToolParam: true,
  },
  fields: {
    type: z.string(),
    title: { en: "Field data", "zh-CN": "字段数据" },
    description: {
      en: "Field data for the new record as a JSON object string.",
      "zh-CN": "新记录的字段数据，JSON 对象格式。",
    },
    isToolParam: true,
  },
});
const recordCreateOutputSchema = defineOutputSchema({
  recordId: {
    type: z.string(),
    title: { en: "Record ID", "zh-CN": "记录 ID" },
    description: {
      en: "Unique identifier of the created record.",
      "zh-CN": "创建的记录唯一标识。",
    },
  },
});
const recordCreateHandler = createToolHandler({
  inputSchema: recordCreateInputSchema,
  outputSchema: recordCreateOutputSchema,
  secretSchema: recordCreateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordCreateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordCreateTool(parsedInput);
    return recordCreateOutputType.parseAsync(output);
  },
});

const recordDeleteSecretSchema = z.object({});
const recordDeleteInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table containing the record.",
      "zh-CN": "包含该记录的数据表唯一标识。",
    },
    isToolParam: true,
  },
  recordId: {
    type: z.string(),
    title: { en: "Record ID", "zh-CN": "记录 ID" },
    description: {
      en: "Unique ID of the record to delete.",
      "zh-CN": "要删除的记录唯一标识。",
    },
    isToolParam: true,
  },
});
const recordDeleteOutputSchema = defineOutputSchema({
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "是否成功" },
    description: {
      en: "Whether the operation succeeded.",
      "zh-CN": "操作是否成功。",
    },
  },
});
const recordDeleteHandler = createToolHandler({
  inputSchema: recordDeleteInputSchema,
  outputSchema: recordDeleteOutputSchema,
  secretSchema: recordDeleteSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordDeleteInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordDeleteTool(parsedInput);
    return recordDeleteOutputType.parseAsync(output);
  },
});

const recordGetSecretSchema = z.object({});
const recordGetInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table containing the record.",
      "zh-CN": "包含该记录的数据表唯一标识。",
    },
    isToolParam: true,
  },
  recordId: {
    type: z.string(),
    title: { en: "Record ID", "zh-CN": "记录 ID" },
    description: {
      en: "Unique identifier of the record to retrieve.",
      "zh-CN": "要获取的记录唯一标识。",
    },
    isToolParam: true,
  },
});
const recordGetOutputSchema = defineOutputSchema({
  recordId: {
    type: z.string(),
    title: { en: "Record ID", "zh-CN": "记录 ID" },
    description: {
      en: "Unique identifier of the record.",
      "zh-CN": "记录唯一标识。",
    },
  },
  fields: {
    type: z.record(z.string(), z.unknown()),
    title: { en: "Field data", "zh-CN": "字段数据" },
    description: {
      en: "Field data object for the record.",
      "zh-CN": "记录的字段数据对象。",
    },
  },
});
const recordGetHandler = createToolHandler({
  inputSchema: recordGetInputSchema,
  outputSchema: recordGetOutputSchema,
  secretSchema: recordGetSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordGetInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordGetTool(parsedInput);
    return recordGetOutputType.parseAsync(output);
  },
});

const recordListSecretSchema = z.object({});
const recordListInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table to list records from.",
      "zh-CN": "要列出记录的数据表唯一标识。",
    },
    isToolParam: true,
  },
  viewId: {
    type: z.string().optional(),
    title: { en: "View ID", "zh-CN": "视图 ID" },
    description: {
      en: "Optional view ID to list records from.",
      "zh-CN": "用于列出记录的视图 ID（可选）。",
    },
    isToolParam: true,
  },
  pageSize: {
    type: z.number().optional(),
    title: { en: "Page size", "zh-CN": "分页大小" },
    description: {
      en: "Number of records per page (1–500, default 20).",
      "zh-CN": "每页返回的记录数量（1-500，默认 20）。",
    },
    isToolParam: true,
  },
  pageToken: {
    type: z.string().optional(),
    title: { en: "Page token", "zh-CN": "分页标记" },
    description: {
      en: "Token for fetching the next page of results.",
      "zh-CN": "用于获取下一页数据的标记。",
    },
    isToolParam: true,
  },
  filter: {
    type: z.string().optional(),
    title: { en: "Filter", "zh-CN": "筛选条件" },
    description: {
      en: "Optional filter formula to apply.",
      "zh-CN": "可选筛选公式。",
    },
    isToolParam: true,
  },
  sort: {
    type: z.string().optional(),
    title: { en: "Sort rules", "zh-CN": "排序规则" },
    description: {
      en: "Optional sort rules as a JSON array.",
      "zh-CN": "可选排序规则，JSON 数组格式。",
    },
    isToolParam: true,
  },
});
const recordListOutputSchema = defineOutputSchema({
  records: {
    type: z.array(
      defineOutputSchema({
        recordId: {
          type: z.string(),
          title: { en: "Record ID", "zh-CN": "记录 ID" },
          description: {
            en: "Unique identifier of the record.",
            "zh-CN": "记录的唯一标识。",
          },
        },
        fields: {
          type: z.record(z.string(), z.any()),
          title: { en: "Field data", "zh-CN": "字段数据" },
          description: {
            en: "Record values keyed by Bitable field name or ID.",
            "zh-CN": "记录字段值，以多维表格字段名称或 ID 为键。",
          },
        },
      }),
    ),
    title: { en: "Records", "zh-CN": "记录列表" },
    description: {
      en: "Records, each containing recordId and fields.",
      "zh-CN": "记录数组，每个记录包含 recordId 和 fields 字段数据。",
    },
  },
  hasMore: {
    type: z.boolean(),
    title: { en: "More results available", "zh-CN": "是否有更多数据" },
    description: {
      en: "Whether another page of results is available.",
      "zh-CN": "是否还有下一页数据。",
    },
  },
  pageToken: {
    type: z.string().optional(),
    title: { en: "Next page token", "zh-CN": "下一页标记" },
    description: {
      en: "Token for fetching the next page.",
      "zh-CN": "获取下一页数据的标记。",
    },
  },
  total: {
    type: z.number(),
    title: { en: "Total count", "zh-CN": "总数量" },
    description: { en: "Total number of records.", "zh-CN": "记录总数量。" },
  },
});
const recordListHandler = createToolHandler({
  inputSchema: recordListInputSchema,
  outputSchema: recordListOutputSchema,
  secretSchema: recordListSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordListInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordListTool(parsedInput);
    return recordListOutputType.parseAsync(output);
  },
});

const recordUpdateSecretSchema = z.object({});
const recordUpdateInputSchema = defineInputSchema({
  biTableId: {
    type: z.string(),
    title: { en: "Bitable application ID", "zh-CN": "多维表格 ID" },
    description: {
      en: "App token identifying the Bitable application.",
      "zh-CN": "多维表格应用的唯一标识（app token）。",
    },
    isToolParam: true,
  },
  dataTableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "数据表 ID" },
    description: {
      en: "Unique ID of the table containing the record.",
      "zh-CN": "包含该记录的数据表唯一标识。",
    },
    isToolParam: true,
  },
  recordId: {
    type: z.string(),
    title: { en: "Record ID", "zh-CN": "记录 ID" },
    description: {
      en: "Unique identifier of the record to update.",
      "zh-CN": "要更新的记录唯一标识。",
    },
    isToolParam: true,
  },
  fields: {
    type: z.string(),
    title: { en: "Field data", "zh-CN": "字段数据" },
    description: {
      en: "Field data to update as a JSON object string.",
      "zh-CN": "要更新的字段数据，JSON 对象格式。",
    },
    isToolParam: true,
  },
});
const recordUpdateOutputSchema = defineOutputSchema({
  success: {
    type: z.boolean(),
    title: { en: "Success", "zh-CN": "是否成功" },
    description: {
      en: "Whether the operation succeeded.",
      "zh-CN": "操作是否成功。",
    },
  },
});
const recordUpdateHandler = createToolHandler({
  inputSchema: recordUpdateInputSchema,
  outputSchema: recordUpdateOutputSchema,
  secretSchema: recordUpdateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordUpdateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordUpdateTool(parsedInput);
    return recordUpdateOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "feishuBitable",
    name: {
      en: "Feishu Bitable",
      "zh-CN": "飞书多维表格",
    },
    description: {
      en: "A comprehensive Feishu Bitable toolset for managing apps, tables, records, and fields with full CRUD support.",
      "zh-CN":
        "用于管理飞书多维表格应用、数据表、记录和字段的完整工具集，支持完整 CRUD 操作。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "biTableCreate",
      name: { en: "Create BiTable", "zh-CN": "新增多维表格" },
      description: {
        en: "Create a Feishu Bitable application with a name and optional folder token.",
        "zh-CN": "使用指定名称和可选文件夹 Token 创建飞书多维表格应用。",
      },
      handler: biTableCreateHandler,
    },
    {
      id: "biTableGet",
      name: { en: "Get BiTable", "zh-CN": "获取多维表格" },
      description: {
        en: "Retrieve Bitable application metadata using its app token.",
        "zh-CN": "根据 app token 获取多维表格应用的元数据信息。",
      },
      handler: biTableGetHandler,
    },
    {
      id: "biTableUpdate",
      name: { en: "Update BiTable", "zh-CN": "更新多维表格" },
      description: {
        en: "Update the name or other metadata of a Bitable application.",
        "zh-CN": "更新多维表格应用的名称或其他元数据。",
      },
      handler: biTableUpdateHandler,
    },
    {
      id: "dataTableCreate",
      name: { en: "Create Data Table", "zh-CN": "新增数据表" },
      description: {
        en: "Create a named data table in a Bitable application.",
        "zh-CN": "在多维表格应用中创建指定名称的数据表。",
      },
      handler: dataTableCreateHandler,
    },
    {
      id: "dataTableDelete",
      name: { en: "Delete Data Table", "zh-CN": "删除数据表" },
      description: {
        en: "Delete a data table from a Bitable application by table ID.",
        "zh-CN": "根据数据表 ID 从多维表格应用中删除数据表。",
      },
      handler: dataTableDeleteHandler,
    },
    {
      id: "dataTableGetTableFields",
      name: { en: "Get Table Fields", "zh-CN": "获取表字段配置" },
      description: {
        en: "List all field configurations of a data table, with pagination support.",
        "zh-CN": "列出数据表的所有字段配置，支持分页。",
      },
      handler: dataTableGetTableFieldsHandler,
    },
    {
      id: "dataTableGetTables",
      name: { en: "List Data Tables", "zh-CN": "获取数据表列表" },
      description: {
        en: "List all data tables in a Bitable application, with pagination support.",
        "zh-CN": "列出多维表格应用中的所有数据表，支持分页。",
      },
      handler: dataTableGetTablesHandler,
    },
    {
      id: "dataTableUpdate",
      name: { en: "Update Data Table", "zh-CN": "更新数据表" },
      description: {
        en: "Update the name of a data table in a Bitable application.",
        "zh-CN": "更新多维表格应用中数据表的名称。",
      },
      handler: dataTableUpdateHandler,
    },
    {
      id: "recordCreate",
      name: { en: "Create Record", "zh-CN": "创建记录" },
      description: {
        en: "Create a record in a data table using the supplied field values.",
        "zh-CN": "使用提供的字段值在数据表中创建记录。",
      },
      handler: recordCreateHandler,
    },
    {
      id: "recordDelete",
      name: { en: "Delete Record", "zh-CN": "删除记录" },
      description: {
        en: "Delete a record from a data table by record ID.",
        "zh-CN": "根据记录 ID 从数据表中删除记录。",
      },
      handler: recordDeleteHandler,
    },
    {
      id: "recordGet",
      name: { en: "Get Record", "zh-CN": "获取单个记录" },
      description: {
        en: "Retrieve a specific record from a data table by record ID.",
        "zh-CN": "根据记录 ID 获取数据表中的指定记录。",
      },
      handler: recordGetHandler,
    },
    {
      id: "recordList",
      name: { en: "List Records", "zh-CN": "批量获取记录" },
      description: {
        en: "List records with optional filtering and pagination.",
        "zh-CN": "列出数据表记录，支持可选筛选和分页。",
      },
      handler: recordListHandler,
    },
    {
      id: "recordUpdate",
      name: { en: "Update Record", "zh-CN": "更新记录" },
      description: {
        en: "Update selected field values of an existing record.",
        "zh-CN": "更新现有记录的指定字段值。",
      },
      handler: recordUpdateHandler,
    },
  ],
});

export default toolSet;
