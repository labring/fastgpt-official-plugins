import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { tool as generateImage, InputType, OutputType } from "./src";

const secretSchema = z.object({
  model: z
    .string()
    .min(1)
    .meta({
      title: "Model",
      description: "Enter the model name.",
      isSecret: false,
      "x-i18n": {
        title: { en: "Model", "zh-CN": "模型" },
        description: { en: "Enter the model name.", "zh-CN": "填写模型名。" },
      },
    } satisfies SecretSchemaMetaType),
  apiKey: z
    .string()
    .min(1)
    .meta({
      title: "API Key",
      description: "Service provider API key.",
      isSecret: true,
      "x-i18n": {
        title: { en: "API key", "zh-CN": "API Key" },
        description: {
          en: "Service provider API key.",
          "zh-CN": "服务商 API Key。",
        },
      },
    } satisfies SecretSchemaMetaType),
  baseUrl: z
    .string()
    .url()
    .optional()
    .meta({
      title: "Base URL",
      description:
        "Optional. Leave blank for the official API; enter a value only for a proxy or compatible endpoint.",
      isSecret: false,
      "x-i18n": {
        title: { en: "Base URL", "zh-CN": "Base URL" },
        description: {
          en: "Optional. Leave blank for the official API; enter a value only for a proxy or compatible endpoint.",
          "zh-CN": "可选。接入官方 API 时可不填；仅使用代理或兼容接口时填写。",
        },
      },
    } satisfies SecretSchemaMetaType),
});

const promptSchema = z.string().min(1);
const sizeSchema = z.string().optional();
const imageCountSchema = z.number().int().min(1).max(4).optional();
const prompt = {
  type: promptSchema,
  title: { en: "Image prompt", "zh-CN": "图片描述" },
  description: {
    en: "Text prompt describing the image to generate.",
    "zh-CN": "描述要生成的图片内容",
  },
  isToolParam: true,
};
const size = {
  type: sizeSchema,
  title: { en: "Image size", "zh-CN": "图片尺寸" },
  description: {
    en: "Optional image dimensions, for example 1024x1024.",
    "zh-CN": "可选图片尺寸，例如 1024x1024",
  },
  isToolParam: true,
};
const imageCount = {
  type: imageCountSchema,
  title: { en: "Image count", "zh-CN": "图片数量" },
  description: {
    en: "Optional number of images to generate (1–4).",
    "zh-CN": "可选的生成图片数量（1–4）",
  },
  isToolParam: true,
};
const openaiInputSchema = defineInputSchema({ prompt, size, imageCount });
const seedreamInputSchema = defineInputSchema({ prompt, size });
const wanxInputSchema = defineInputSchema({
  prompt,
  imageCount,
  negativePrompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "反向提示词" },
    description: {
      en: "Optional content to exclude from the image.",
      "zh-CN": "不希望出现在图片中的内容",
    },
    isToolParam: true,
  },
});
const nanobananaInputSchema = defineInputSchema({
  prompt,
  aspectRatio: {
    type: z.string().optional(),
    title: { en: "Aspect ratio", "zh-CN": "宽高比" },
    description: {
      en: "Optional aspect ratio, for example 1:1, 16:9, or 9:16.",
      "zh-CN": "可选宽高比，例如 1:1、16:9 或 9:16",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  imageUrl: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "Accessible URL of the first generated image.",
      "zh-CN": "第一张生成图片的可访问 URL",
    },
  },
  imageUrls: {
    type: z.array(z.string()),
    title: { en: "Image URLs", "zh-CN": "图片链接列表" },
    description: {
      en: "Accessible URLs of all generated images.",
      "zh-CN": "全部生成图片的可访问 URL",
    },
  },
  provider: {
    type: z.enum(["openai", "seedream", "wanx", "nanobanana"]),
    title: { en: "Provider", "zh-CN": "服务商" },
    description: {
      en: "Image generation provider used.",
      "zh-CN": "实际使用的图像生成服务商",
    },
  },
  model: {
    type: z.string(),
    title: { en: "Model", "zh-CN": "模型" },
    description: {
      en: "Image generation model used.",
      "zh-CN": "实际使用的图像生成模型",
    },
  },
  taskId: {
    type: z.string().optional(),
    title: { en: "Task ID", "zh-CN": "任务 ID" },
    description: {
      en: "Task ID returned by an asynchronous provider, if any.",
      "zh-CN": "异步服务商返回的任务 ID（如有）",
    },
  },
  status: {
    type: z.string().optional(),
    title: { en: "Status", "zh-CN": "状态" },
    description: {
      en: "Provider status or normalized task status.",
      "zh-CN": "服务商返回或插件归一化后的任务状态",
    },
  },
});

function createImageGenerationHandler(
  provider: "openai" | "seedream" | "wanx" | "nanobanana",
  inputSchema:
    | typeof openaiInputSchema
    | typeof seedreamInputSchema
    | typeof wanxInputSchema
    | typeof nanobananaInputSchema,
) {
  return createToolHandler({
    inputSchema,
    outputSchema,
    secretSchema: z.object({}),
    handler: async (input, ctx) => {
      const parsedInput = await InputType.parseAsync({
        ...input,
        ...ctx.secrets,
        provider,
      });
      const output = await generateImage(parsedInput, ctx);
      return OutputType.parseAsync(output);
    },
  });
}

export default defineToolSet({
  secretSchema,
  manifest: {
    pluginId: "image-generation",
    name: {
      en: "Image Generation",
      "zh-CN": "图片生成",
    },
    description: {
      en: "Generate images with OpenAI, Seedream, Wanx, or Nano Banana.",
      "zh-CN":
        "支持 OpenAI、Seedream、通义万相和 Nano Banana 的统一图片生成插件。",
    },
    version: "0.0.11",
    versionDescription: {
      en: "Refresh image generation provider icons.",
      "zh-CN": "更新图片生成服务商图标。",
    },
    author: "FastGPT",
    tags: ["multimodal"],
  },
  children: [
    {
      id: "openaiImageGeneration",
      name: {
        en: "OpenAI Image Generation",
        "zh-CN": "OpenAI 图片生成",
      },
      description: {
        en: "Generate images with OpenAI or an OpenAI-compatible image generation endpoint.",
        "zh-CN": "使用 OpenAI 或 OpenAI-compatible 网关生成图片。",
      },
      handler: createImageGenerationHandler("openai", openaiInputSchema),
    },
    {
      id: "seedreamImageGeneration",
      name: {
        en: "Seedream Image Generation",
        "zh-CN": "Seedream 图片生成",
      },
      description: {
        en: "Generate images with Volcengine Ark Seedream.",
        "zh-CN": "使用火山方舟 Seedream 生成图片。",
      },
      handler: createImageGenerationHandler("seedream", seedreamInputSchema),
    },
    {
      id: "wanxImageGeneration",
      name: {
        en: "Wanx Image Generation",
        "zh-CN": "通义万相图片生成",
      },
      description: {
        en: "Generate images with Alibaba DashScope Wanx.",
        "zh-CN": "使用阿里百炼通义万相生成图片。",
      },
      handler: createImageGenerationHandler("wanx", wanxInputSchema),
    },
    {
      id: "nanobananaImageGeneration",
      name: {
        en: "Nano Banana Image Generation",
        "zh-CN": "Nano Banana 图片生成",
      },
      description: {
        en: "Generate images with Google Gemini Nano Banana.",
        "zh-CN": "使用 Google Gemini Nano Banana 生成图片。",
      },
      handler: createImageGenerationHandler(
        "nanobanana",
        nanobananaInputSchema,
      ),
    },
  ],
});
