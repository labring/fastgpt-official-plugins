import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as documentExportInputType,
  OutputType as documentExportOutputType,
  tool as documentExportTool,
} from "./children/documentExport";
import {
  InputType as documentImportInputType,
  OutputType as documentImportOutputType,
  tool as documentImportTool,
} from "./children/documentImport";
import {
  InputType as recordCreateInputType,
  OutputType as recordCreateOutputType,
  tool as recordCreateTool,
} from "./children/recordCreate";
import {
  InputType as recordsListInputType,
  OutputType as recordsListOutputType,
  tool as recordsListTool,
} from "./children/recordsList";
import {
  InputType as recordUpdateInputType,
  OutputType as recordUpdateOutputType,
  tool as recordUpdateTool,
} from "./children/recordUpdate";

const secretSchema = z.object({
  gristApiKey: z.string().meta({
    title: "Grist API Key",
    description: "Grist API 密钥，用于 Bearer token 鉴权",
    toolDescription:
      "Grist API key used as a Bearer token for Grist REST API calls.",
    isSecret: true,
  }),
  gristBaseUrl: z.string().optional().nullable().meta({
    title: "Grist Base URL",
    description:
      "Grist 服务地址，留空默认使用 https://docs.getgrist.com。自托管 Grist 可填写自己的服务地址。",
    toolDescription:
      "Optional Grist service base URL. Leave empty to use https://docs.getgrist.com, or set it for self-hosted Grist.",
    isSecret: false,
  }),
});

const gristTableInputSchema = {
  docId: z.string().meta({
    title: "文档 ID",
    description: "Grist document ID",
    toolDescription: "Grist document ID that contains the target table.",
  }),
  tableId: z.string().meta({
    title: "表格 ID",
    description: "Grist table ID",
    toolDescription: "Grist table ID to operate on.",
  }),
};

const gristFieldsInputSchema = z
  .union([z.record(z.string(), z.unknown()), z.string()])
  .meta({
    title: "字段数据",
    description: "字段对象或 JSON 字符串",
    toolDescription:
      "Record fields as an object or a JSON object string. Keys are Grist column IDs and values are cell values.",
  });

const recordsListHandler = createToolHandler({
  inputSchema: z.object({
    ...gristTableInputSchema,
    limit: z.number().int().positive().optional().nullable().meta({
      title: "数量限制",
      description: "返回记录数量限制",
      toolDescription: "Optional maximum number of records to return.",
    }),
    sort: z.string().optional().nullable().meta({
      title: "排序",
      description: "Grist sort 参数，例如 Name 或 -CreatedAt",
      toolDescription:
        "Optional Grist sort expression, such as Name for ascending or -CreatedAt for descending.",
    }),
    filter: z
      .union([z.record(z.string(), z.unknown()), z.string()])
      .optional()
      .nullable()
      .meta({
        title: "过滤条件",
        description: "过滤对象或 JSON 字符串",
        toolDescription:
          "Optional Grist filter as an object or JSON object string. Keys are column IDs and values are allowed values.",
      }),
    viewSection: z.number().int().positive().optional().nullable().meta({
      title: "视图区块 ID",
      description: "可选 viewSection 参数",
      toolDescription:
        "Optional Grist viewSection ID used to apply view-specific filtering.",
    }),
  }),
  outputSchema: recordsListOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await recordsListInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordsListTool(parsedInput, ctx);
    return recordsListOutputType.parseAsync(output);
  },
});

const recordCreateHandler = createToolHandler({
  inputSchema: z.object({
    ...gristTableInputSchema,
    fields: gristFieldsInputSchema,
  }),
  outputSchema: recordCreateOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await recordCreateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordCreateTool(parsedInput, ctx);
    return recordCreateOutputType.parseAsync(output);
  },
});

const recordUpdateHandler = createToolHandler({
  inputSchema: z.object({
    ...gristTableInputSchema,
    recordId: z.number().int().positive().meta({
      title: "记录 ID",
      description: "要更新的 Grist record ID",
      toolDescription: "Numeric Grist record ID of the row to update.",
    }),
    fields: gristFieldsInputSchema,
  }),
  outputSchema: recordUpdateOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await recordUpdateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordUpdateTool(parsedInput, ctx);
    return recordUpdateOutputType.parseAsync(output);
  },
});

const documentImportHandler = createToolHandler({
  inputSchema: z.object({
    workspaceId: z.number().int().positive().meta({
      title: "工作区 ID",
      description: "导入 Grist 文档的 workspace ID",
      toolDescription:
        "Numeric Grist workspace ID where the uploaded file should be imported as a document.",
    }),
    fileUrl: z.string().url().meta({
      title: "文件 URL",
      description:
        "可下载的文件 URL。Grist /api/docs multipart 导入支持 Excel、CSV 等可导入文件，也支持 .grist 文档文件。",
      toolDescription:
        "Publicly reachable URL of the file to import into Grist through /api/docs multipart upload. Use Excel, CSV, or other Grist-importable files.",
    }),
    fileName: z.string().optional().nullable().meta({
      title: "文件名",
      description: "可选上传文件名，留空则从 URL 推断",
      toolDescription:
        "Optional file name used in the multipart upload. Leave empty to infer it from fileUrl.",
    }),
    documentName: z.string().optional().nullable().meta({
      title: "文档名称",
      description: "可选新建 Grist 文档名称",
      toolDescription: "Optional name for the imported Grist document.",
    }),
    timezone: z.string().optional().nullable().meta({
      title: "时区",
      description: "可选文档时区，例如 America/New_York",
      toolDescription:
        "Optional timezone for the imported Grist document, for example America/New_York.",
    }),
  }),
  outputSchema: documentImportOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await documentImportInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await documentImportTool(parsedInput, ctx);
    return documentImportOutputType.parseAsync(output);
  },
});

const documentExportHandler = createToolHandler({
  inputSchema: z.object({
    docId: z.string().meta({
      title: "文档 ID",
      description: "要导出的 Grist document ID",
      toolDescription: "Grist document ID to export.",
    }),
    format: z
      .enum(["grist", "xlsx", "csv", "tsv", "dsv"])
      .optional()
      .default("grist")
      .meta({
        title: "导出格式",
        description:
          "导出格式。grist 导出完整文档，xlsx 导出 Excel，csv/tsv/dsv 导出单表数据。",
        toolDescription:
          "Export format. Use grist for a full Grist document, xlsx for an Excel workbook, or csv/tsv/dsv for one table.",
      }),
    tableId: z.string().optional().nullable().meta({
      title: "表格 ID",
      description: "csv、tsv、dsv 导出时必填；xlsx 可选用于限定单表",
      toolDescription:
        "Grist table ID required for csv, tsv, and dsv exports. Optional for xlsx to limit the Excel export to one table.",
    }),
    fileName: z.string().optional().nullable().meta({
      title: "导出文件名",
      description: "可选导出文件名，留空默认使用 docId 加格式扩展名",
      toolDescription:
        "Optional output file name. Leave empty to use the document ID with the selected format extension.",
    }),
    nohistory: z.boolean().optional().nullable().meta({
      title: "移除历史",
      description: "grist 格式导出时是否移除文档历史以减小文件体积",
      toolDescription:
        "For grist export only: whether to remove document history from the exported Grist file.",
    }),
    template: z.boolean().optional().nullable().meta({
      title: "模板导出",
      description: "grist 格式导出时是否按 template 参数导出",
      toolDescription:
        "For grist export only: whether to pass Grist's template query parameter when downloading the document.",
    }),
    header: z.enum(["colId", "label"]).optional().nullable().meta({
      title: "表头格式",
      description: "xlsx/csv/tsv/dsv 导出表头格式，colId 或 label",
      toolDescription:
        "Header format for xlsx, csv, tsv, and dsv exports. Use colId for normalized column IDs or label for human-friendly labels.",
    }),
  }),
  outputSchema: documentExportOutputType,
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await documentExportInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await documentExportTool(parsedInput, ctx);
    return documentExportOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "grist",
    name: {
      en: "Grist",
      "zh-CN": "Grist 表格",
    },
    description: {
      en: "Provides Grist document import/export and record operations",
      "zh-CN": "提供 Grist 文档导入导出和表格记录操作能力",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "A Grist toolset for importing files into Grist documents, exporting documents as grist or xlsx files, exporting tables as csv/tsv/dsv, and listing, creating, and updating records via the Grist REST API.",
    permission: ["file-upload:allow"],
    tutorialUrl: "https://support.getgrist.com/api/",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "documentImport",
      name: {
        en: "Import Document",
        "zh-CN": "导入文档",
      },
      description: {
        en: "Import a file into a Grist workspace",
        "zh-CN": "将文件导入 Grist 工作区",
      },
      toolDescription:
        "Import a downloadable Excel, CSV, .grist, or other Grist-importable file into a Grist workspace via /api/docs multipart upload.",
      handler: documentImportHandler,
    },
    {
      id: "documentExport",
      name: {
        en: "Export Document",
        "zh-CN": "导出文档",
      },
      description: {
        en: "Export a Grist document or table",
        "zh-CN": "导出 Grist 文档或表格",
      },
      toolDescription:
        "Export a Grist document as grist or xlsx, or export one table as csv, tsv, or dsv, then return a FastGPT file URL.",
      handler: documentExportHandler,
    },
    {
      id: "recordsList",
      name: {
        en: "List Records",
        "zh-CN": "查询记录",
      },
      description: {
        en: "List records from a Grist table",
        "zh-CN": "查询 Grist 表格中的记录",
      },
      toolDescription:
        "List Grist table records with optional limit, sort, filter, and view section.",
      handler: recordsListHandler,
    },
    {
      id: "recordCreate",
      name: {
        en: "Create Record",
        "zh-CN": "新增记录",
      },
      description: {
        en: "Create a record in a Grist table",
        "zh-CN": "在 Grist 表格中新增一条记录",
      },
      toolDescription:
        "Create one Grist table record from a fields object or JSON string.",
      handler: recordCreateHandler,
    },
    {
      id: "recordUpdate",
      name: {
        en: "Update Record",
        "zh-CN": "更新记录",
      },
      description: {
        en: "Update a record in a Grist table",
        "zh-CN": "更新 Grist 表格中的一条记录",
      },
      toolDescription:
        "Update one Grist table record by record ID and fields object or JSON string.",
      handler: recordUpdateHandler,
    },
  ],
});

export default toolSet;
