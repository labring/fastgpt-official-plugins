import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});
const inputSchema = defineInputSchema({});
const outputSchema = defineOutputSchema({
  time: {
    type: z.string(),
    title: { en: "Current time", "zh-CN": "时间" },
    description: { en: "The current time.", "zh-CN": "当前时间。" },
  },
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
    pluginId: "getTime",
    name: {
      en: "Get current time",
      "zh-CN": "获取当前时间",
    },
    description: {
      en: "Get current time",
      "zh-CN": "获取当前时间",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
