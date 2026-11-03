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
  expr: {
    type: z.string(),
    title: { en: "Math expression", "zh-CN": "数学表达式" },
    description: {
      en: "Mathematical expression to evaluate.",
      "zh-CN": "需要执行的数学表达式",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.union([z.string(), z.number()]),
    title: { en: "Result", "zh-CN": "计算结果" },
    description: {
      en: "Result of the evaluated expression.",
      "zh-CN": "数学表达式的计算结果",
    },
  },
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "mathExprVal",
    name: {
      en: "Mathematical Expression Execution",
      "zh-CN": "数学公式执行",
    },
    description: {
      en: "A tool for executing mathematical expressions using the expr-eval library in js to return the result.",
      "zh-CN":
        "用于执行数学表达式的工具，通过 js 的 expr-eval 库运行表达式并返回结果。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["scientific"],
  },
  handler,
});

export default tool;
