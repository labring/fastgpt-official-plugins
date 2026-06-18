import {
  createToolHandler,
  defineToolSet,
  type InputSchemaMetaType,
  type OutputSchemaMetaType,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { tool as generateImage, InputType, OutputType } from "./src";

const secretSchema = z.object({
  model: z
    .string()
    .min(1)
    .meta({
      title: "模型",
      description: "填写模型名。",
      isSecret: false,
    } satisfies SecretSchemaMetaType),
  apiKey: z
    .string()
    .min(1)
    .meta({
      title: "API Key",
      description: "服务商 API Key。",
      isSecret: true,
    } satisfies SecretSchemaMetaType),
  baseUrl: z
    .string()
    .url()
    .optional()
    .meta({
      title: "Base URL",
      description: "可选。接入官方 API 时可不填；仅使用代理或兼容接口时填写。",
      isSecret: false,
    } satisfies SecretSchemaMetaType),
});

const promptSchema = z
  .string()
  .min(1)
  .meta({
    title: "图片描述",
    description: "描述要生成的图片内容。",
    toolDescription: "The text prompt describing the image to generate.",
  } satisfies InputSchemaMetaType);

const sizeSchema = z
  .string()
  .optional()
  .meta({
    title: "图片尺寸",
    description: "可选。例如 1024x1024。",
  } satisfies InputSchemaMetaType);

const imageCountSchema = z
  .number()
  .int()
  .min(1)
  .max(4)
  .optional()
  .meta({
    title: "图片数量",
    description: "可选。生成图片数量。",
  } satisfies InputSchemaMetaType);

const openaiInputSchema = z.object({
  prompt: promptSchema,
  size: sizeSchema,
  imageCount: imageCountSchema,
});

const seedreamInputSchema = z.object({
  prompt: promptSchema,
  size: sizeSchema,
});

const wanxInputSchema = z.object({
  prompt: promptSchema,
  imageCount: imageCountSchema,
  negativePrompt: z
    .string()
    .optional()
    .meta({
      title: "反向提示词",
      description: "可选。不希望出现在图片中的内容。",
    } satisfies InputSchemaMetaType),
});

const nanobananaInputSchema = z.object({
  prompt: promptSchema,
  aspectRatio: z
    .string()
    .optional()
    .meta({
      title: "宽高比",
      description: "可选。例如 1:1、16:9、9:16。",
    } satisfies InputSchemaMetaType),
});

const outputSchema = z.object({
  imageUrl: z.string().meta({
    title: "图片链接",
    description: "第一张生成图片的可访问 URL。",
  } satisfies OutputSchemaMetaType),
  imageUrls: z.array(z.string()).meta({
    title: "图片链接列表",
    description: "全部生成图片的可访问 URL。",
  } satisfies OutputSchemaMetaType),
  provider: z.enum(["openai", "seedream", "wanx", "nanobanana"]).meta({
    title: "服务商",
  } satisfies OutputSchemaMetaType),
  model: z.string().meta({
    title: "模型",
  } satisfies OutputSchemaMetaType),
  taskId: z
    .string()
    .optional()
    .meta({
      title: "任务 ID",
      description: "异步服务商返回的任务 ID。",
    } satisfies OutputSchemaMetaType),
  status: z
    .string()
    .optional()
    .meta({
      title: "状态",
      description: "服务商返回或插件归一化后的任务状态。",
    } satisfies OutputSchemaMetaType),
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
        en: "Generate images with OpenAI or OpenAI-compatible gateways.",
        "zh-CN": "使用 OpenAI 或 OpenAI-compatible 网关生成图片。",
      },
      toolDescription:
        "Generate images with OpenAI or an OpenAI-compatible image generation endpoint.",
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
      toolDescription: "Generate images with Volcengine Ark Seedream.",
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
      toolDescription: "Generate images with Alibaba DashScope Wanx.",
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
      toolDescription: "Generate images with Google Gemini Nano Banana.",
      handler: createImageGenerationHandler(
        "nanobanana",
        nanobananaInputSchema,
      ),
    },
  ],
});
