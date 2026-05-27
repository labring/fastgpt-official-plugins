import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as imageGenerateInputType,
  OutputType as imageGenerateOutputType,
  tool as imageGenerateTool,
} from "./children/imageGenerate";

const secretSchema = z.object({
  "STABILITY_KEY": z.string().meta({
    title: "Stability API Key",
    description: "可以在 https://platform.stability.ai 获取 API Key",
    isSecret: true,
  })
});
const imageGenerateSecretSchema = z.object({});
const imageGenerateInputSchema = z.object({
  "prompt": z.string().meta({
    title: "提示词",
    description: "描述想要生成的图像",
    toolDescription: "The text description of the image you want to generate"
  }),
  "model": z.enum(["ultra","core","sd3.5-large","sd3.5-large-turbo","sd3.5-medium"]).meta({
    title: "模型选择",
    description: "选择图像生成模型"
  }),
  "aspect_ratio": z.enum(["1:1","16:9","21:9","2:3","3:2","4:5","5:4","9:16","9:21"]).optional().meta({
    title: "宽高比",
    description: "图像的宽高比例"
  }),
  "negative_prompt": z.string().optional().meta({
    title: "负面提示词",
    description: "描述不希望在图像中出现的内容",
    toolDescription: "Things you do not want to see in the generated image (optional negative prompt)"
  }),
  "style_preset": z.enum(["3d-model","analog-film","anime","cinematic","comic-book","digital-art","enhance","fantasy-art","isometric","line-art","low-poly","modeling-compound","neon-punk","origami","photographic","pixel-art","tile-texture"]).optional().meta({
    title: "风格预设",
    description: "图像风格预设（仅 Core 模型支持）"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于可重现的生成，范围 0-4294967294"
  }),
  "output_format": z.enum(["png","jpeg","webp"]).optional().meta({
    title: "输出格式",
    description: "生成图像的文件格式"
  })
});
const imageGenerateOutputSchema = z.object({
  "link": z.string().meta({
    title: "图片链接",
    description: "生成的图片访问链接"
  })
});
const imageGenerateHandler = createToolHandler({
  inputSchema: imageGenerateInputSchema,
  outputSchema: imageGenerateOutputSchema,
  secretSchema: imageGenerateSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await imageGenerateInputType.parseAsync({
      ...input,
      ...ctx.secrets
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
      "zh-CN": "Initial version",
    },
    toolDescription:
      "Stability AI image generation tools: Ultra for high-quality images, Core for balanced performance, and SD3.5 for advanced generation with model selection",
    tags: ["multimodal"],
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
      toolDescription:
        "Generate images from text prompts using Stability AI models including Ultra for highest quality, Core for balanced performance, and SD3.5 series for advanced generation capabilities",
      handler: imageGenerateHandler,
    },
  ],
});

export default toolSet;
