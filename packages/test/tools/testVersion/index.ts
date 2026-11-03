import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";

const inputSchema = defineInputSchema({
  delay: {
    type: z.number(),
    title: { en: "Delay (ms)", "zh-CN": "延迟时间（毫秒）" },
    description: {
      en: "Time to wait before returning, in milliseconds.",
      "zh-CN": "返回结果前等待的时间，单位为毫秒。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({});
const inputSchemaV3 = defineInputSchema({
  delay: {
    type: z.number(),
    title: { en: "Delay (ms)", "zh-CN": "延迟时间（毫秒）" },
    description: {
      en: "Time to wait before returning, in milliseconds.",
      "zh-CN": "返回结果前等待的时间，单位为毫秒。",
    },
    isToolParam: true,
  },
  msg: {
    type: z.string(),
    title: { en: "Message", "zh-CN": "消息" },
    description: {
      en: "Message text to include in the version 3 response.",
      "zh-CN": "要包含在版本 3 响应中的消息文本。",
    },
    isToolParam: true,
  },
});
const outputSchemaV3 = defineOutputSchema({
  msg: {
    type: z.string(),
    title: { en: "Response message", "zh-CN": "响应消息" },
    description: {
      en: "Message returned by version 3, prefixed with its version marker.",
      "zh-CN": "版本 3 返回的消息，前面带有版本标记。",
    },
  },
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  handler: async (input, _ctx) => {
    await new Promise((resolve) => setTimeout(resolve, input.delay));
    return {};
  },
});

const handlerV3 = createToolHandler({
  inputSchema: inputSchemaV3,
  outputSchema: outputSchemaV3,
  handler: async (input, _ctx) => {
    await new Promise((resolve) => setTimeout(resolve, input.delay));
    return {
      msg: "from test v3" + input.msg,
    };
  },
});

const tool = defineTool({
  manifest: {
    description: {
      en: "Test Version 1.0.0",
      "zh-CN": "测试版本 1.0.0",
    },
    name: {
      en: "Test Version",
      "zh-CN": "测试版本工具",
    },
    pluginId: "testVersion",
    version: "1.0.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
  },
  handler,
});
const tool2 = defineTool({
  manifest: {
    description: {
      en: "Test Version 2.0.0",
      "zh-CN": "测试版本 2.0.0",
    },
    name: {
      en: "Test Version",
      "zh-CN": "测试版本工具",
    },
    pluginId: "testVersion",
    version: "2.0.0",
    versionDescription: {
      en: "v2",
      "zh-CN": "v2",
    },
  },
  handler,
});

const tool3 = defineTool({
  manifest: {
    description: {
      en: "Test Version 3.0.0",
      "zh-CN": "测试版本 3.0.0",
    },
    name: {
      en: "Test Version v3",
      "zh-CN": "测试版本工具v3",
    },
    pluginId: "testVersion",
    version: "3.0.0",
    versionDescription: {
      en: "v3",
      "zh-CN": "v3",
    },
  },
  handler: handlerV3,
});

// export default tool2;
// export default tool;
export default tool3;
