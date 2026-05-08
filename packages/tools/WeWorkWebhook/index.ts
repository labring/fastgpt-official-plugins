import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "webhookUrl": z.string().optional().meta({
    title: "企微机器人地址"
  }),
  "message": z.string().optional().meta({
    title: "发送的消息"
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
    pluginId: "WeWorkWebhook",
    name: {
      en: "WeWork Webhook",
      "zh-CN": "企业微信 webhook",
    },
    description: {
      en: "Send webhook requests to WeWork robots. Only internal groups can use this tool.",
      "zh-CN": "向企业微信机器人发起 webhook 请求。只能内部群使用。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    tags: ["communication"],
  },
  secretSchema,
  handler,
});

export default tool;
