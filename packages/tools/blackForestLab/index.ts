import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as kontextEditingInputType,
  OutputType as kontextEditingOutputType,
  tool as kontextEditingTool,
} from "./children/kontextEditing";
import {
  InputType as kontextGenerationInputType,
  OutputType as kontextGenerationOutputType,
  tool as kontextGenerationTool,
} from "./children/kontextGeneration";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "API Key",
    description: "BFL API key available from https://api.bfl.ai/.",
    "x-i18n": {
      title: { en: "API key", "zh-CN": "API 密钥" },
      description: {
        en: "BFL API key available from https://api.bfl.ai/.",
        "zh-CN": "可在 https://api.bfl.ai/ 获取 BFL API 密钥。",
      },
    },
    isSecret: true,
  }),
});
const kontextEditingSecretSchema = z.object({});
const kontextEditingInputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Edit prompt", "zh-CN": "编辑描述" },
    description: {
      en: "Describe the edits you want made to the image.",
      "zh-CN": "描述您想要对图像进行的编辑操作。",
    },
    isToolParam: true,
  },
  input_image: {
    type: z.string(),
    title: { en: "Input image", "zh-CN": "输入图像" },
    description: {
      en: "Image to edit, as a URL or base64-encoded image; supports up to 20 MB or 20 megapixels.",
      "zh-CN":
        "要编辑的图像，可以是 URL 或 base64 编码的图像数据，支持最大 20 MB 或 20 百万像素。",
    },
    isToolParam: true,
  },
  aspect_ratio: {
    type: z
      .enum([
        "3:7",
        "4:7",
        "1:2",
        "9:16",
        "2:3",
        "3:4",
        "1:1",
        "4:3",
        "3:2",
        "16:9",
        "2:1",
        "7:4",
        "7:3",
      ])
      .optional(),
    title: { en: "Aspect ratio", "zh-CN": "宽高比" },
    description: {
      en: "Image aspect ratio, from 3:7 to 7:3.",
      "zh-CN": "图像的宽高比，支持从 3:7 到 7:3。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Seed for reproducible generation; leave empty for a random seed.",
      "zh-CN": "用于可重复生成的种子值，留空则使用随机种子。",
    },
    isToolParam: true,
  },
  prompt_upsampling: {
    type: z.boolean().optional(),
    title: { en: "Prompt enhancement", "zh-CN": "提示词增强" },
    description: {
      en: "Whether to enhance the prompt.",
      "zh-CN": "是否对提示词进行优化增强。",
    },
    isToolParam: true,
  },
  safety_tolerance: {
    type: z.number().optional(),
    title: { en: "Safety tolerance", "zh-CN": "安全等级" },
    description: {
      en: "Content moderation strictness: 0 is strictest and 2 is most permissive.",
      "zh-CN": "内容审核的严格程度，0 最严格，2 最宽松。",
    },
    isToolParam: true,
  },
  output_format: {
    type: z.enum(["jpeg", "png"]).optional(),
    title: { en: "Output format", "zh-CN": "输出格式" },
    description: {
      en: "File format of the generated image.",
      "zh-CN": "生成图像的文件格式。",
    },
    isToolParam: true,
  },
});
const kontextEditingOutputSchema = defineOutputSchema({
  image_url: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片 URL" },
    description: {
      en: "URL of the edited image.",
      "zh-CN": "编辑后的图片 URL。",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error", "zh-CN": "错误信息" },
    description: {
      en: "Error message, if any.",
      "zh-CN": "发生错误时返回的错误信息。",
    },
  },
});
const kontextEditingHandler = createToolHandler({
  inputSchema: kontextEditingInputSchema,
  outputSchema: kontextEditingOutputSchema,
  secretSchema: kontextEditingSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await kontextEditingInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await kontextEditingTool(parsedInput);
    return kontextEditingOutputType.parseAsync(output);
  },
});

const kontextGenerationSecretSchema = z.object({});
const kontextGenerationInputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Image prompt", "zh-CN": "图像描述" },
    description: {
      en: "Describe the image to generate.",
      "zh-CN": "描述您想要生成的图像。",
    },
    isToolParam: true,
  },
  aspect_ratio: {
    type: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"]),
    title: { en: "Aspect ratio", "zh-CN": "宽高比" },
    description: {
      en: "Image aspect ratio, for example 1:1, 16:9, or 3:4.",
      "zh-CN": "图像的宽高比，例如 1:1、16:9、3:4 等。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Seed for reproducible generation; leave empty for a random seed.",
      "zh-CN": "用于可重复生成的种子值，留空则使用随机种子。",
    },
    isToolParam: true,
  },
  prompt_upsampling: {
    type: z.boolean(),
    title: { en: "Prompt enhancement", "zh-CN": "提示词增强" },
    description: {
      en: "Whether to enhance the prompt.",
      "zh-CN": "是否对提示词进行优化增强。",
    },
    isToolParam: true,
  },
  safety_tolerance: {
    type: z.number(),
    title: { en: "Safety tolerance", "zh-CN": "安全等级" },
    description: {
      en: "Content moderation strictness: 0 is strictest and 6 is most permissive.",
      "zh-CN": "内容审核的严格程度，0 最严格，6 最宽松。",
    },
    isToolParam: true,
  },
  output_format: {
    type: z.enum(["jpeg", "png"]),
    title: { en: "Output format", "zh-CN": "输出格式" },
    description: {
      en: "File format of the generated image.",
      "zh-CN": "生成图像的文件格式。",
    },
    isToolParam: true,
  },
});
const kontextGenerationOutputSchema = defineOutputSchema({
  image_url: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片 URL" },
    description: {
      en: "URL of the generated image.",
      "zh-CN": "生成的图片 URL。",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error", "zh-CN": "错误信息" },
    description: {
      en: "Error message, if any.",
      "zh-CN": "发生错误时返回的错误信息。",
    },
  },
});
const kontextGenerationHandler = createToolHandler({
  inputSchema: kontextGenerationInputSchema,
  outputSchema: kontextGenerationOutputSchema,
  secretSchema: kontextGenerationSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await kontextGenerationInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await kontextGenerationTool(parsedInput);
    return kontextGenerationOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "blackForestLab",
    name: {
      en: "Flux Drawing",
      "zh-CN": "Flux 绘图",
    },
    description: {
      en: "Flux official drawing model toolset",
      "zh-CN": "Flux官方绘图模型工具集",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["multimodal"],
  },
  secretSchema,
  children: [
    {
      id: "kontextEditing",
      name: {
        en: "FLUX.1 Image Editing",
        "zh-CN": "FLUX.1 图像编辑",
      },
      description: {
        en: "Edit images using FLUX.1 Kontext [pro] model, supports text-based image modification",
        "zh-CN":
          "使用 FLUX.1 Kontext [pro] 模型对图像进行编辑，支持基于文本提示的图像修改",
      },
      handler: kontextEditingHandler,
    },
    {
      id: "kontextGeneration",
      name: {
        en: "FLUX.1 Image Generation",
        "zh-CN": "FLUX.1 图像生成",
      },
      description: {
        en: "Generate high-quality images using FLUX.1 Kontext [pro] model, supports text-to-image generation",
        "zh-CN":
          "使用 FLUX.1 Kontext [pro] 模型生成高质量图像，支持文本到图像的生成",
      },
      handler: kontextGenerationHandler,
    },
  ],
});

export default toolSet;
