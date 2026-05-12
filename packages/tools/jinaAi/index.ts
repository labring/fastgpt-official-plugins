import { createToolHandler, defineToolSet } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import { InputType as jinaAiReaderInputType, OutputType as jinaAiReaderOutputType, tool as jinaAiReaderTool } from './children/jinaAiReader';
import { InputType as jinaAiSearchInputType, OutputType as jinaAiSearchOutputType, tool as jinaAiSearchTool } from './children/jinaAiSearch';

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "Jina AI API密钥",
    description: "Jina AI API密钥，格式：jina_xxxxxxxxxxxxxxxx"
  })
});

const jinaAiReaderSecretSchema = z.object({});
const jinaAiReaderInputSchema = z.object({
  "url": z.string().meta({
    title: "目标网页",
    description: "需要解析的网页URL地址",
    toolDescription: "需要解析的网页URL地址"
  }),
  "returnFormat": z.enum(["default","markdown","html","text","screenshot","pageshot"]).optional().meta({
    title: "输出格式",
    description: "指定内容返回的格式类型"
  })
});
const jinaAiReaderOutputSchema = z.object({
  "title": z.string().meta({
    title: "页面标题",
    description: "网页的标题信息"
  }),
  "description": z.string().meta({
    title: "页面描述",
    description: "网页的描述信息"
  }),
  "content": z.string().meta({
    title: "页面内容",
    description: "网页的主要内容"
  })
});

const jinaAiReaderHandler = createToolHandler({
  inputSchema: jinaAiReaderInputSchema,
  outputSchema: jinaAiReaderOutputSchema,
  secretSchema: jinaAiReaderSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await jinaAiReaderInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await jinaAiReaderTool(parsedInput, ctx);
    return jinaAiReaderOutputType.parseAsync(output);
  }
});

const jinaAiSearchSecretSchema = z.object({});
const jinaAiSearchInputSchema = z.object({
  "query": z.string().meta({
    title: "搜索关键词",
    description: "要搜索的关键词或查询语句",
    toolDescription: "搜索关键词"
  }),
  "country": z.enum(["CN","US","GB","JP","KR","FR"]).optional().meta({
    title: "搜索地区",
    description: "指定搜索的国家或地区",
    toolDescription: "搜索地区代码"
  }),
  "language": z.enum(["zh-cn","en","ja","ko","fr"]).optional().meta({
    title: "搜索语言",
    description: "指定搜索所用的语言",
    toolDescription: "搜索语言代码"
  }),
  "readFullContent": z.boolean().optional().meta({
    title: "读取完整内容",
    description: "是否访问搜索结果中的每个URL并返回完整内容",
    toolDescription: "是否读取SERP的完整内容"
  })
});
const jinaAiSearchOutputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "Jina AI 搜索返回的结构化数据: {\n  title: string;\n  url: string;\n  description: string;\n  content?: string;\n}[]"
  })
});

const jinaAiSearchHandler = createToolHandler({
  inputSchema: jinaAiSearchInputSchema,
  outputSchema: jinaAiSearchOutputSchema,
  secretSchema: jinaAiSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await jinaAiSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await jinaAiSearchTool(parsedInput, ctx);
    return jinaAiSearchOutputType.parseAsync(output);
  }
});

const toolSet = defineToolSet({
  manifest: {
  "pluginId": "jinaAi",
  "name": {
    "en": "Jina AI Tool Set",
    "zh-CN": "Jina AI 工具集"
  },
  "description": {
    "en": "Jina AI intelligent search and web content extraction tool set, including search engine and web reader functionality",
    "zh-CN": "Jina AI 提供的智能搜索和网页内容提取工具集，包含搜索引擎和网页阅读器功能"
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
      id: "jinaAiReader",
      name: {
  "en": "Jina AI Web Parser",
  "zh-CN": "Jina AI 网页解析"
},
      description: {
  "en": "Intelligent web content parsing powered by Jina AI Reader with multiple output formats",
  "zh-CN": "基于 Jina AI Reader 的智能网页内容解析工具，支持多种格式输出"
},
      handler: jinaAiReaderHandler
    },
    {
      id: "jinaAiSearch",
      name: {
  "en": "Jina AI Search",
  "zh-CN": "Jina AI 搜索"
},
      description: {
  "en": "Intelligent web search powered by Jina AI search engine with multi-language and region support",
  "zh-CN": "基于 Jina AI 搜索引擎的智能网络搜索工具，支持多语言和地区定制"
},
      handler: jinaAiSearchHandler
    }
  ]
});

export default toolSet;
