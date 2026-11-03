import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as imageGenerateInputType,
  OutputType as imageGenerateOutputType,
  tool as imageGenerateTool,
} from "./children/imageGenerate";

const secretSchema = z.object({
  STABILITY_KEY: z.string().meta({
    title: "Stability API key",
    description: "Get an API key at https://platform.stability.ai.",
    isSecret: true,
    "x-i18n": {
      title: { en: "Stability API key", "zh-CN": "Stability API 密钥" },
      description: {
        en: "Get an API key at https://platform.stability.ai.",
        "zh-CN": "可在 https://platform.stability.ai 获取 API 密钥。",
      },
    },
  }),
});
const imageGenerateSecretSchema = z.object({});
const imageGenerateInputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Prompt", "zh-CN": "提示词" },
    description: {
      en: "The text description of the image you want to generate.",
      "zh-CN": "描述想要生成的图像。",
    },
    isToolParam: true,
  },
  model: {
    type: z.enum([
      "ultra",
      "core",
      "sd3.5-large",
      "sd3.5-large-turbo",
      "sd3.5-medium",
    ]),
    title: { en: "Model", "zh-CN": "模型选择" },
    description: {
      en: "Choose the image generation model.",
      "zh-CN": "选择图像生成模型。",
    },
    isToolParam: true,
  },
  aspect_ratio: {
    type: z
      .enum(["1:1", "16:9", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"])
      .optional(),
    title: { en: "Aspect ratio", "zh-CN": "宽高比" },
    description: {
      en: "Aspect ratio of the image.",
      "zh-CN": "图像的宽高比例。",
    },
    isToolParam: true,
  },
  negative_prompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "负面提示词" },
    description: {
      en: "Things you do not want to see in the generated image (optional negative prompt).",
      "zh-CN": "描述生成图像中不希望出现的内容（可选负面提示词）。",
    },
    isToolParam: true,
  },
  style_preset: {
    type: z
      .enum([
        "3d-model",
        "analog-film",
        "anime",
        "cinematic",
        "comic-book",
        "digital-art",
        "enhance",
        "fantasy-art",
        "isometric",
        "line-art",
        "low-poly",
        "modeling-compound",
        "neon-punk",
        "origami",
        "photographic",
        "pixel-art",
        "tile-texture",
      ])
      .optional(),
    title: { en: "Style preset", "zh-CN": "风格预设" },
    description: {
      en: "Image style preset (supported by Core only).",
      "zh-CN": "图像风格预设（仅 Core 模型支持）。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Random seed", "zh-CN": "随机种子" },
    description: {
      en: "Seed for reproducible generation, from 0 to 4294967294.",
      "zh-CN": "用于可重现生成的随机种子，范围为 0–4294967294。",
    },
    isToolParam: true,
  },
  output_format: {
    type: z.enum(["png", "jpeg", "webp"]).optional(),
    title: { en: "Output format", "zh-CN": "输出格式" },
    description: {
      en: "File format of the generated image.",
      "zh-CN": "生成图像的文件格式。",
    },
    isToolParam: true,
  },
});
const imageGenerateOutputSchema = defineOutputSchema({
  link: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "Link to access the generated image.",
      "zh-CN": "生成图像的访问链接。",
    },
  },
});
const imageGenerateHandler = createToolHandler({
  inputSchema: imageGenerateInputSchema,
  outputSchema: imageGenerateOutputSchema,
  secretSchema: imageGenerateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await imageGenerateInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await imageGenerateTool(parsedInput, ctx);
    return imageGenerateOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "stability",
    name: {
      en: "Stability AI Image Generation",
      "zh-CN": "Stability AI 图像生成",
    },
    description: {
      en: "Stability AI image generation tool set including Ultra, Core and SD3.5 models",
      "zh-CN":
        "Stability AI 提供的图像生成工具集，包含 Ultra、Core 和 SD3.5 模型",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    permission: ["file-upload:allow"],
  },
  secretSchema,
  children: [
    {
      id: "imageGenerate",
      name: {
        en: "Image Generate",
        "zh-CN": "图像生成",
      },
      description: {
        en: "Generate images using Stability AI, supporting Ultra, Core and SD3.5 series models",
        "zh-CN":
          "使用 Stability AI 生成图像，支持 Ultra、Core 和 SD3.5 系列模型",
      },
      handler: imageGenerateHandler,
    },
  ],
});

export default toolSet;
