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
    type: z.string().optional(),
    title: { en: "Webhook URL", "zh-CN": "企微机器人地址" },
    description: {
      en: "WeCom group bot webhook URL.",
      "zh-CN": "企业微信群机器人的 webhook 地址。",
    },
    isToolParam: true,
  },
  message: {
    type: z.string().optional(),
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
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput);
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
      "zh-CN": "默认版本",
    },
    tags: ["communication"],
  },
  handler,
});

export default tool;
