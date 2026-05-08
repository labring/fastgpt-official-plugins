import { createToolHandler, defineTool } from '@fastgpt-plugin/sdk-factory';
import { InputType, OutputType, tool as toolCb } from './src';
import z from 'zod';

const secretSchema = z.object({});
const inputSchema = z.object({
  "content": z.string().meta({
    title: "content",
    description: "需要发送的消息",
    toolDescription: "需要发送的消息"
  }),
  "hook_url": z.string().meta({
    title: "hook_url",
    description: "飞书机器人地址"
  })
});
const outputSchema = z.object({
  "result": z.record(z.string(), z.unknown()).meta({
    title: "result"
  })
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput, ctx);
    return OutputType.parseAsync(output);
  }
});

const tool = defineTool({
  manifest: {
  "pluginId": "feishu",
  "name": {
    "en": "Feishu Webhook",
    "zh-CN": "飞书 webhook"
  },
  "description": {
    "en": "Send webhook request to Feishu bot.",
    "zh-CN": "向飞书机器人发起 webhook 请求。"
  },
  "version": "0.1.1",
  "versionDescription": {
    "en": "Default version",
    "zh-CN": "Default version"
  },
  "tags": [
    "communication"
  ]
},
  secretSchema,
  handler
});

export default tool;
