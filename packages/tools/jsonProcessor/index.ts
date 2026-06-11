import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as jsonPatchInputType,
  OutputType as jsonPatchOutputType,
  tool as jsonPatchTool,
} from "./children/jsonPatch";
import {
  InputType as jsonPathInputType,
  OutputType as jsonPathOutputType,
  tool as jsonPathTool,
} from "./children/jsonPath";
import {
  InputType as structureInputType,
  OutputType as structureOutputType,
  tool as structureTool,
} from "./children/structure";
import { JsonInputSchema, JsonValueSchema } from "./src/json";

const secretSchema = z.object({});

const jsonPathSecretSchema = z.object({});
const jsonPathInputSchema = z.object({
  json: JsonInputSchema.meta({
    title: "JSON 内容",
    description: "JSON 字符串或已结构化的 JSON 对象/数组",
    toolDescription:
      "The JSON document to query. It can be a JSON string, object, or array.",
  }),
  path: z.string().meta({
    title: "JSONPath 表达式",
    description: "例如 $.store.book[*].title",
    toolDescription: "JSONPath expression, for example $.items[*].name",
  }),
  resultType: z
    .enum(["value", "path", "pointer", "parent", "parentProperty", "all"])
    .optional()
    .meta({
      title: "返回类型",
      description: "默认返回匹配值，也可返回路径、JSON Pointer 或父节点信息",
    }),
  flatten: z.boolean().optional().meta({
    title: "展开结果",
    description: "是否展开嵌套数组结果",
  }),
});
const jsonPathOutputSchema = z.object({
  matches: z.array(z.unknown()).meta({
    title: "匹配结果",
    description: "JSONPath 匹配到的结果数组",
  }),
  first: z.unknown().nullable().meta({
    title: "首个匹配",
    description: "第一个匹配值；没有匹配时为 null",
  }),
  count: z.number().meta({
    title: "匹配数量",
  }),
  json: z.string().meta({
    title: "JSON 字符串",
    description: "匹配结果的 JSON 字符串表示",
  }),
});
const jsonPathHandler = createToolHandler({
  inputSchema: jsonPathInputSchema,
  outputSchema: jsonPathOutputSchema,
  secretSchema: jsonPathSecretSchema,
  handler: async (input) => {
    const parsedInput = await jsonPathInputType.parseAsync(input);
    const output = await jsonPathTool(parsedInput);
    return jsonPathOutputType.parseAsync(output);
  },
});

const structureSecretSchema = z.object({});
const structureInputSchema = z.object({
  json: JsonInputSchema.meta({
    title: "JSON 内容",
    description: "JSON 字符串或已结构化的 JSON 对象/数组",
    toolDescription: "The JSON document to extract data from.",
  }),
  fields: z
    .array(
      z.object({
        name: z.string().meta({
          title: "字段名",
          description: "输出对象中的字段名",
        }),
        path: z.string().meta({
          title: "JSONPath 表达式",
          description: "字段取值的 JSONPath 表达式",
        }),
        multiple: z.boolean().optional().meta({
          title: "返回多个值",
          description: "开启后返回所有匹配值数组；关闭时返回第一个匹配值",
        }),
        defaultValue: JsonValueSchema.optional().meta({
          title: "默认值",
          description: "无匹配结果时使用的默认值",
        }),
      }),
    )
    .meta({
      title: "字段映射",
      description: "用 JSONPath 批量提取字段",
      toolDescription:
        "Field mapping list. Each item has a name and a JSONPath path.",
    }),
  includeMissing: z.boolean().optional().meta({
    title: "包含缺失字段",
    description: "缺失且没有默认值时，是否在输出对象中填入 null",
  }),
});
const structureOutputSchema = z.object({
  data: z.record(z.string(), z.unknown()).meta({
    title: "结构化结果",
    description: "按字段映射提取后的对象",
  }),
  missingFields: z.array(z.string()).meta({
    title: "缺失字段",
    description: "没有匹配且没有默认值的字段名",
  }),
  json: z.string().meta({
    title: "JSON 字符串",
    description: "结构化结果的 JSON 字符串表示",
  }),
});
const structureHandler = createToolHandler({
  inputSchema: structureInputSchema,
  outputSchema: structureOutputSchema,
  secretSchema: structureSecretSchema,
  handler: async (input) => {
    const parsedInput = await structureInputType.parseAsync(input);
    const output = await structureTool(parsedInput);
    return structureOutputType.parseAsync(output);
  },
});

const jsonPatchSecretSchema = z.object({});
const patchOperationSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("add"),
    path: z.string(),
    value: JsonValueSchema,
  }),
  z.object({
    op: z.literal("remove"),
    path: z.string(),
  }),
  z.object({
    op: z.literal("replace"),
    path: z.string(),
    value: JsonValueSchema,
  }),
  z.object({
    op: z.literal("move"),
    from: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal("copy"),
    from: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal("test"),
    path: z.string(),
    value: JsonValueSchema,
  }),
]);
const jsonPatchInputSchema = z.object({
  json: JsonInputSchema.meta({
    title: "JSON 内容",
    description: "待修改的 JSON 字符串或已结构化 JSON 对象/数组",
    toolDescription: "The JSON document to patch.",
  }),
  operations: z.union([z.array(patchOperationSchema), z.string()]).meta({
    title: "Patch 操作",
    description:
      "RFC 6902 JSON Patch 操作数组，支持 add/remove/replace/move/copy/test",
    toolDescription: "RFC 6902 JSON Patch operations array.",
  }),
  pretty: z.boolean().optional().meta({
    title: "格式化输出",
    description: "是否返回缩进后的 JSON 字符串",
  }),
});
const jsonPatchOutputSchema = z.object({
  result: JsonValueSchema.meta({
    title: "处理结果",
    description: "应用 Patch 后的 JSON 值",
  }),
  json: z.string().meta({
    title: "JSON 字符串",
    description: "应用 Patch 后的 JSON 字符串表示",
  }),
  appliedCount: z.number().meta({
    title: "已应用操作数",
  }),
});
const jsonPatchHandler = createToolHandler({
  inputSchema: jsonPatchInputSchema,
  outputSchema: jsonPatchOutputSchema,
  secretSchema: jsonPatchSecretSchema,
  handler: async (input) => {
    const parsedInput = await jsonPatchInputType.parseAsync(input);
    const output = await jsonPatchTool(parsedInput);
    return jsonPatchOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "jsonProcessor",
    name: {
      en: "JSON Processor",
      "zh-CN": "JSON 处理器",
    },
    description: {
      en: "Query, extract, and patch JSON data with JSONPath and JSON Patch.",
      "zh-CN": "使用 JSONPath 和 JSON Patch 查询、提取和修改 JSON 数据。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "JSON processing toolset for querying values with JSONPath, extracting structured fields, and applying RFC 6902 JSON Patch operations.",
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "jsonPath",
      name: {
        en: "JSONPath Query",
        "zh-CN": "JSONPath 查询",
      },
      description: {
        en: "Query JSON data using JSONPath expressions.",
        "zh-CN": "使用 JSONPath 表达式查询 JSON 数据。",
      },
      toolDescription:
        "Use JSONPath to query JSON values. Provide the JSON document and a JSONPath expression.",
      handler: jsonPathHandler,
    },
    {
      id: "structure",
      name: {
        en: "Structured Extraction",
        "zh-CN": "结构化提取",
      },
      description: {
        en: "Extract fields from JSON into a structured object.",
        "zh-CN": "按字段映射将 JSON 提取为结构化对象。",
      },
      toolDescription:
        "Extract a structured object from JSON using a list of field mappings with JSONPath expressions.",
      handler: structureHandler,
    },
    {
      id: "jsonPatch",
      name: {
        en: "JSON Patch",
        "zh-CN": "JSON Patch",
      },
      description: {
        en: "Apply RFC 6902 JSON Patch operations to JSON data.",
        "zh-CN": "对 JSON 数据应用 RFC 6902 JSON Patch 操作。",
      },
      toolDescription:
        "Apply RFC 6902 JSON Patch operations such as add, remove, replace, move, copy, and test.",
      handler: jsonPatchHandler,
    },
  ],
});

export default toolSet;
