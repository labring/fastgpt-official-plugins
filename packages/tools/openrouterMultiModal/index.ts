import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as NanoBananaInputType,
  OutputType as NanoBananaOutputType,
  tool as NanoBananaTool,
} from "./children/NanoBanana";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "API Key",
    description: "API key used to access OpenRouter models.",
    "x-i18n": {
      title: { en: "API Key", "zh-CN": "API 密钥" },
      description: {
        en: "API key used to access OpenRouter models.",
        "zh-CN": "用于访问 OpenRouter 模型的 API 密钥。",
      },
    },
    isSecret: true,
  }),
});
const NanoBananaSecretSchema = z.object({});
const NanoBananaInputSchema = defineInputSchema({
  text: {
    type: z.string(),
    title: { en: "Prompt", "zh-CN": "提示词" },
    description: {
      en: "Text prompt used to generate an image.",
      "zh-CN": "用于生成图像的文本提示词。",
    },
    isToolParam: true,
  },
  aspect_ratio: {
    type: z.enum([
      "1:1",
      "2:3",
      "3:4",
      "4:3",
      "2:1",
      "3:2",
      "16:9",
      "9:16",
      "21:9",
      "9:21",
    ]),
    title: { en: "Aspect Ratio", "zh-CN": "宽高比" },
    description: {
      en: "Image aspect ratio, such as 1:1, 16:9, or 3:4; supported ratios range from 1:1 to 21:9.",
      "zh-CN": "图像宽高比，例如 1:1、16:9 或 3:4；支持范围为 1:1 至 21:9。",
    },
    isToolParam: true,
  },
  model: {
    type: z.enum(["google/gemini-2.5-flash-image-preview"]),
    title: { en: "Model", "zh-CN": "模型" },
    description: {
      en: "Image generation model to use.",
      "zh-CN": "要使用的图像生成模型。",
    },
    isToolParam: true,
  },
});
const NanoBananaOutputSchema = defineOutputSchema({
  imageUrl: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "URL of the generated image.",
      "zh-CN": "生成图像的 URL。",
    },
  },
});
const NanoBananaHandler = createToolHandler({
  inputSchema: NanoBananaInputSchema,
  outputSchema: NanoBananaOutputSchema,
  secretSchema: NanoBananaSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await NanoBananaInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await NanoBananaTool(parsedInput, ctx);
    return NanoBananaOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "openrouterMultiModal",
    name: {
      en: "OpenRouter Multi-Modal",
      "zh-CN": "OpenRouter 多模态",
    },
    description: {
      en: "Generate images with Nano Banana through OpenRouter, with support for the model services available on the OpenRouter platform.",
      "zh-CN":
        "通过 OpenRouter 使用 Nano Banana 生成图像，并支持调用 OpenRouter 平台提供的模型服务。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial release",
      "zh-CN": "初始版本",
    },
    tags: ["multimodal"],
    permission: ["file-upload:allow"],
  },
  secretSchema,
  children: [
    {
      id: "NanoBanana",
      name: {
        en: "Nano Banana Text-to-Image",
        "zh-CN": "Nano Banana 文生图",
      },
      description: {
        en: "Convert text prompts into images with Nano Banana models through OpenRouter.",
        "zh-CN":
          "通过 OpenRouter 使用 Nano Banana 模型将文本提示词转换为图像。",
      },
      handler: NanoBananaHandler,
    },
  ],
});

export default toolSet;
