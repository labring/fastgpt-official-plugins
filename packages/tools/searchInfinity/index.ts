import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({
  "apiKey": z.string().optional().meta({
    title: "API密钥",
    description: "SearchInfinity API密钥，与火山引擎Access Key和Secret Key二选一，获取链接https://console.volcengine.com/ask-echo/web-search",
    isSecret: true,
  }),
  "volcengineAccessKey": z.string().optional().meta({
    title: "火山引擎Access Key",
    description: "火山引擎Access Key，用于火山引擎认证方式，与API密钥二选一",
    isSecret: true,
  }),
  "volcengineSecretKey": z.string().optional().meta({
    title: "火山引擎Secret Key",
    description: "火山引擎Secret Key，用于火山引擎认证方式，与API密钥二选一",
    isSecret: true,
  })
});
const inputSchema = z.object({
  "query": z.string().meta({
    title: "搜索查询词",
    description: "搜索查询词",
    toolDescription: "搜索查询词"
  }),
  "count": z.number().optional().meta({
    title: "结果数量",
    description: "返回结果的条数。可填范围：1-50，默认为10"
  }),
  "searchType": z.enum(["web","web_summary"]).meta({
    title: "搜索类型",
    description: "搜索类型。可填范围：web, web_summary(带总结结果的web搜索)"
  }),
  "sites": z.string().optional().meta({
    title: "包含网站",
    description: "指定搜索的site范围。多个域名使用|分隔，最多5个。例如：qq.com|m.163.com"
  }),
  "time_range": z.enum(["OneDay","OneWeek","OneMonth","OneYear"]).optional().meta({
    title: "时间范围",
    description: "搜索指定时间范围内的网页。支持：OneDay, OneWeek, OneMonth, OneYear"
  })
});
const outputSchema = z.object({
  "result": z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
    description: "搜索返回的结果列表"
  }),
  "error": z.string().optional().meta({
    title: "错误信息"
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
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "searchInfinity",
    name: {
      en: "Volcano-SearchInfinity",
      "zh-CN": "融合信息搜索",
    },
    description: {
      en: "An advanced web search plugin based on ByteDance's powerful search capabilities. Features intelligent search, website filtering, time range control, and comprehensive result formatting.",
      "zh-CN":
        "基于字节跳动强大的检索能力的高级网页搜索插件，具有智能搜索、网站过滤、时间范围控制和全面结果格式化功能。",
    },
    version: "0.2.0",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    tags: ["search"],
    author: "火山引擎",
  },
  secretSchema,
  handler,
});

export default tool;
