import {
  createToolHandler,
  defineTool,
  type InputSchemaMetaType,
  type OutputSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});
const inputSchema = z.object({
  text: z.string().meta({
    title: "文本内容",
    description: "需要被正则表达式提取的文本内容",
    toolDescription: "需要被正则表达式提取的文本内容",
  } satisfies InputSchemaMetaType),
  pattern: z.string().meta({
    title: "正则表达式",
    description: "JavaScript 正则表达式内容，不需要包含前后的 /",
    toolDescription:
      "用于提取文本内容的 JavaScript 正则表达式，不需要包含前后的 /",
  } satisfies InputSchemaMetaType),
  flags: z
    .string()
    .optional()
    .meta({
      title: "正则标志",
      description: "可选的正则标志，支持 gimsuyd；g 会自动启用",
      toolDescription: "可选的正则标志，例如 i、m、s；g 会自动启用",
    } satisfies InputSchemaMetaType),
  group: z
    .union([z.string(), z.number()])
    .optional()
    .meta({
      title: "提取分组",
      description: "可选的捕获分组，支持数字分组或命名分组",
      toolDescription: "可选的捕获分组，支持数字分组如 1，或命名分组如 email",
    } satisfies InputSchemaMetaType),
});
const outputSchema = z.object({
  matches: z.array(z.string()).meta({
    title: "匹配结果",
    description: "正则表达式提取到的内容列表",
  } satisfies OutputSchemaMetaType),
  firstMatch: z
    .string()
    .optional()
    .meta({
      title: "首个匹配结果",
      description: "正则表达式提取到的第一条内容",
    } satisfies OutputSchemaMetaType),
  count: z.number().meta({
    title: "匹配数量",
    description: "正则表达式提取到的内容数量",
  } satisfies OutputSchemaMetaType),
  error: z
    .string()
    .optional()
    .meta({
      title: "错误信息",
      description: "正则表达式无效或分组无效时返回的错误信息",
    } satisfies OutputSchemaMetaType),
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "regexExtract",
    name: {
      en: "Regex Extract",
      "zh-CN": "正则表达式提取",
    },
    description: {
      en: "Extract text content with JavaScript regular expressions.",
      "zh-CN": "使用 JavaScript 正则表达式抽取文本内容。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
