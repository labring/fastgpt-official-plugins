import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "ms": z.number().optional().meta({
    title: "延迟时长(毫秒)"
  })
});
const outputSchema = z.object({});
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
    pluginId: "delay",
    name: {
      en: "Delay",
      "zh-CN": "流程等待",
    },
    description: {
      en: "Delay the workflow after a specified time",
      "zh-CN": "让工作流等待指定时间后运行",
    },
    version: "1.0",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    tags: ["tools"],
  },
  secretSchema,
  handler,
});

export default tool;
