import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "API Key",
    description: "Seedream 4.0 image generation API key.",
    isSecret: true,
    "x-i18n": {
      title: { en: "API Key", "zh-CN": "API 密钥" },
      description: {
        en: "Seedream 4.0 image generation API key.",
        "zh-CN": "Seedream 4.0 图片生成模型 API 密钥。",
      },
    },
  }),
});
const inputSchema = defineInputSchema({
  model: {
    type: z.enum(["doubao-seedream-4-0-250828"]),
    title: { en: "Model", "zh-CN": "模型" },
    description: { en: "Image generation model.", "zh-CN": "图像生成模型。" },
    isToolParam: true,
  },
  prompt: {
    type: z.string(),
    title: { en: "Prompt", "zh-CN": "提示词" },
    description: {
      en: "Text prompt for generating an image; Chinese and English are supported.",
      "zh-CN": "用于生成图像的提示词，支持中英文。",
    },
    isToolParam: true,
  },
  size: {
    type: z
      .enum([
        "2048x2048",
        "2304x1728",
        "1728x2304",
        "2560x1440",
        "1440x2560",
        "2496x1664",
        "1664x2496",
        "3024x1296",
      ])
      .optional(),
    title: { en: "Image size", "zh-CN": "生成图像的尺寸" },
    description: {
      en: "Size of the generated image.",
      "zh-CN": "生成图像的尺寸。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Random seed", "zh-CN": "随机种子" },
    description: {
      en: "Random seed used to control generation randomness.",
      "zh-CN": "用于控制模型生成内容随机性的种子。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  image: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "URL of the generated image.",
      "zh-CN": "生成图片的链接。",
    },
  },
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await toolCb(parsedInput);
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
      "zh-CN": "默认版本",
    },
    tags: ["multimodal"],
  },
  handler,
});

export default tool;
