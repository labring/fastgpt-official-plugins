import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import z from "zod";

const handler = createToolHandler({
  inputSchema: z.object({
    delay: z.number(),
  }),
  outputSchema: z.object({}),
  handler: async (input, _ctx) => {
    await new Promise((resolve) => setTimeout(resolve, input.delay));
    return {};
  },
});

const handlerV3 = createToolHandler({
  inputSchema: z.object({
    delay: z.number(),
    msg: z.string(),
  }),
  outputSchema: z.object({
    msg: z.string(),
  }),
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
