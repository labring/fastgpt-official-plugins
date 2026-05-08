import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  "appId": z.string().meta({
    title: "应用 ID (App ID)",
    description: "飞书机器人应用的 App ID， cli_xxx"
  }),
  "appSecret": z.string().meta({
    title: "应用密钥 (App Secret)",
    description: "飞书机器人应用的 App Secret"
  })
});
const biTableCreateSecretSchema = z.object({});
const biTableCreateInputSchema = z.object({
  "name": z.string().meta({
    title: "应用名称",
    description: "多维表格应用的名称",
    toolDescription: "The name of the Bitable application to create"
  }),
  "folderToken": z.string().optional().meta({
    title: "文件夹 Token",
    description: "创建应用的目标文件夹标识(可选)"
  })
});
const biTableCreateOutputSchema = z.object({
  "id": z.string().meta({
    title: "多维表格 ID"
  }),
  "url": z.string().optional().meta({
    title: "多维表格链接"
  })
});
const biTableCreateHandler = createToolHandler({
  inputSchema: biTableCreateInputSchema,
  outputSchema: biTableCreateOutputSchema,
  secretSchema: biTableCreateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await biTableCreateInputType.parseAsync(input);
    const output = await biTableCreateTool(parsedInput, ctx);
    return biTableCreateOutputType.parseAsync(output);
  },
});

const biTableGetSecretSchema = z.object({});
const biTableGetInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  })
});
const biTableGetOutputSchema = z.object({
  "name": z.string().meta({
    title: "应用名称",
    description: "应用名称"
  })
});
const biTableGetHandler = createToolHandler({
  inputSchema: biTableGetInputSchema,
  outputSchema: biTableGetOutputSchema,
  secretSchema: biTableGetSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await biTableGetInputType.parseAsync(input);
    const output = await biTableGetTool(parsedInput, ctx);
    return biTableGetOutputType.parseAsync(output);
  },
});

const biTableUpdateSecretSchema = z.object({});
const biTableUpdateInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application to update"
  }),
  "name": z.string().meta({
    title: "应用名称",
    description: "新的应用名称",
    toolDescription: "The new name for the Bitable application"
  })
});
const biTableUpdateOutputSchema = z.object({
  "success": z.boolean().meta({
    title: "是否成功",
    description: "操作是否成功"
  })
});
const biTableUpdateHandler = createToolHandler({
  inputSchema: biTableUpdateInputSchema,
  outputSchema: biTableUpdateOutputSchema,
  secretSchema: biTableUpdateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await biTableUpdateInputType.parseAsync(input);
    const output = await biTableUpdateTool(parsedInput, ctx);
    return biTableUpdateOutputType.parseAsync(output);
  },
});

const dataTableCreateSecretSchema = z.object({});
const dataTableCreateInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "tableName": z.string().meta({
    title: "数据表名称",
    description: "新建数据表的名称",
    toolDescription: "The name of the new table to create"
  })
});
const dataTableCreateOutputSchema = z.object({
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "创建的数据表唯一标识"
  })
});
const dataTableCreateHandler = createToolHandler({
  inputSchema: dataTableCreateInputSchema,
  outputSchema: dataTableCreateOutputSchema,
  secretSchema: dataTableCreateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableCreateInputType.parseAsync(input);
    const output = await dataTableCreateTool(parsedInput, ctx);
    return dataTableCreateOutputType.parseAsync(output);
  },
});

const dataTableDeleteSecretSchema = z.object({});
const dataTableDeleteInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "要删除的数据表唯一标识",
    toolDescription: "The table ID to delete"
  })
});
const dataTableDeleteOutputSchema = z.object({
  "success": z.boolean().meta({
    title: "是否成功",
    description: "操作是否成功"
  })
});
const dataTableDeleteHandler = createToolHandler({
  inputSchema: dataTableDeleteInputSchema,
  outputSchema: dataTableDeleteOutputSchema,
  secretSchema: dataTableDeleteSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableDeleteInputType.parseAsync(input);
    const output = await dataTableDeleteTool(parsedInput, ctx);
    return dataTableDeleteOutputType.parseAsync(output);
  },
});

const dataTableGetTableFieldsSecretSchema = z.object({});
const dataTableGetTableFieldsInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "数据表唯一标识",
    toolDescription: "The table ID to get fields from"
  })
});
const dataTableGetTableFieldsOutputSchema = z.object({
  "fields": z.array(z.record(z.string(), z.unknown())).meta({
    title: "字段列表",
    description: "字段配置信息数组,包含fieldId、fieldName、type等"
  })
});
const dataTableGetTableFieldsHandler = createToolHandler({
  inputSchema: dataTableGetTableFieldsInputSchema,
  outputSchema: dataTableGetTableFieldsOutputSchema,
  secretSchema: dataTableGetTableFieldsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput =
      await dataTableGetTableFieldsInputType.parseAsync(input);
    const output = await dataTableGetTableFieldsTool(parsedInput, ctx);
    return dataTableGetTableFieldsOutputType.parseAsync(output);
  },
});

const dataTableGetTablesSecretSchema = z.object({});
const dataTableGetTablesInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  })
});
const dataTableGetTablesOutputSchema = z.object({
  "tables": z.array(z.record(z.string(), z.unknown())).meta({
    title: "数据表列表",
    description: "数据表信息数组,每个元素包含tableId和name"
  })
});
const dataTableGetTablesHandler = createToolHandler({
  inputSchema: dataTableGetTablesInputSchema,
  outputSchema: dataTableGetTablesOutputSchema,
  secretSchema: dataTableGetTablesSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableGetTablesInputType.parseAsync(input);
    const output = await dataTableGetTablesTool(parsedInput, ctx);
    return dataTableGetTablesOutputType.parseAsync(output);
  },
});

const dataTableUpdateSecretSchema = z.object({});
const dataTableUpdateInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "数据表唯一标识",
    toolDescription: "The table ID to update"
  }),
  "name": z.string().meta({
    title: "新的数据表名称",
    toolDescription: "The new name for the table"
  })
});
const dataTableUpdateOutputSchema = z.object({
  "success": z.boolean().meta({
    title: "是否成功",
    description: "操作是否成功"
  })
});
const dataTableUpdateHandler = createToolHandler({
  inputSchema: dataTableUpdateInputSchema,
  outputSchema: dataTableUpdateOutputSchema,
  secretSchema: dataTableUpdateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await dataTableUpdateInputType.parseAsync(input);
    const output = await dataTableUpdateTool(parsedInput, ctx);
    return dataTableUpdateOutputType.parseAsync(output);
  },
});

const recordCreateSecretSchema = z.object({});
const recordCreateInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "数据表唯一标识",
    toolDescription: "The table ID to create record in"
  }),
  "fields": z.string().meta({
    title: "字段数据",
    description: "记录的字段数据,JSON对象格式",
    toolDescription: "The field data for the new record as JSON object"
  })
});
const recordCreateOutputSchema = z.object({
  "recordId": z.string().meta({
    title: "记录 ID",
    description: "创建的记录唯一标识"
  })
});
const recordCreateHandler = createToolHandler({
  inputSchema: recordCreateInputSchema,
  outputSchema: recordCreateOutputSchema,
  secretSchema: recordCreateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordCreateInputType.parseAsync(input);
    const output = await recordCreateTool(parsedInput, ctx);
    return recordCreateOutputType.parseAsync(output);
  },
});

const recordDeleteSecretSchema = z.object({});
const recordDeleteInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "数据表唯一标识",
    toolDescription: "The table ID containing the record"
  }),
  "recordId": z.string().meta({
    title: "记录 ID",
    description: "要删除的记录唯一标识",
    toolDescription: "The record ID to delete"
  })
});
const recordDeleteOutputSchema = z.object({
  "success": z.boolean().meta({
    title: "是否成功",
    description: "操作是否成功"
  })
});
const recordDeleteHandler = createToolHandler({
  inputSchema: recordDeleteInputSchema,
  outputSchema: recordDeleteOutputSchema,
  secretSchema: recordDeleteSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordDeleteInputType.parseAsync(input);
    const output = await recordDeleteTool(parsedInput, ctx);
    return recordDeleteOutputType.parseAsync(output);
  },
});

const recordGetSecretSchema = z.object({});
const recordGetInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "数据表唯一标识",
    toolDescription: "The table ID containing the record"
  }),
  "recordId": z.string().meta({
    title: "记录 ID",
    description: "记录唯一标识",
    toolDescription: "The record ID to retrieve"
  })
});
const recordGetOutputSchema = z.object({
  "recordId": z.string().meta({
    title: "记录 ID",
    description: "记录唯一标识"
  }),
  "fields": z.record(z.string(), z.unknown()).meta({
    title: "字段数据",
    description: "记录的字段数据对象"
  })
});
const recordGetHandler = createToolHandler({
  inputSchema: recordGetInputSchema,
  outputSchema: recordGetOutputSchema,
  secretSchema: recordGetSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordGetInputType.parseAsync(input);
    const output = await recordGetTool(parsedInput, ctx);
    return recordGetOutputType.parseAsync(output);
  },
});

const recordListSecretSchema = z.object({});
const recordListInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "数据表唯一标识",
    toolDescription: "The table ID to list records from"
  }),
  "viewId": z.string().optional().meta({
    title: "视图 ID",
    toolDescription: "The view ID to list records from"
  }),
  "pageSize": z.number().optional().meta({
    title: "分页大小",
    description: "每页返回的记录数量(1-500,默认20)",
    toolDescription: "Number of records per page (1-500, default 20)"
  }),
  "pageToken": z.string().optional().meta({
    title: "分页标记",
    description: "用于获取下一页数据的标记",
    toolDescription: "Token for fetching the next page of results"
  }),
  "filter": z.string().optional().meta({
    title: "筛选条件",
    description: "筛选公式(可选)",
    toolDescription: "Optional filter formula to apply"
  }),
  "sort": z.string().optional().meta({
    title: "排序规则",
    description: "排序规则JSON数组(可选)",
    toolDescription: "Optional sort rules as JSON array"
  })
});
const recordListOutputSchema = z.object({
  "records": z.array(z.record(z.string(), z.unknown())).meta({
    title: "记录列表",
    description: "记录数组,每个记录包含recordId和fields字段数据"
  }),
  "hasMore": z.boolean().meta({
    title: "是否有更多数据",
    description: "是否还有下一页数据"
  }),
  "pageToken": z.string().optional().meta({
    title: "下一页标记",
    description: "获取下一页数据的标记"
  }),
  "total": z.number().meta({
    title: "总数量",
    description: "记录总数量"
  })
});
const recordListHandler = createToolHandler({
  inputSchema: recordListInputSchema,
  outputSchema: recordListOutputSchema,
  secretSchema: recordListSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordListInputType.parseAsync(input);
    const output = await recordListTool(parsedInput, ctx);
    return recordListOutputType.parseAsync(output);
  },
});

const recordUpdateSecretSchema = z.object({});
const recordUpdateInputSchema = z.object({
  "biTableId": z.string().meta({
    title: "多维表格 ID",
    description: "多维表格应用的唯一标识",
    toolDescription: "The BiTable ID (app token) of the Bitable application"
  }),
  "dataTableId": z.string().meta({
    title: "数据表 ID",
    description: "数据表唯一标识",
    toolDescription: "The table ID containing the record"
  }),
  "recordId": z.string().meta({
    title: "记录 ID",
    description: "记录唯一标识",
    toolDescription: "The record ID to update"
  }),
  "fields": z.string().meta({
    title: "字段数据",
    description: "要更新的字段数据,JSON对象格式",
    toolDescription: "The field data to update as JSON object"
  })
});
const recordUpdateOutputSchema = z.object({
  "success": z.boolean().meta({
    title: "是否成功",
    description: "操作是否成功"
  })
});
const recordUpdateHandler = createToolHandler({
  inputSchema: recordUpdateInputSchema,
  outputSchema: recordUpdateOutputSchema,
  secretSchema: recordUpdateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await recordUpdateInputType.parseAsync(input);
    const output = await recordUpdateTool(parsedInput, ctx);
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
      en: "Provides comprehensive Feishu Bitable operations including app management, table management, record CRUD, and field configuration",
      "zh-CN":
        "提供飞书多维表格的完整操作功能，包括应用管理、数据表管理、记录 CRUD、字段配置查询",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "A comprehensive Feishu (Lark) Bitable toolset for managing multidimensional table apps, tables, records, and fields.\nSupports complete CRUD operations across all levels: apps, tables, and records.",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "biTableCreate",
      name: {
        en: "Create BiTable",
        "zh-CN": "新增多维表格",
      },
      description: {
        en: "Create a new Feishu Bitable",
        "zh-CN": "创建一个新的飞书多维表格",
      },
      toolDescription:
        "Create a new Feishu Bitable application with specified name and folder token.",
      handler: biTableCreateHandler,
    },
    {
      id: "biTableGet",
      name: {
        en: "Get BiTable",
        "zh-CN": "获取多维表格",
      },
      description: {
        en: "Get metadata information of a specific Feishu Bitable application",
        "zh-CN": "获取指定飞书多维表格应用的元数据信息",
      },
      toolDescription:
        "Retrieve metadata information of a Feishu Bitable application by its app token.",
      handler: biTableGetHandler,
    },
    {
      id: "biTableUpdate",
      name: {
        en: "Update BiTable",
        "zh-CN": "更新多维表格",
      },
      description: {
        en: "Update metadata information of a specific Feishu Bitable application",
        "zh-CN": "更新指定飞书多维表格应用的元数据信息",
      },
      toolDescription:
        "Update the name or other metadata of a Feishu Bitable application.",
      handler: biTableUpdateHandler,
    },
    {
      id: "dataTableCreate",
      name: {
        en: "Create Data Table",
        "zh-CN": "新增数据表",
      },
      description: {
        en: "Create a new data table in Feishu Bitable app",
        "zh-CN": "在飞书多维表格应用中创建新的数据表",
      },
      toolDescription:
        "Create a new data table in a Feishu Bitable application with specified name.",
      handler: dataTableCreateHandler,
    },
    {
      id: "dataTableDelete",
      name: {
        en: "Delete Data Table",
        "zh-CN": "删除数据表",
      },
      description: {
        en: "Delete a specific data table in Feishu Bitable app",
        "zh-CN": "删除飞书多维表格应用中的指定数据表",
      },
      toolDescription:
        "Delete a data table from a Feishu Bitable application by table ID.",
      handler: dataTableDeleteHandler,
    },
    {
      id: "dataTableGetTableFields",
      name: {
        en: "Get Table Fields",
        "zh-CN": "获取表字段配置",
      },
      description: {
        en: "Get field configuration of a data table in Feishu Bitable app",
        "zh-CN": "获取飞书多维表格数据表的字段配置信息",
      },
      toolDescription:
        "List all field configurations of a data table with pagination support.",
      handler: dataTableGetTableFieldsHandler,
    },
    {
      id: "dataTableGetTables",
      name: {
        en: "List Data Tables",
        "zh-CN": "获取数据表列表",
      },
      description: {
        en: "Get a list of all data tables in Feishu Bitable app",
        "zh-CN": "获取飞书多维表格应用中的所有数据表列表",
      },
      toolDescription:
        "List all data tables in a Feishu Bitable application with pagination support.",
      handler: dataTableGetTablesHandler,
    },
    {
      id: "dataTableUpdate",
      name: {
        en: "Update Data Table",
        "zh-CN": "更新数据表",
      },
      description: {
        en: "Update the name of a specific data table in Feishu Bitable app",
        "zh-CN": "更新飞书多维表格应用中指定数据表的名称",
      },
      toolDescription:
        "Update the name of a data table in a Feishu Bitable application.",
      handler: dataTableUpdateHandler,
    },
    {
      id: "recordCreate",
      name: {
        en: "Create Record",
        "zh-CN": "创建记录",
      },
      description: {
        en: "Create a new record in a data table in Feishu Bitable app",
        "zh-CN": "在飞书多维表格数据表中新增一条记录",
      },
      toolDescription:
        "Create a new record in a data table with specified field values.",
      handler: recordCreateHandler,
    },
    {
      id: "recordDelete",
      name: {
        en: "Delete Record",
        "zh-CN": "删除记录",
      },
      description: {
        en: "Delete a specific record from a data table in Feishu Bitable app",
        "zh-CN": "删除飞书多维表格数据表中的指定记录",
      },
      toolDescription: "Delete a record from a data table by record ID.",
      handler: recordDeleteHandler,
    },
    {
      id: "recordGet",
      name: {
        en: "Get Record",
        "zh-CN": "获取单个记录",
      },
      description: {
        en: "Get a single record from a data table in Feishu Bitable app",
        "zh-CN": "获取飞书多维表格数据表中的单条记录",
      },
      toolDescription:
        "Retrieve a specific record from a data table by record ID.",
      handler: recordGetHandler,
    },
    {
      id: "recordList",
      name: {
        en: "List Records",
        "zh-CN": "批量获取记录",
      },
      description: {
        en: "List records from a data table in Feishu Bitable app",
        "zh-CN": "批量获取飞书多维表格数据表中的记录",
      },
      toolDescription:
        "List records from a data table with optional filtering and pagination support.",
      handler: recordListHandler,
    },
    {
      id: "recordUpdate",
      name: {
        en: "Update Record",
        "zh-CN": "更新记录",
      },
      description: {
        en: "Update field values of a record in a data table in Feishu Bitable app",
        "zh-CN": "更新飞书多维表格数据表中的记录字段数据",
      },
      toolDescription:
        "Update specific field values of an existing record in a data table.",
      handler: recordUpdateHandler,
    },
  ],
});

export default toolSet;
