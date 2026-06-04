import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "expr": z.string().meta({
    title: "数学表达式",
    description: "需要执行的数学表达式",
    toolDescription: "需要执行的数学表达式"
  })
});
const outputSchema = z.object({
  "result": z.string().meta({
    title: "result",
    description: "返回的数学表达式结果"
  })
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput, ctx);
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
      "zh-CN": "Default version",
    },
    tags: ["scientific"],
  },
  secretSchema,
  handler,
});

export default tool;
