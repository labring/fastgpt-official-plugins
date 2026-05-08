import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  "apiKey": z.string().meta({
    title: "API Key",
    description: "可以在 https://api.bfl.ai/ 获取 API Key"
  })
});
const kontextEditingSecretSchema = z.object({});
const kontextEditingInputSchema = z.object({
  "prompt": z.string().meta({
    title: "编辑描述",
    description: "描述您想要对图像进行的编辑操作",
    toolDescription: "图像描述"
  }),
  "input_image": z.string().meta({
    title: "输入图像",
    description: "要编辑的图像，可以是 URL 或 base64 编码的图像数据，支持最大 20MB 或 20 百万像素"
  }),
  "aspect_ratio": z.enum(["3:7","4:7","1:2","9:16","2:3","3:4","1:1","4:3","3:2","16:9","2:1","7:4","7:3"]).optional().meta({
    title: "宽高比",
    description: "图像的宽高比，支持从 3:7 到 7:3"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于可重复生成的种子值，留空则使用随机种子"
  }),
  "prompt_upsampling": z.boolean().optional().meta({
    title: "提示词增强",
    description: "是否对提示词进行优化增强"
  }),
  "safety_tolerance": z.number().optional().meta({
    title: "安全等级",
    description: "内容审核的严格程度，0 最严格，2 最宽松"
  }),
  "output_format": z.enum(["jpeg","png"]).optional().meta({
    title: "输出格式",
    description: "生成图像的文件格式"
  })
});
const kontextEditingOutputSchema = z.object({
  "image_url": z.string().meta({
    title: "图片URL",
    description: "编辑后的图片URL"
  }),
  "error": z.string().optional().meta({
    title: "错误信息"
  })
});
const kontextEditingHandler = createToolHandler({
  inputSchema: kontextEditingInputSchema,
  outputSchema: kontextEditingOutputSchema,
  secretSchema: kontextEditingSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await kontextEditingInputType.parseAsync(input);
    const output = await kontextEditingTool(parsedInput, ctx);
    return kontextEditingOutputType.parseAsync(output);
  },
});

const kontextGenerationSecretSchema = z.object({});
const kontextGenerationInputSchema = z.object({
  "prompt": z.string().meta({
    title: "图像描述",
    description: "描述您想要生成的图像",
    toolDescription: "图像描述"
  }),
  "aspect_ratio": z.enum(["1:1","16:9","9:16","4:3","3:4","21:9","9:21"]).meta({
    title: "宽高比",
    description: "图像的宽高比，例如 \"1:1\", \"16:9\", \"3:4\" 等，支持从 3:7 到 7:3"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于可重复生成的种子值，留空则使用随机种子"
  }),
  "prompt_upsampling": z.boolean().meta({
    title: "提示词增强",
    description: "是否对提示词进行优化增强"
  }),
  "safety_tolerance": z.number().meta({
    title: "安全等级",
    description: "内容审核的严格程度，0 最严格，6 最宽松"
  }),
  "output_format": z.enum(["jpeg","png"]).meta({
    title: "输出格式",
    description: "生成图像的文件格式"
  })
});
const kontextGenerationOutputSchema = z.object({
  "image_url": z.string().meta({
    title: "图片URL",
    description: "生成的图片URL"
  }),
  "error": z.string().optional().meta({
    title: "错误信息"
  })
});
const kontextGenerationHandler = createToolHandler({
  inputSchema: kontextGenerationInputSchema,
  outputSchema: kontextGenerationOutputSchema,
  secretSchema: kontextGenerationSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await kontextGenerationInputType.parseAsync(input);
    const output = await kontextGenerationTool(parsedInput, ctx);
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
      "zh-CN": "Initial version",
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
