import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "5118 API Key",
    description: "在 5118 控制台获取 API Key。文档：https://www.5118.com/apistore/detail/8cf3d6ed-2b12-ed11-8da8-e43d1a103141/-1"
  })
});
const inputSchema = z.object({
  "keyword": z.string().meta({
    title: "种子关键词",
    description: "输入要挖掘的关键词",
    toolDescription: "输入要挖掘的关键词"
  }),
  "pageIndex": z.number().optional().meta({
    title: "页码",
    description: "当前分页，默认第1页",
    toolDescription: "当前分页，默认第1页"
  }),
  "pageSize": z.number().optional().meta({
    title: "每页数量",
    description: "每页返回数据的数量，最大100条，默认100条",
    toolDescription: "每页返回数据的数量，最大100条，默认100条"
  }),
  "sortFields": z.number().optional().meta({
    title: "排序字段",
    description: "排序字段(2:竞价公司数量,3:长尾词数量,4:流量指数,5:百度移动指数,6:360好搜指数,7:PC日检索量,8:移动日检索量,9:竞争激烈程度)",
    toolDescription: "排序字段(2:竞价公司数量,3:长尾词数量,4:流量指数,5:百度移动指数,6:360好搜指数,7:PC日检索量,8:移动日检索量,9:竞争激烈程度)"
  }),
  "sortType": z.enum(["asc","desc"]).optional().meta({
    title: "排序方式",
    description: "升序或降序(asc:升序,desc:降序)",
    toolDescription: "升序或降序(asc:升序,desc:降序)"
  }),
  "filter": z.number().optional().meta({
    title: "快捷过滤",
    description: "过滤条件(1:所有词,2:所有流量词,3:流量指数词,4:移动指数词,5:360指数词,6:流量特点词,7:PC日检索量词,8:移动日检索量,9:存在竞价的词)",
    toolDescription: "过滤条件(1:所有词,2:所有流量词,3:流量指数词,4:移动指数词,5:360指数词,6:流量特点词,7:PC日检索量词,8:移动日检索量,9:存在竞价的词)"
  }),
  "filterDate": z.string().optional().meta({
    title: "筛选日期",
    description: "筛选日期(格式:yyyy-MM-dd)，可选",
    toolDescription: "筛选日期(格式:yyyy-MM-dd)，可选"
  })
});
const outputSchema = z.object({
  "keywords": z.string().meta({
    title: "关键词列表",
    description: "挖掘到的相关关键词及其数据（JSON格式）"
  }),
  "total": z.number().meta({
    title: "总数量",
    description: "找到的关键词总数"
  }),
  "pageCount": z.number().meta({
    title: "总页数",
    description: "分页的总页数"
  }),
  "pageIndex": z.number().meta({
    title: "当前页码",
    description: "当前返回的页码"
  }),
  "pageSize": z.number().meta({
    title: "每页数量",
    description: "每页返回的关键词数量"
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
    pluginId: "seoKeywordMiner",
    name: {
      en: "SEO Keyword Miner",
      "zh-CN": "SEO关键词挖掘工具",
    },
    description: {
      en: "Massive long-tail keyword mining tool based on 5118 API,获取 keyword search volume and index data",
      "zh-CN":
        "基于5118 API的海量长尾关键词挖掘工具，获取关键词搜索量和指数数据",
    },
    version: "1.0.0",
    versionDescription: {
      en: "5118 SEO关键词挖掘",
      "zh-CN": "5118 SEO关键词挖掘",
    },
    toolDescription:
      "A powerful SEO tool for mining long-tail keywords using 5118 API. Provides search volume data and keyword metrics for SEO optimization.",
    tags: ["tools"],
  },
  secretSchema,
  handler,
});

export default tool;
