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
  webhookUrl: {
    type: z.string(),
    title: { en: "Webhook URL", "zh-CN": "钉钉机器人地址" },
    description: {
      en: "DingTalk group bot webhook URL.",
      "zh-CN": "钉钉群机器人的 webhook 地址。",
    },
    isToolParam: true,
  },
  secret: {
    type: z.string(),
    title: { en: "Signing secret", "zh-CN": "加签值" },
    description: {
      en: "Signing secret configured for the DingTalk bot.",
      "zh-CN": "钉钉机器人配置的加签值。",
    },
    isToolParam: true,
  },
  message: {
    type: z.string(),
    title: { en: "Message", "zh-CN": "发送的消息" },
    description: {
      en: "Message text to send to the group.",
      "zh-CN": "要发送到群聊的消息内容。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({});
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
      "zh-CN": "默认版本",
    },
    tags: ["communication"],
  },
  handler,
});

export default tool;
