import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z
  .object({
    sources: z.array(z.enum(["36kr","zhihu","weibo","juejin","toutiao"])).meta({
      title: "热榜来源",
      description: "选择热榜来源网站（可多选）",
    }),
  });
const outputSchema = z
  .object({
    hotNewsList: z.array(z.record(z.string(), z.unknown())).meta({
      title: "新闻热榜列表",
      description: "新闻热榜数据列表",
    }),
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
    pluginId: "dailyHot",
    name: {
      en: "Hot List Tool",
      "zh-CN": "热榜工具",
    },
    description: {
      en: "Get hot list information from multiple platforms including 36kr, zhihu, weibo, juejin, and toutiao",
      "zh-CN": "获取热榜信息，支持36氪、知乎、微博、掘金、头条等多个平台",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    toolDescription:
      "Get hot trending content from multiple platforms including 36kr, zhihu, weibo, juejin, and toutiao with accurate publish times",
    tags: ["tools"],
  },
  handler,
});

export default tool;
