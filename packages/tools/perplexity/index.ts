import { createToolHandler, defineToolSet } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import { InputType as findResultsInputType, OutputType as findResultsOutputType, tool as findResultsTool } from './children/findResults';

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "API Key",
    description: "可以在 Perplexity 获取",
    isSecret: true,
  })
});

const findResultsSecretSchema = z.object({});
const findResultsInputSchema = z.object({
  "query": z.string().meta({
    title: "查询词"
  }),
  "max_results": z.number().optional().meta({
    title: "最大查询量"
  })
});
const findResultsOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "搜索结果"
  })
});

const findResultsHandler = createToolHandler({
  inputSchema: findResultsInputSchema,
  outputSchema: findResultsOutputSchema,
  secretSchema: findResultsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await findResultsInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await findResultsTool(parsedInput, ctx);
    return findResultsOutputType.parseAsync(output);
  }
});

const toolSet = defineToolSet({
  manifest: {
  "pluginId": "perplexity",
  "name": {
    "en": "Perplexity Tool Set",
    "zh-CN": "Perplexity 工具集"
  },
  "description": {
    "en": "This is a Perplexity tool set",
    "zh-CN": "这是一个 Perplexity 工具集"
  },
  "version": "0.0.1",
  "versionDescription": {
    "en": "Initial version",
    "zh-CN": "Initial version"
  },
  "tags": [
    "tools"
  ]
},
  secretSchema,
  children: [
    {
      id: "findResults",
      name: {
  "en": "Network search",
  "zh-CN": "网络搜索"
},
      description: {
  "en": "Use Perplexity to search the web",
  "zh-CN": "使用 Perplexity 进行网络搜索"
},
      toolDescription: "使用 Perplexity 进行网络搜索",
      handler: findResultsHandler
    }
  ]
});

export default toolSet;
