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
  content: {
    type: z.string(),
    title: { en: "Message content", "zh-CN": "消息内容" },
    description: {
      en: "Message to send to the Feishu bot.",
      "zh-CN": "需要发送的消息。",
    },
    isToolParam: true,
  },
  hook_url: {
    type: z.string(),
    title: { en: "Webhook URL", "zh-CN": "机器人 Webhook 地址" },
    description: { en: "Feishu bot webhook URL.", "zh-CN": "飞书机器人地址。" },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  result: {
    type: z.record(z.string(), z.unknown()),
    title: { en: "Result", "zh-CN": "结果" },
    description: {
      en: "Response returned by the Feishu bot.",
      "zh-CN": "飞书机器人返回的结果。",
    },
  },
});

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
    pluginId: "feishu",
    name: {
      en: "Feishu Webhook",
      "zh-CN": "飞书 webhook",
    },
    description: {
      en: "Send webhook request to Feishu bot.",
      "zh-CN": "向飞书机器人发起 webhook 请求。",
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
