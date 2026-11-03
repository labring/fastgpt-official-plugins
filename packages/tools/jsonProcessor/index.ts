import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
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
const jsonPathInputSchema = defineInputSchema({
  json: {
    type: JsonInputSchema,
    title: { en: "JSON document", "zh-CN": "JSON 内容" },
    description: {
      en: "JSON string or structured JSON object/array to query.",
      "zh-CN": "要查询的 JSON 字符串或已结构化的 JSON 对象/数组",
    },
    isToolParam: true,
  },
  path: {
    type: z.string(),
    title: { en: "JSONPath expression", "zh-CN": "JSONPath 表达式" },
    description: {
      en: "JSONPath query, e.g. $.items[*].name.",
      "zh-CN": "JSONPath 查询表达式，例如 $.store.book[*].title",
    },
    isToolParam: true,
  },
  resultType: {
    type: z
      .enum(["value", "path", "pointer", "parent", "parentProperty", "all"])
      .optional(),
    title: { en: "Result type", "zh-CN": "返回类型" },
    description: {
      en: "Defaults to matched values; can also return paths, JSON Pointers, or parent information.",
      "zh-CN": "默认返回匹配值，也可返回路径、JSON Pointer 或父节点信息",
    },
    isToolParam: true,
  },
  flatten: {
    type: z.boolean().optional(),
    title: { en: "Flatten results", "zh-CN": "展开结果" },
    description: {
      en: "Whether to flatten nested array results.",
      "zh-CN": "是否展开嵌套数组结果",
    },
    isToolParam: true,
  },
});
const jsonPathOutputSchema = defineOutputSchema({
  matches: {
    type: z.array(z.unknown()),
    title: { en: "Matches", "zh-CN": "匹配结果" },
    description: {
      en: "Array of values matched by the JSONPath expression.",
      "zh-CN": "JSONPath 匹配到的结果数组",
    },
  },
  first: {
    type: z.unknown().nullable(),
    title: { en: "First match", "zh-CN": "首个匹配" },
    description: {
      en: "First matched value, or null when there are no matches.",
      "zh-CN": "第一个匹配值；没有匹配时为 null",
    },
  },
  count: {
    type: z.number(),
    title: { en: "Match count", "zh-CN": "匹配数量" },
    description: {
      en: "Number of matching values.",
      "zh-CN": "匹配到的值的数量",
    },
  },
  json: {
    type: z.string(),
    title: { en: "JSON string", "zh-CN": "JSON 字符串" },
    description: {
      en: "JSON string representation of the matched results.",
      "zh-CN": "匹配结果的 JSON 字符串表示",
    },
  },
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
const structureFieldSchema = defineInputSchema({
  name: {
    type: z.string(),
    title: { en: "Field name", "zh-CN": "字段名" },
    description: {
      en: "Property name in the output object.",
      "zh-CN": "输出对象中的字段名",
    },
    isToolParam: true,
  },
  path: {
    type: z.string(),
    title: { en: "JSONPath expression", "zh-CN": "JSONPath 表达式" },
    description: {
      en: "JSONPath used to select this field's value.",
      "zh-CN": "用于选择此字段值的 JSONPath 表达式",
    },
    isToolParam: true,
  },
  multiple: {
    type: z.boolean().optional(),
    title: { en: "Return multiple values", "zh-CN": "返回多个值" },
    description: {
      en: "Return all matches as an array instead of only the first match.",
      "zh-CN": "开启后返回所有匹配值数组；关闭时仅返回第一个匹配值",
    },
    isToolParam: true,
  },
  defaultValue: {
    type: JsonValueSchema.optional(),
    title: { en: "Default value", "zh-CN": "默认值" },
    description: {
      en: "Value to use when there are no matches.",
      "zh-CN": "无匹配结果时使用的默认值",
    },
    isToolParam: true,
  },
});
const structureInputSchema = defineInputSchema({
  json: {
    type: JsonInputSchema,
    title: { en: "JSON document", "zh-CN": "JSON 内容" },
    description: {
      en: "JSON string or structured JSON object/array to extract data from.",
      "zh-CN": "要提取数据的 JSON 字符串或已结构化的 JSON 对象/数组",
    },
    isToolParam: true,
  },
  fields: {
    type: z.array(structureFieldSchema),
    title: { en: "Field mappings", "zh-CN": "字段映射" },
    description: {
      en: "List of fields to extract; each item specifies a name and JSONPath.",
      "zh-CN": "用 JSONPath 批量提取字段；每项指定字段名和 JSONPath 路径",
    },
    isToolParam: true,
  },
  includeMissing: {
    type: z.boolean().optional(),
    title: { en: "Include missing fields", "zh-CN": "包含缺失字段" },
    description: {
      en: "Include null in the output for unmatched fields without a default.",
      "zh-CN": "缺失且没有默认值时，是否在输出对象中填入 null",
    },
    isToolParam: true,
  },
});
const structureOutputSchema = defineOutputSchema({
  data: {
    type: z.record(z.string(), z.unknown()),
    title: { en: "Structured data", "zh-CN": "结构化结果" },
    description: {
      en: "Object containing values extracted according to the field mappings.",
      "zh-CN": "按字段映射提取后的对象",
    },
  },
  missingFields: {
    type: z.array(z.string()),
    title: { en: "Missing fields", "zh-CN": "缺失字段" },
    description: {
      en: "Field names with no match and no default value.",
      "zh-CN": "没有匹配且没有默认值的字段名",
    },
  },
  json: {
    type: z.string(),
    title: { en: "JSON string", "zh-CN": "JSON 字符串" },
    description: {
      en: "JSON string representation of the structured result.",
      "zh-CN": "结构化结果的 JSON 字符串表示",
    },
  },
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
const patchOpField = {
  type: z.literal("add"),
  title: { en: "Operation", "zh-CN": "操作类型" },
  description: {
    en: "JSON Patch operation to perform.",
    "zh-CN": "要执行的 JSON Patch 操作类型",
  },
  isToolParam: true,
};
const patchPathField = {
  type: z.string(),
  title: { en: "JSON Pointer path", "zh-CN": "JSON Pointer 路径" },
  description: {
    en: "Target location as a JSON Pointer.",
    "zh-CN": "作为 JSON Pointer 的目标位置",
  },
  isToolParam: true,
};
const patchValueField = {
  type: JsonValueSchema,
  title: { en: "Value", "zh-CN": "值" },
  description: {
    en: "JSON value for the operation.",
    "zh-CN": "该操作使用的 JSON 值",
  },
  isToolParam: true,
};
const patchOperationSchema = z.discriminatedUnion("op", [
  defineInputSchema({
    op: patchOpField,
    path: patchPathField,
    value: patchValueField,
  }),
  defineInputSchema({
    op: { ...patchOpField, type: z.literal("remove") },
    path: patchPathField,
  }),
  defineInputSchema({
    op: { ...patchOpField, type: z.literal("replace") },
    path: patchPathField,
    value: patchValueField,
  }),
  defineInputSchema({
    op: { ...patchOpField, type: z.literal("move") },
    from: {
      type: z.string(),
      title: { en: "Source path", "zh-CN": "源路径" },
      description: {
        en: "Source location as a JSON Pointer.",
        "zh-CN": "作为 JSON Pointer 的源位置",
      },
      isToolParam: true,
    },
    path: patchPathField,
  }),
  defineInputSchema({
    op: { ...patchOpField, type: z.literal("copy") },
    from: {
      type: z.string(),
      title: { en: "Source path", "zh-CN": "源路径" },
      description: {
        en: "Source location as a JSON Pointer.",
        "zh-CN": "作为 JSON Pointer 的源位置",
      },
      isToolParam: true,
    },
    path: patchPathField,
  }),
  defineInputSchema({
    op: { ...patchOpField, type: z.literal("test") },
    path: patchPathField,
    value: patchValueField,
  }),
]);
const jsonPatchInputSchema = defineInputSchema({
  json: {
    type: JsonInputSchema,
    title: { en: "JSON document", "zh-CN": "JSON 内容" },
    description: {
      en: "JSON string or structured JSON object/array to modify.",
      "zh-CN": "待修改的 JSON 字符串或已结构化 JSON 对象/数组",
    },
    isToolParam: true,
  },
  operations: {
    type: z.union([z.array(patchOperationSchema), z.string()]),
    title: { en: "Patch operations", "zh-CN": "Patch 操作" },
    description: {
      en: "RFC 6902 JSON Patch operation array supporting add, remove, replace, move, copy, and test.",
      "zh-CN":
        "RFC 6902 JSON Patch 操作数组，支持 add、remove、replace、move、copy、test",
    },
    isToolParam: true,
  },
  pretty: {
    type: z.boolean().optional(),
    title: { en: "Pretty-print output", "zh-CN": "格式化输出" },
    description: {
      en: "Whether to return an indented JSON string.",
      "zh-CN": "是否返回缩进后的 JSON 字符串",
    },
    isToolParam: true,
  },
});
const jsonPatchOutputSchema = defineOutputSchema({
  result: {
    type: JsonValueSchema,
    title: { en: "Patched result", "zh-CN": "处理结果" },
    description: {
      en: "JSON value after applying the patch.",
      "zh-CN": "应用 Patch 后的 JSON 值",
    },
  },
  json: {
    type: z.string(),
    title: { en: "JSON string", "zh-CN": "JSON 字符串" },
    description: {
      en: "JSON string representation after applying the patch.",
      "zh-CN": "应用 Patch 后的 JSON 字符串表示",
    },
  },
  appliedCount: {
    type: z.number(),
    title: { en: "Applied operation count", "zh-CN": "已应用操作数" },
    description: {
      en: "Number of patch operations applied.",
      "zh-CN": "已应用的 Patch 操作数量",
    },
  },
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
      en: "Query JSONPath values, extract structured fields, and apply RFC 6902 JSON Patch operations.",
      "zh-CN":
        "查询 JSONPath 值、提取结构化字段，并应用 RFC 6902 JSON Patch 操作。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
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
        en: "Query JSON values using a JSONPath expression and JSON document.",
        "zh-CN": "提供 JSON 文档和 JSONPath 表达式来查询 JSON 值。",
      },
      handler: jsonPathHandler,
    },
    {
      id: "structure",
      name: {
        en: "Structured Extraction",
        "zh-CN": "结构化提取",
      },
      description: {
        en: "Extract a structured object from JSON using field mappings with JSONPath expressions.",
        "zh-CN": "使用 JSONPath 字段映射从 JSON 中提取结构化对象。",
      },
      handler: structureHandler,
    },
    {
      id: "jsonPatch",
      name: {
        en: "JSON Patch",
        "zh-CN": "JSON Patch",
      },
      description: {
        en: "Apply RFC 6902 JSON Patch operations including add, remove, replace, move, copy, and test.",
        "zh-CN":
          "对 JSON 数据应用 RFC 6902 JSON Patch 操作，包括 add、remove、replace、move、copy 和 test。",
      },
      handler: jsonPatchHandler,
    },
  ],
});

export default toolSet;
