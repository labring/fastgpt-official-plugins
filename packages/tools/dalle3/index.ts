import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  url: z.string().meta({
    title: "Dalle3 接口基础地址",
    description: "例如：https://api.openai.com",
    "x-i18n": {
      title: { en: "Dalle3 API base URL", "zh-CN": "Dalle3 接口基础地址" },
      description: {
        en: "For example: https://api.openai.com",
        "zh-CN": "例如：https://api.openai.com",
      },
    },
    isSecret: false,
  }),
  authorization: z.string().meta({
    title: "接口凭证（不需要 Bearer）",
    description: "sk-xxxx",
    "x-i18n": {
      title: {
        en: "API credential (without Bearer)",
        "zh-CN": "接口凭证（不需要 Bearer）",
      },
      description: {
        en: "API key, for example sk-xxxx.",
        "zh-CN": "API 密钥，例如 sk-xxxx。",
      },
    },
    isSecret: true,
  }),
});
const inputSchema = defineInputSchema({
  prompt: {
    type: z.string().optional(),
    title: { en: "Image prompt", "zh-CN": "绘图提示词" },
    description: {
      en: "Prompt describing the image to generate.",
      "zh-CN": "描述要生成图像的提示词。",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  link: {
    type: z.string().optional(),
    title: { en: "Image URL", "zh-CN": "图片访问链接" },
    description: {
      en: "URL for accessing the generated image.",
      "zh-CN": "生成图片的访问链接。",
    },
  },
  system_error: {
    type: z.string().optional(),
    title: { en: "Error message", "zh-CN": "错误信息" },
    description: {
      en: "Error reported by the image generation service, if any.",
      "zh-CN": "图像生成服务返回的错误信息（如有）。",
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
      "zh-CN": "默认版本",
    },
    tags: ["multimodal"],
    permission: ["file-upload:allow"],
  },
  handler,
});

export default tool;
