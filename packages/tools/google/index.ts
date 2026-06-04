import { createToolHandler, defineTool } from '@fastgpt-plugin/sdk-factory';
import { InputType, OutputType, tool as toolCb } from './src';
import z from 'zod';

const secretSchema = z.object({
  "key": z.string().meta({
    title: "key",
    description: "Google搜索key",
    isSecret: true,
  }),
  "cx": z.string().meta({
    title: "cx",
    description: "Google搜索cxID"
  })
});
const inputSchema = z.object({
  "query": z.string().meta({
    title: "query",
    description: "查询字段值",
    toolDescription: "查询字段值"
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
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await toolCb(parsedInput, ctx);
    return OutputType.parseAsync(output);
  }
});

const tool = defineTool({
  manifest: {
  "pluginId": "google",
  "name": {
    "en": "Google search",
    "zh-CN": "Google 搜索"
  },
  "description": {
    "en": "Search in Google",
    "zh-CN": "在 Google 中搜索"
  },
  "version": "0.1.1",
  "versionDescription": {
    "en": "Default version",
    "zh-CN": "Default version"
  },
  "tags": [
    "search"
  ]
},
  secretSchema,
  handler
});

export default tool;
