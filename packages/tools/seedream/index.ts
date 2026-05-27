import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "API Key",
    description: "豆包Seedream 4.0 图片生成模型",
    isSecret: true,
  })
});
const inputSchema = z.object({
  "model": z.enum(["doubao-seedream-4-0-250828"]).meta({
    title: "模型",
    description: "模型"
  }),
  "prompt": z.string().meta({
    title: "提示词",
    description: "用于生成图像的提示词，支持中英文。",
    toolDescription: "用于生成图像的提示词，支持中英文。"
  }),
  "size": z.enum(["2048x2048","2304x1728","1728x2304","2560x1440","1440x2560","2496x1664","1664x2496","3024x1296"]).optional().meta({
    title: "生成图像的尺寸信息",
    description: "生成图像的尺寸信息"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "随机数种子, 用于控制模型生成内容的随机性"
  })
});
const outputSchema = z.object({
  "image": z.string().meta({
    title: "图片链接"
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
    pluginId: "seedream",
    name: {
      en: "Seedream Image Generation Model",
      "zh-CN": "Seedream 4.0 绘图",
    },
    description: {
      en: "Seedream Image Generation Model",
      "zh-CN": "豆包 Seedream 4.0 图片生成模型",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    toolDescription: "Seedream 4.0 图片生成模型",
    tags: ["multimodal"],
  },
  secretSchema,
  handler,
});

export default tool;
