import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
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
    "x-i18n": {
      title: { en: "Grist API key", "zh-CN": "Grist API 密钥" },
      description: {
        en: "Grist API key used as a Bearer token for REST API calls.",
        "zh-CN": "Grist API 密钥，用于 Bearer token 鉴权。",
      },
    },
    isSecret: true,
  }),
  gristBaseUrl: z
    .string()
    .optional()
    .nullable()
    .meta({
      title: "Grist Base URL",
      description:
        "Grist 服务地址，留空默认使用 https://docs.getgrist.com。自托管 Grist 可填写自己的服务地址。",
      "x-i18n": {
        title: { en: "Grist base URL", "zh-CN": "Grist 服务地址" },
        description: {
          en: "Optional Grist service URL. Leave empty to use https://docs.getgrist.com, or set a URL for self-hosted Grist.",
          "zh-CN":
            "Grist 服务地址，留空默认使用 https://docs.getgrist.com。自托管 Grist 可填写自己的服务地址。",
        },
      },
      isSecret: false,
    }),
});

const gristTableInputFields = {
  docId: {
    type: z.string(),
    title: { en: "Document ID", "zh-CN": "文档 ID" },
    description: {
      en: "Grist document ID containing the target table.",
      "zh-CN": "包含目标表格的 Grist 文档 ID。",
    },
    isToolParam: true,
  },
  tableId: {
    type: z.string(),
    title: { en: "Table ID", "zh-CN": "表格 ID" },
    description: {
      en: "Grist table ID to operate on.",
      "zh-CN": "要操作的 Grist 表格 ID。",
    },
    isToolParam: true,
  },
};

const gristFieldsInputSchema = z.union([
  z.record(z.string(), z.unknown()),
  z.string(),
]);

const recordsListHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...gristTableInputFields,
    limit: {
      type: z.number().int().positive().optional().nullable(),
      title: { en: "Limit", "zh-CN": "数量限制" },
      description: {
        en: "Optional maximum number of records to return.",
        "zh-CN": "可选的返回记录数量上限。",
      },
      isToolParam: true,
    },
    sort: {
      type: z.string().optional().nullable(),
      title: { en: "Sort", "zh-CN": "排序" },
      description: {
        en: "Optional sort expression, such as Name or -CreatedAt.",
        "zh-CN": "可选排序表达式，例如 Name 或 -CreatedAt。",
      },
      isToolParam: true,
    },
    filter: {
      type: z
        .union([z.record(z.string(), z.unknown()), z.string()])
        .optional()
        .nullable(),
      title: { en: "Filter", "zh-CN": "过滤条件" },
      description: {
        en: "Optional filter object or JSON string; keys are column IDs and values are allowed values.",
        "zh-CN": "可选过滤对象或 JSON 字符串；键为列 ID，值为允许的值。",
      },
      isToolParam: true,
    },
    viewSection: {
      type: z.number().int().positive().optional().nullable(),
      title: { en: "View section ID", "zh-CN": "视图区块 ID" },
      description: {
        en: "Optional viewSection ID for view-specific filtering.",
        "zh-CN": "用于视图筛选的可选 viewSection ID。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: defineOutputSchema({
    records: {
      type: z.array(
        defineOutputSchema({
          id: {
            type: z.number(),
            title: { en: "Record ID", "zh-CN": "记录 ID" },
            description: {
              en: "Unique numeric identifier of this record.",
              "zh-CN": "此记录的唯一数字标识。",
            },
          },
          fields: {
            type: z.record(z.string(), z.unknown()),
            title: { en: "Record fields", "zh-CN": "记录字段" },
            description: {
              en: "Column values for this record, keyed by Grist column ID.",
              "zh-CN": "此记录的列值，以 Grist 列 ID 为键。",
            },
          },
        }),
      ),
      title: { en: "Records", "zh-CN": "记录列表" },
      description: {
        en: "Matching Grist records.",
        "zh-CN": "匹配的 Grist 记录。",
      },
    },
    success: {
      type: z.boolean(),
      title: { en: "Success", "zh-CN": "是否成功" },
      description: {
        en: "Whether the request succeeded.",
        "zh-CN": "请求是否成功。",
      },
    },
  }),
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await recordsListInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordsListTool(parsedInput);
    return recordsListOutputType.parseAsync(output);
  },
});

const recordCreateHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...gristTableInputFields,
    fields: {
      type: gristFieldsInputSchema,
      title: { en: "Field data", "zh-CN": "字段数据" },
      description: {
        en: "Record fields as an object or JSON object string. Keys are Grist column IDs.",
        "zh-CN": "记录字段对象或 JSON 字符串，键为 Grist 列 ID。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: defineOutputSchema({
    result: {
      type: z.any(),
      title: { en: "Create result", "zh-CN": "创建结果" },
      description: {
        en: "Response returned by Grist.",
        "zh-CN": "Grist 返回的响应。",
      },
    },
    success: {
      type: z.boolean(),
      title: { en: "Success", "zh-CN": "是否成功" },
      description: {
        en: "Whether the request succeeded.",
        "zh-CN": "请求是否成功。",
      },
    },
  }),
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await recordCreateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordCreateTool(parsedInput);
    return recordCreateOutputType.parseAsync(output);
  },
});

const recordUpdateHandler = createToolHandler({
  inputSchema: defineInputSchema({
    ...gristTableInputFields,
    recordId: {
      type: z.number().int().positive(),
      title: { en: "Record ID", "zh-CN": "记录 ID" },
      description: {
        en: "Numeric ID of the Grist record to update.",
        "zh-CN": "要更新的 Grist 记录数字 ID。",
      },
      isToolParam: true,
    },
    fields: {
      type: gristFieldsInputSchema,
      title: { en: "Field data", "zh-CN": "字段数据" },
      description: {
        en: "Fields to update as an object or JSON object string.",
        "zh-CN": "要更新的字段对象或 JSON 字符串。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: defineOutputSchema({
    result: {
      type: z.any(),
      title: { en: "Update result", "zh-CN": "更新结果" },
      description: {
        en: "Response returned by Grist.",
        "zh-CN": "Grist 返回的响应。",
      },
    },
    success: {
      type: z.boolean(),
      title: { en: "Success", "zh-CN": "是否成功" },
      description: {
        en: "Whether the request succeeded.",
        "zh-CN": "请求是否成功。",
      },
    },
  }),
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await recordUpdateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await recordUpdateTool(parsedInput);
    return recordUpdateOutputType.parseAsync(output);
  },
});

const documentImportHandler = createToolHandler({
  inputSchema: defineInputSchema({
    workspaceId: {
      type: z.number().int().positive(),
      title: { en: "Workspace ID", "zh-CN": "工作区 ID" },
      description: {
        en: "Numeric workspace ID where the uploaded file will be imported as a document.",
        "zh-CN": "用于将上传文件导入为文档的数字工作区 ID。",
      },
      isToolParam: true,
    },
    fileUrl: {
      type: z.string().url(),
      title: { en: "File URL", "zh-CN": "文件 URL" },
      description: {
        en: "Publicly reachable file URL for import. Supported files include Excel, CSV, other Grist-importable formats, and .grist documents.",
        "zh-CN":
          "可公开访问的导入文件 URL，支持 Excel、CSV 等 Grist 可导入文件及 .grist 文档。",
      },
      isToolParam: true,
    },
    fileName: {
      type: z.string().optional().nullable(),
      title: { en: "File name", "zh-CN": "文件名" },
      description: {
        en: "Optional multipart upload filename; inferred from the URL when omitted.",
        "zh-CN": "可选 multipart 上传文件名；省略时从 URL 推断。",
      },
      isToolParam: true,
    },
    documentName: {
      type: z.string().optional().nullable(),
      title: { en: "Document name", "zh-CN": "文档名称" },
      description: {
        en: "Optional name for the imported Grist document.",
        "zh-CN": "导入的 Grist 文档可选名称。",
      },
      isToolParam: true,
    },
    timezone: {
      type: z.string().optional().nullable(),
      title: { en: "Timezone", "zh-CN": "时区" },
      description: {
        en: "Optional document timezone, such as America/New_York.",
        "zh-CN": "文档可选时区，例如 America/New_York。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: defineOutputSchema({
    docId: {
      type: z.string(),
      title: { en: "Document ID", "zh-CN": "文档 ID" },
      description: {
        en: "ID of the imported document.",
        "zh-CN": "导入文档的 ID。",
      },
    },
    raw: {
      type: z.any(),
      title: { en: "Raw result", "zh-CN": "原始结果" },
      description: {
        en: "Raw response from Grist.",
        "zh-CN": "Grist 返回的原始响应。",
      },
    },
    success: {
      type: z.boolean(),
      title: { en: "Success", "zh-CN": "是否成功" },
      description: {
        en: "Whether the import succeeded.",
        "zh-CN": "导入是否成功。",
      },
    },
  }),
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await documentImportInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await documentImportTool(parsedInput);
    return documentImportOutputType.parseAsync(output);
  },
});

const documentExportHandler = createToolHandler({
  inputSchema: defineInputSchema({
    docId: {
      type: z.string(),
      title: { en: "Document ID", "zh-CN": "文档 ID" },
      description: {
        en: "Grist document ID to export.",
        "zh-CN": "要导出的 Grist 文档 ID。",
      },
      isToolParam: true,
    },
    format: {
      type: z
        .enum(["grist", "xlsx", "csv", "tsv", "dsv"])
        .optional()
        .default("grist"),
      title: { en: "Export format", "zh-CN": "导出格式" },
      description: {
        en: "Use grist for a full document, xlsx for a workbook, or csv/tsv/dsv for one table.",
        "zh-CN":
          "grist 导出完整文档，xlsx 导出 Excel 工作簿，csv/tsv/dsv 导出单表数据。",
      },
      isToolParam: true,
    },
    tableId: {
      type: z.string().optional().nullable(),
      title: { en: "Table ID", "zh-CN": "表格 ID" },
      description: {
        en: "Required for csv/tsv/dsv; optional for xlsx to limit the export to one table.",
        "zh-CN": "csv/tsv/dsv 导出时必填；xlsx 可选，用于限定单表。",
      },
      isToolParam: true,
    },
    fileName: {
      type: z.string().optional().nullable(),
      title: { en: "Output filename", "zh-CN": "导出文件名" },
      description: {
        en: "Optional filename; defaults to the document ID with the selected extension.",
        "zh-CN": "可选导出文件名，默认使用文档 ID 和所选格式扩展名。",
      },
      isToolParam: true,
    },
    nohistory: {
      type: z.boolean().optional().nullable(),
      title: { en: "Remove history", "zh-CN": "移除历史" },
      description: {
        en: "For grist exports, whether to remove document history to reduce file size.",
        "zh-CN": "grist 格式导出时是否移除文档历史以减小文件体积。",
      },
      isToolParam: true,
    },
    template: {
      type: z.boolean().optional().nullable(),
      title: { en: "Export as template", "zh-CN": "模板导出" },
      description: {
        en: "For grist exports, whether to pass Grist's template parameter.",
        "zh-CN": "grist 格式导出时是否传递 Grist 的 template 参数。",
      },
      isToolParam: true,
    },
    header: {
      type: z.enum(["colId", "label"]).optional().nullable(),
      title: { en: "Header format", "zh-CN": "表头格式" },
      description: {
        en: "Header format for xlsx/csv/tsv/dsv: colId for normalized IDs or label for human-readable labels.",
        "zh-CN":
          "xlsx/csv/tsv/dsv 表头格式：colId 使用标准列 ID，label 使用易读标签。",
      },
      isToolParam: true,
    },
  }),
  outputSchema: defineOutputSchema({
    fileUrl: {
      type: z.string(),
      title: { en: "File URL", "zh-CN": "文件 URL" },
      description: {
        en: "FastGPT URL of the exported file.",
        "zh-CN": "导出文件的 FastGPT URL。",
      },
    },
    fileName: {
      type: z.string(),
      title: { en: "File name", "zh-CN": "文件名" },
      description: {
        en: "Name of the exported file.",
        "zh-CN": "导出文件名称。",
      },
    },
    contentType: {
      type: z.string(),
      title: { en: "Content type", "zh-CN": "内容类型" },
      description: {
        en: "MIME type of the exported file.",
        "zh-CN": "导出文件的 MIME 类型。",
      },
    },
    raw: {
      type: z.any(),
      title: { en: "Raw result", "zh-CN": "原始结果" },
      description: {
        en: "Raw Grist export response.",
        "zh-CN": "Grist 导出的原始响应。",
      },
    },
    success: {
      type: z.boolean(),
      title: { en: "Success", "zh-CN": "是否成功" },
      description: {
        en: "Whether the export succeeded.",
        "zh-CN": "导出是否成功。",
      },
    },
  }),
  secretSchema: z.object({}),
  handler: async (input, ctx) => {
    const parsedInput = await documentExportInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await documentExportTool(parsedInput);
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
      en: "Grist REST API tools for importing and exporting documents and managing records.",
      "zh-CN": "Grist REST API 工具，可用于导入导出文档和管理记录。",
    },
    version: "0.1.0",
    versionDescription: { en: "Initial version", "zh-CN": "初始版本" },
    permission: ["file-upload:allow"],
    tutorialUrl: "https://support.getgrist.com/api/",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "documentImport",
      name: { en: "Import Document", "zh-CN": "导入文档" },
      description: {
        en: "Import an Excel, CSV, .grist, or other Grist-importable file into a workspace via multipart upload.",
        "zh-CN":
          "通过 multipart 上传将 Excel、CSV、.grist 或其他 Grist 可导入文件导入工作区。",
      },
      handler: documentImportHandler,
    },
    {
      id: "documentExport",
      name: { en: "Export Document", "zh-CN": "导出文档" },
      description: {
        en: "Export a Grist document as grist or xlsx, or a table as csv, tsv, or dsv, and return a FastGPT file URL.",
        "zh-CN":
          "将 Grist 文档导出为 grist 或 xlsx，或将表格导出为 csv、tsv、dsv，并返回 FastGPT 文件 URL。",
      },
      handler: documentExportHandler,
    },
    {
      id: "recordsList",
      name: { en: "List Records", "zh-CN": "查询记录" },
      description: {
        en: "List Grist table records with optional limit, sort, filter, and view section.",
        "zh-CN":
          "查询 Grist 表格记录，支持可选数量限制、排序、筛选和视图区块。",
      },
      handler: recordsListHandler,
    },
    {
      id: "recordCreate",
      name: { en: "Create Record", "zh-CN": "新增记录" },
      description: {
        en: "Create one Grist table record from a fields object or JSON string.",
        "zh-CN": "根据字段对象或 JSON 字符串在 Grist 表格中创建一条记录。",
      },
      handler: recordCreateHandler,
    },
    {
      id: "recordUpdate",
      name: { en: "Update Record", "zh-CN": "更新记录" },
      description: {
        en: "Update a Grist table record by ID and fields object or JSON string.",
        "zh-CN": "根据记录 ID 和字段对象或 JSON 字符串更新 Grist 表格记录。",
      },
      handler: recordUpdateHandler,
    },
  ],
});

export default toolSet;
