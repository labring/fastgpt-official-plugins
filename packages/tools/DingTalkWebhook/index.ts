import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "webhookUrl": z.string().meta({
    title: "钉钉机器人地址"
  }),
  "secret": z.string().meta({
    title: "加签值",
    description: "钉钉机器人加签值"
  }),
  "message": z.string().meta({
    title: "发送的消息",
    description: "发送的消息",
    toolDescription: "发送的消息"
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
    pluginId: "DingTalkWebhook",
    name: {
      en: "DingTalk Webhook",
      "zh-CN": "钉钉 webhook",
    },
    description: {
      en: "Send a webhook request to DingTalk.",
      "zh-CN": "向钉钉机器人发起 webhook 请求。",
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
