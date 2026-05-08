import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  "baseUrl": z.string().optional().meta({
    title: "BaseUrl",
    description: "默认为：https://api.openai.com/v1"
  }),
  "apiKey": z.string().meta({
    title: "API Key",
    description: "可以在 https://api.gpt.ge/pricing 获取"
  })
});
const imgEditingSecretSchema = z.object({});
const imgEditingInputSchema = z.object({
  "image": z.string().meta({
    title: "原始图片",
    description: "要编辑的原始图片，支持图片URL或base64编码，文件大小需小于4MB",
    toolDescription: "The original image to be edited (URL or base64)"
  }),
  "prompt": z.string().meta({
    title: "编辑描述",
    description: "描述要对图片进行的修改",
    toolDescription: "Describe what changes you want to make to the image"
  }),
  "size": z.enum(["1024x1024","1024x1536","1536x1024"]).optional().meta({
    title: "图片尺寸"
  }),
  "quality": z.enum(["medium","high","low"]).optional().meta({
    title: "图片质量"
  })
});
const imgEditingOutputSchema = z.object({
  "imageUrl": z.string().meta({
    title: "编辑后图片链接",
    description: "编辑后的图片文件链接"
  })
});
const imgEditingHandler = createToolHandler({
  inputSchema: imgEditingInputSchema,
  outputSchema: imgEditingOutputSchema,
  secretSchema: imgEditingSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await imgEditingInputType.parseAsync(input);
    const output = await imgEditingTool(parsedInput, ctx);
    return imgEditingOutputType.parseAsync(output);
  },
});

const imgGenerationSecretSchema = z.object({});
const imgGenerationInputSchema = z.object({
  "prompt": z.string().meta({
    title: "图像描述",
    description: "详细描述要生成的图像内容",
    toolDescription: "Describe the image you want to generate in detail"
  }),
  "size": z.enum(["1024x1024","1024x1536","1536x1024"]).optional().meta({
    title: "图片尺寸"
  }),
  "quality": z.enum(["medium","high","low"]).optional().meta({
    title: "图片质量"
  }),
  "background": z.enum(["auto","transparent","opaque"]).optional().meta({
    title: "背景透明度"
  }),
  "moderation": z.enum(["auto","low"]).optional().meta({
    title: "图片审查级别"
  })
});
const imgGenerationOutputSchema = z.object({
  "imageUrl": z.string().meta({
    title: "图片链接",
    description: "生成的图片文件链接"
  })
});
const imgGenerationHandler = createToolHandler({
  inputSchema: imgGenerationInputSchema,
  outputSchema: imgGenerationOutputSchema,
  secretSchema: imgGenerationSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await imgGenerationInputType.parseAsync(input);
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
      en: "This is a gpt-image image generation tool set",
      "zh-CN": "这是一个gpt-image 绘图工具集",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription: "gpt-image image generation tool set",
    tags: ["multimodal"],
  },
  secretSchema,
  children: [
    {
      id: "imgEditing",
      name: {
        en: "gpt-image Image Editing",
        "zh-CN": "gpt-image 图像编辑",
      },
      description: {
        en: "Edit and modify existing images using gpt-image-1 model",
        "zh-CN": "使用gpt-image-1模型对现有图像进行编辑和修改",
      },
      toolDescription:
        "Edit existing images using gpt-image-1 AI model. Supports image modification with optional mask for precise editing.",
      handler: imgEditingHandler,
    },
    {
      id: "imgGeneration",
      name: {
        en: "gpt-image Image Generation",
        "zh-CN": "gpt-image 图像生成",
      },
      description: {
        en: "Generate high-quality images from text descriptions using gpt-image-1 model",
        "zh-CN": "使用gpt-image-1模型根据文本描述生成高质量图像",
      },
      toolDescription:
        "Generate images from text prompts using gpt-image-1 AI model. Supports various sizes and quality settings.",
      handler: imgGenerationHandler,
    },
  ],
});

export default toolSet;
