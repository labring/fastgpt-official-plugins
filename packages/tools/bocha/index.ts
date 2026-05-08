import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "博查API密钥",
    description: "博查API密钥"
  })
});
const inputSchema = z.object({
  "query": z.string().meta({
    title: "搜索查询词",
    description: "搜索查询词",
    toolDescription: "搜索查询词"
  }),
  "freshness": z.enum(["noLimit","oneDay","oneWeek","oneMonth","oneYear"]).optional().meta({
    title: "时间范围",
    description: "搜索指定时间范围内的网页。"
  }),
  "summary": z.boolean().optional().meta({
    title: "显示摘要",
    description: "是否显示文本摘要。"
  }),
  "include": z.string().optional().meta({
    title: "包含网站",
    description: "指定搜索的site范围。多个域名使用|或,分隔，最多20个。例如：qq.com|m.163.com"
  }),
  "exclude": z.string().optional().meta({
    title: "排除网站",
    description: "排除搜索的网站范围。多个域名使用|或,分隔，最多20个。例如：qq.com|m.163.com"
  }),
  "count": z.number().optional().meta({
    title: "结果数量",
    description: "返回结果的条数。可填范围：1-50，默认为10"
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
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput, ctx);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "bocha",
    name: {
      en: "Bocha Search",
      "zh-CN": "博查搜索",
    },
    description: {
      en: "Use Bocha AI search engine for web search.",
      "zh-CN": "使用博查AI搜索引擎进行网络搜索。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    tags: ["search"],
  },
  secretSchema,
  handler,
});

export default tool;
