import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});
const inputSchema = defineInputSchema({
  text: {
    type: z.string(),
    title: { en: "Text", "zh-CN": "文本内容" },
    description: {
      en: "Text to extract content from using a regular expression.",
      "zh-CN": "需要使用正则表达式提取内容的文本。",
    },
    isToolParam: true,
  },
  pattern: {
    type: z.string(),
    title: { en: "Regular Expression", "zh-CN": "正则表达式" },
    description: {
      en: "JavaScript regular expression without the surrounding slashes. Use this pattern to extract text.",
      "zh-CN": "用于提取文本的 JavaScript 正则表达式，不需要包含前后的斜杠。",
    },
    isToolParam: true,
  },
  flags: {
    type: z.string().optional(),
    title: { en: "Regex Flags", "zh-CN": "正则标志" },
    description: {
      en: "Optional regular expression flags; supports gimsuyd. The global flag g is enabled automatically.",
      "zh-CN": "可选的正则标志，支持 gimsuyd；会自动启用全局标志 g。",
    },
    isToolParam: true,
  },
  group: {
    type: z.union([z.string(), z.number()]).optional(),
    title: { en: "Capture Group", "zh-CN": "提取分组" },
    description: {
      en: "Optional capture group to return, specified by number (such as 1) or name (such as email).",
      "zh-CN": "可选的捕获分组，可用数字（例如 1）或名称（例如 email）指定。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  matches: {
    type: z.array(z.string()),
    title: { en: "Matches", "zh-CN": "匹配结果" },
    description: {
      en: "List of values extracted by the regular expression.",
      "zh-CN": "正则表达式提取到的内容列表。",
    },
  },
  firstMatch: {
    type: z.string().optional(),
    title: { en: "First Match", "zh-CN": "首个匹配结果" },
    description: {
      en: "First value extracted by the regular expression, if any.",
      "zh-CN": "正则表达式提取到的第一条内容（如果存在）。",
    },
  },
  count: {
    type: z.number(),
    title: { en: "Match Count", "zh-CN": "匹配数量" },
    description: {
      en: "Number of extracted values.",
      "zh-CN": "提取到的内容数量。",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error Message", "zh-CN": "错误信息" },
    description: {
      en: "Error details returned when the regular expression or capture group is invalid.",
      "zh-CN": "正则表达式或捕获分组无效时返回的错误信息。",
    },
  },
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
      en: "Initial release",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
