import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({
  "url": z.string().meta({
    title: "Dalle3 接口基础地址",
    description: "例如：https://api.openai.com"
  }),
  "authorization": z.string().meta({
    title: "接口凭证（不需要 Bearer）",
    description: "sk-xxxx",
    isSecret: true,
  })
});
const inputSchema = z.object({
  "prompt": z.string().optional().meta({
    title: "绘图提示词",
    toolDescription: "绘图提示词"
  })
});
const outputSchema = z.object({
  "link": z.string().optional().meta({
    title: "图片访问链接",
    description: "图片访问链接"
  }),
  "system_error": z.string().optional().meta({
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
    pluginId: "dalle3",
    name: {
      en: "Dalle3 Drawing",
      "zh-CN": "Dalle3 绘图",
    },
    description: {
      en: "Call Dalle3 Interface to Draw",
      "zh-CN": "调用 Dalle3 接口绘图",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    tags: ["multimodal"],
    permission: ["file-upload:allow"],
  },
  secretSchema,
  handler,
});

export default tool;
