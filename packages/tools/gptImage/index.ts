import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as imgEditingInputType,
  OutputType as imgEditingOutputType,
  tool as imgEditingTool,
} from "./children/imgEditing";
import {
  InputType as imgGenerationInputType,
  OutputType as imgGenerationOutputType,
  tool as imgGenerationTool,
} from "./children/imgGeneration";

const secretSchema = z.object({
  baseUrl: z
    .string()
    .optional()
    .meta({
      title: "Base URL",
      description: "默认为：https://api.openai.com/v1",
      "x-i18n": {
        title: { en: "Base URL", "zh-CN": "基础 URL" },
        description: {
          en: "Defaults to https://api.openai.com/v1.",
          "zh-CN": "默认为：https://api.openai.com/v1。",
        },
      },
      isSecret: false,
    }),
  apiKey: z.string().meta({
    title: "API Key",
    description: "可以在 https://api.gpt.ge/pricing 获取",
    "x-i18n": {
      title: { en: "API key", "zh-CN": "API 密钥" },
      description: {
        en: "Obtain an API key at https://api.gpt.ge/pricing.",
        "zh-CN": "可以在 https://api.gpt.ge/pricing 获取。",
      },
    },
    isSecret: true,
  }),
});
const imgEditingSecretSchema = z.object({});
const imgEditingInputSchema = defineInputSchema({
  image: {
    type: z.string(),
    title: { en: "Source image", "zh-CN": "原始图片" },
    description: {
      en: "Image to edit, provided as a URL or base64 data; file size must be under 4 MB.",
      "zh-CN":
        "要编辑的原始图片，支持图片 URL 或 base64 编码，文件大小需小于 4MB。",
    },
    isToolParam: true,
  },
  prompt: {
    type: z.string(),
    title: { en: "Editing instructions", "zh-CN": "编辑描述" },
    description: {
      en: "Describe the changes to make to the image.",
      "zh-CN": "描述要对图片进行的修改。",
    },
    isToolParam: true,
  },
  size: {
    type: z.enum(["1024x1024", "1024x1536", "1536x1024"]).optional(),
    title: { en: "Image size", "zh-CN": "图片尺寸" },
    isToolParam: true,
  },
  quality: {
    type: z.enum(["medium", "high", "low"]).optional(),
    title: { en: "Image quality", "zh-CN": "图片质量" },
    isToolParam: true,
  },
});
const imgEditingOutputSchema = defineOutputSchema({
  imageUrl: {
    type: z.string(),
    title: { en: "Edited image URL", "zh-CN": "编辑后图片链接" },
    description: {
      en: "URL of the edited image file.",
      "zh-CN": "编辑后的图片文件链接。",
    },
  },
});
const imgEditingHandler = createToolHandler({
  inputSchema: imgEditingInputSchema,
  outputSchema: imgEditingOutputSchema,
  secretSchema: imgEditingSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await imgEditingInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await imgEditingTool(parsedInput, ctx);
    return imgEditingOutputType.parseAsync(output);
  },
});

const imgGenerationSecretSchema = z.object({});
const imgGenerationInputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Image description", "zh-CN": "图像描述" },
    description: {
      en: "Describe the image you want to generate in detail.",
      "zh-CN": "详细描述要生成的图像内容。",
    },
    isToolParam: true,
  },
  size: {
    type: z.enum(["1024x1024", "1024x1536", "1536x1024"]).optional(),
    title: { en: "Image size", "zh-CN": "图片尺寸" },
    isToolParam: true,
  },
  quality: {
    type: z.enum(["medium", "high", "low"]).optional(),
    title: { en: "Image quality", "zh-CN": "图片质量" },
    isToolParam: true,
  },
  background: {
    type: z.enum(["auto", "transparent", "opaque"]).optional(),
    title: { en: "Background", "zh-CN": "背景透明度" },
    isToolParam: true,
  },
  moderation: {
    type: z.enum(["auto", "low"]).optional(),
    title: { en: "Moderation level", "zh-CN": "图片审查级别" },
    isToolParam: true,
  },
});
const imgGenerationOutputSchema = defineOutputSchema({
  imageUrl: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "URL of the generated image file.",
      "zh-CN": "生成的图片文件链接。",
    },
  },
});
const imgGenerationHandler = createToolHandler({
  inputSchema: imgGenerationInputSchema,
  outputSchema: imgGenerationOutputSchema,
  secretSchema: imgGenerationSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await imgGenerationInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await imgGenerationTool(parsedInput, ctx);
    return imgGenerationOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "gptImage",
    name: {
      en: "gpt-image Image Generation",
      "zh-CN": "gpt-image 绘图",
    },
    description: {
      en: "Generate and edit images using the gpt-image-1 model.",
      "zh-CN": "使用 gpt-image-1 模型生成和编辑图像。",
    },
    version: "0.0.1",
    versionDescription: { en: "Initial version", "zh-CN": "初始版本" },
    tags: ["multimodal"],
    permission: ["file-upload:allow"],
  },
  secretSchema,
  children: [
    {
      id: "imgEditing",
      name: { en: "gpt-image Image Editing", "zh-CN": "gpt-image 图像编辑" },
      description: {
        en: "Edit existing images with gpt-image-1, with optional masking for precise changes.",
        "zh-CN": "使用 gpt-image-1 编辑现有图像，并可通过蒙版进行精确修改。",
      },
      handler: imgEditingHandler,
    },
    {
      id: "imgGeneration",
      name: { en: "gpt-image Image Generation", "zh-CN": "gpt-image 图像生成" },
      description: {
        en: "Generate images from text prompts with gpt-image-1 and configurable size and quality.",
        "zh-CN": "使用 gpt-image-1 根据文本提示生成图像，并可配置尺寸和质量。",
      },
      handler: imgGenerationHandler,
    },
  ],
});

export default toolSet;
