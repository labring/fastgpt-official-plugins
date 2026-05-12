import { createToolHandler, defineToolSet } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import { InputType as baiduSearchInputType, OutputType as baiduSearchOutputType, tool as baiduSearchTool } from './children/baiduSearch';
import { InputType as googleImagesSearchInputType, OutputType as googleImagesSearchOutputType, tool as googleImagesSearchTool } from './children/googleImagesSearch';
import { InputType as googleNewsSearchInputType, OutputType as googleNewsSearchOutputType, tool as googleNewsSearchTool } from './children/googleNewsSearch';
import { InputType as googleSearchInputType, OutputType as googleSearchOutputType, tool as googleSearchTool } from './children/googleSearch';
import { InputType as googleVideosSearchInputType, OutputType as googleVideosSearchOutputType, tool as googleVideosSearchTool } from './children/googleVideosSearch';

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "Search API Key"
  })
});

const baiduSearchSecretSchema = z.object({});
const baiduSearchInputSchema = z.object({
  "q": z.string().meta({
    title: "搜索关键词",
    toolDescription: "搜索关键词"
  }),
  "num": z.number().optional().meta({
    title: "最大搜索数量"
  })
});
const baiduSearchOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "搜索结果"
  })
});

const baiduSearchHandler = createToolHandler({
  inputSchema: baiduSearchInputSchema,
  outputSchema: baiduSearchOutputSchema,
  secretSchema: baiduSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await baiduSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await baiduSearchTool(parsedInput, ctx);
    return baiduSearchOutputType.parseAsync(output);
  }
});

const googleImagesSearchSecretSchema = z.object({});
const googleImagesSearchInputSchema = z.object({
  "q": z.string().meta({
    title: "搜索关键词",
    toolDescription: "搜索关键词"
  }),
  "num": z.number().optional().meta({
    title: "最大搜索数量"
  }),
  "time_period": z.enum(["last_hour","last_day","last_month","last_week","last_year"]).optional().meta({
    title: "搜索日期范围"
  })
});
const googleImagesSearchOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "搜索结果"
  })
});

const googleImagesSearchHandler = createToolHandler({
  inputSchema: googleImagesSearchInputSchema,
  outputSchema: googleImagesSearchOutputSchema,
  secretSchema: googleImagesSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleImagesSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await googleImagesSearchTool(parsedInput, ctx);
    return googleImagesSearchOutputType.parseAsync(output);
  }
});

const googleNewsSearchSecretSchema = z.object({});
const googleNewsSearchInputSchema = z.object({
  "q": z.string().meta({
    title: "搜索关键词",
    toolDescription: "搜索关键词"
  }),
  "num": z.number().optional().meta({
    title: "最大搜索数量"
  }),
  "time_period": z.enum(["last_hour","last_day","last_month","last_week","last_year"]).optional().meta({
    title: "搜索日期范围"
  })
});
const googleNewsSearchOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "搜索结果"
  })
});

const googleNewsSearchHandler = createToolHandler({
  inputSchema: googleNewsSearchInputSchema,
  outputSchema: googleNewsSearchOutputSchema,
  secretSchema: googleNewsSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleNewsSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await googleNewsSearchTool(parsedInput, ctx);
    return googleNewsSearchOutputType.parseAsync(output);
  }
});

const googleSearchSecretSchema = z.object({});
const googleSearchInputSchema = z.object({
  "q": z.string().meta({
    title: "搜索关键词",
    toolDescription: "搜索关键词"
  }),
  "num": z.number().optional().meta({
    title: "最大搜索数量"
  }),
  "time_period": z.enum(["last_hour","last_day","last_month","last_week","last_year"]).optional().meta({
    title: "搜索日期范围"
  })
});
const googleSearchOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "搜索结果"
  })
});

const googleSearchHandler = createToolHandler({
  inputSchema: googleSearchInputSchema,
  outputSchema: googleSearchOutputSchema,
  secretSchema: googleSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await googleSearchTool(parsedInput, ctx);
    return googleSearchOutputType.parseAsync(output);
  }
});

const googleVideosSearchSecretSchema = z.object({});
const googleVideosSearchInputSchema = z.object({
  "q": z.string().meta({
    title: "搜索关键词",
    toolDescription: "搜索关键词"
  }),
  "num": z.number().optional().meta({
    title: "最大搜索数量"
  }),
  "time_period": z.enum(["last_hour","last_day","last_month","last_week","last_year"]).optional().meta({
    title: "搜索日期范围"
  })
});
const googleVideosSearchOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "搜索结果"
  })
});

const googleVideosSearchHandler = createToolHandler({
  inputSchema: googleVideosSearchInputSchema,
  outputSchema: googleVideosSearchOutputSchema,
  secretSchema: googleVideosSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await googleVideosSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await googleVideosSearchTool(parsedInput, ctx);
    return googleVideosSearchOutputType.parseAsync(output);
  }
});

const toolSet = defineToolSet({
  manifest: {
  "pluginId": "searchApi",
  "name": {
    "en": "SearchApi",
    "zh-CN": "SearchApi"
  },
  "description": {
    "en": "SearchApi Service",
    "zh-CN": "SearchApi 服务"
  },
  "version": "0.0.1",
  "versionDescription": {
    "en": "Initial version",
    "zh-CN": "Initial version"
  },
  "tags": [
    "search"
  ]
},
  secretSchema,
  children: [
    {
      id: "baiduSearch",
      name: {
  "en": "Baidu Search",
  "zh-CN": "百度搜索"
},
      description: {
  "en": "Call Baidu search",
  "zh-CN": "调用百度搜索"
},
      handler: baiduSearchHandler
    },
    {
      id: "googleImagesSearch",
      name: {
  "en": "Google Search",
  "zh-CN": "Google 图片搜索"
},
      description: {
  "en": "Call Google images search",
  "zh-CN": "调用 Google 图片搜索"
},
      handler: googleImagesSearchHandler
    },
    {
      id: "googleNewsSearch",
      name: {
  "en": "Google News Search",
  "zh-CN": "Google 新闻搜索"
},
      description: {
  "en": "Call Google news search",
  "zh-CN": "调用 Google 新闻搜索"
},
      handler: googleNewsSearchHandler
    },
    {
      id: "googleSearch",
      name: {
  "en": "Google Search",
  "zh-CN": "Google 搜索"
},
      description: {
  "en": "Call Google search",
  "zh-CN": "调用 Google 搜索"
},
      handler: googleSearchHandler
    },
    {
      id: "googleVideosSearch",
      name: {
  "en": "Google Videos Search",
  "zh-CN": "Google 视频搜索"
},
      description: {
  "en": "Call Google videos search",
  "zh-CN": "调用 Google 视频搜索"
},
      handler: googleVideosSearchHandler
    }
  ]
});

export default toolSet;
