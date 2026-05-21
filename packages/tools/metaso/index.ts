import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as metasoSearchInputType,
  OutputType as metasoSearchOutputType,
  tool as metasoSearchTool,
} from "./children/metasoSearch";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "Metaso API密钥",
    description: "Metaso API密钥，用于访问问答服务",
    isSecret: true,
  }),
});

const metasoSearchSecretSchema = z.object({});
const metasoSearchInputSchema = z.object({
  query: z.string().meta({
    title: "搜索关键词",
    description: "要搜索的关键词或查询语句",
    toolDescription: "搜索关键词",
  }),
  scope: z
    .enum([
      "all",
      "webpage",
      "document",
      "scholar",
      "image",
      "video",
      "podcast",
    ])
    .optional()
    .meta({
      title: "搜索范围",
      description: "指定搜索的范围类型",
    }),
  size: z.number().optional().meta({
    title: "结果数量",
    description: "返回的搜索结果数量（1-20）",
  }),
  includeSummary: z.boolean().optional().meta({
    title: "包含摘要",
    description: "是否在搜索结果中包含智能摘要",
  }),
});
const metasoSearchOutputSchema = z.object({
  result: z.array(z.record(z.string(), z.unknown())).meta({
    title: "搜索结果",
  }),
});

const metasoSearchHandler = createToolHandler({
  inputSchema: metasoSearchInputSchema,
  outputSchema: metasoSearchOutputSchema,
  secretSchema: metasoSearchSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await metasoSearchInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await metasoSearchTool(parsedInput, ctx);
    return metasoSearchOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "metaso",
    name: {
      en: "Metaso Tool Set",
      "zh-CN": "秘塔搜索工具集",
    },
    description: {
      en: "Metaso AI search tool set, including intelligent search, Q&A and web content reading functionality",
      "zh-CN": "秘塔AI搜索工具集，包含智能搜索、问答和网页内容读取功能",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    tags: ["search"],
  },
  secretSchema,
  children: [
    {
      id: "metasoSearch",
      name: {
        en: "Metaso Search",
        "zh-CN": "秘塔搜索",
      },
      description: {
        en: "Intelligent search tool powered by Metaso API with multiple search scopes and result summaries",
        "zh-CN": "基于秘塔API的智能搜索工具，支持多种搜索范围和结果摘要",
      },
      toolDescription: "使用秘塔 API 进行网络搜索。",
      handler: metasoSearchHandler,
    },
  ],
});

export default toolSet;
