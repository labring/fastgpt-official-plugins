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
  ms: {
    type: z.number().optional(),
    title: { en: "Delay duration (milliseconds)", "zh-CN": "延迟时长（毫秒）" },
    description: {
      en: "Optional workflow delay duration in milliseconds.",
      "zh-CN": "可选的工作流延迟时长，单位为毫秒。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({});
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
      "zh-CN": "默认版本",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
