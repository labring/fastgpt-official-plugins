import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as fluxInputType,
  OutputType as fluxOutputType,
  tool as fluxTool,
} from "./children/flux";
import {
  InputType as qwenTx2ImgInputType,
  OutputType as qwenTx2ImgOutputType,
  tool as qwenTx2ImgTool,
} from "./children/qwenTx2Img";
import {
  InputType as wanxTxt2ImgV2InputType,
  OutputType as wanxTxt2ImgV2OutputType,
  tool as wanxTxt2ImgV2Tool,
} from "./children/wanxTxt2ImgV2";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "API Key",
    description: "Alibaba Cloud Model Studio API key.",
    "x-i18n": {
      title: { en: "API key", "zh-CN": "API 密钥" },
      description: {
        en: "Alibaba Cloud Model Studio API key.",
        "zh-CN": "阿里云百炼平台 API 密钥。",
      },
    },
    isSecret: true,
  }),
});
const fluxSecretSchema = z.object({});
const fluxInputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Prompt", "zh-CN": "文本提示词" },
    description: {
      en: "Text prompt in Chinese or English (up to 500 Chinese characters or 500 English words).",
      "zh-CN":
        "文本内容，支持中英文，中文不超过 500 个字符，英文不超过 500 个单词。",
    },
    isToolParam: true,
  },
  model: {
    type: z.enum(["flux-schnell", "flux-dev", "flux-merged"]).optional(),
    title: { en: "Model", "zh-CN": "模型名称" },
    description: {
      en: "FLUX model to use.",
      "zh-CN": "选择要使用的 FLUX 模型。",
    },
    isToolParam: true,
  },
  size: {
    type: z
      .enum([
        "512*1024",
        "768*512",
        "768*1024",
        "1024*576",
        "576*1024",
        "1024*1024",
      ])
      .optional(),
    title: { en: "Image size", "zh-CN": "图像尺寸" },
    description: {
      en: "Resolution of the generated image.",
      "zh-CN": "设置生成图像的分辨率。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Seed for generation; a random seed is used when omitted.",
      "zh-CN": "图片生成时使用的种子值；不提供时自动随机生成。",
    },
    isToolParam: true,
  },
  steps: {
    type: z.number().optional(),
    title: { en: "Inference steps", "zh-CN": "推理步数" },
    description: {
      en: "Number of inference steps. Defaults to 30; official defaults are 4 for flux-schnell and 50 for flux-dev.",
      "zh-CN":
        "图片生成的推理步数，默认 30；flux-schnell 官方默认 4，flux-dev 官方默认 50。",
    },
    isToolParam: true,
  },
  guidance: {
    type: z.number().optional(),
    title: { en: "Guidance scale", "zh-CN": "指导度量值" },
    description: {
      en: "Controls creativity versus prompt adherence. Higher values follow the prompt more closely; default is 3.5.",
      "zh-CN":
        "调整创造性与文本指导的紧密度。值越高越忠于文本提示但多样性可能降低；默认值为 3.5。",
    },
    isToolParam: true,
  },
  offload: {
    type: z.boolean().optional(),
    title: { en: "GPU offloading", "zh-CN": "GPU 卸载" },
    description: {
      en: "Temporarily offload compute-intensive components from GPU to CPU during sampling; defaults to false.",
      "zh-CN":
        "采样时是否将部分计算密集型组件从 GPU 临时卸载到 CPU；默认为 false。",
    },
    isToolParam: true,
  },
  add_sampling_metadata: {
    type: z.boolean().optional(),
    title: { en: "Add metadata", "zh-CN": "添加元数据" },
    description: {
      en: "Embed generation prompt and other metadata in the output image; defaults to true.",
      "zh-CN": "是否在输出图像中嵌入生成提示词等元数据；默认为 true。",
    },
    isToolParam: true,
  },
});
const fluxOutputSchema = defineOutputSchema({
  images: {
    type: z.array(z.string()),
    title: { en: "Generated images", "zh-CN": "生成的图片" },
    description: {
      en: "Array of image URLs.",
      "zh-CN": "包含图片 URL 的数组。",
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
const fluxHandler = createToolHandler({
  inputSchema: fluxInputSchema,
  outputSchema: fluxOutputSchema,
  secretSchema: fluxSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await fluxInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await fluxTool(parsedInput);
    return fluxOutputType.parseAsync(output);
  },
});

const qwenTx2ImgSecretSchema = z.object({});
const qwenTx2ImgInputSchema = defineInputSchema({
  model: {
    type: qwenTx2ImgInputType.shape.model,
    title: { en: "Model", "zh-CN": "模型名称" },
    description: {
      en: "Qwen image editing model; defaults to qwen-image-2.0-pro.",
      "zh-CN": "选择千问图像编辑模型，默认使用 qwen-image-2.0-pro。",
    },
    isToolParam: true,
  },
  prompt: {
    type: z.string(),
    title: { en: "Positive prompt", "zh-CN": "正向提示词" },
    description: {
      en: "Describe the desired image in Chinese or English, up to 1300 tokens.",
      "zh-CN": "描述期望生成的图像内容，支持中英文，长度上限为 1300 Token。",
    },
    isToolParam: true,
  },
  image1: {
    type: z.string(),
    title: { en: "Image 1", "zh-CN": "图片 1" },
    description: {
      en: "Required URL or base64-encoded data for the first input image.",
      "zh-CN": "第一张输入图片的 URL 或 Base64 编码数据（必需）。",
    },
    isToolParam: true,
  },
  image2: {
    type: z.string().optional(),
    title: { en: "Image 2", "zh-CN": "图片 2" },
    description: {
      en: "Optional URL or base64-encoded data for the second input image.",
      "zh-CN": "第二张输入图片的 URL 或 Base64 编码数据（可选）。",
    },
    isToolParam: true,
  },
  image3: {
    type: z.string().optional(),
    title: { en: "Image 3", "zh-CN": "图片 3" },
    description: {
      en: "Optional URL or base64-encoded data for the third input image.",
      "zh-CN": "第三张输入图片的 URL 或 Base64 编码数据（可选）。",
    },
    isToolParam: true,
  },
  negative_prompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "反向提示词" },
    description: {
      en: "Describe content to exclude from the image, up to 500 characters.",
      "zh-CN": "描述不希望在画面中看到的内容，长度不超过 500 个字符。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Controls randomness; the same seed produces similar results (0–2147483647).",
      "zh-CN":
        "用于控制模型生成内容的随机性，相同种子会生成相似结果，范围为 0 至 2147483647。",
    },
    isToolParam: true,
  },
});
const qwenTx2ImgOutputSchema = defineOutputSchema({
  image: {
    type: z.string(),
    title: { en: "Generated image", "zh-CN": "生成的图片" },
    description: {
      en: "URL of the generated image.",
      "zh-CN": "生成图片的 URL。",
    },
  },
});
const qwenTx2ImgHandler = createToolHandler({
  inputSchema: qwenTx2ImgInputSchema,
  outputSchema: qwenTx2ImgOutputSchema,
  secretSchema: qwenTx2ImgSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await qwenTx2ImgInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await qwenTx2ImgTool(parsedInput);
    return qwenTx2ImgOutputType.parseAsync(output);
  },
});

const wanxTxt2ImgV2SecretSchema = z.object({});
const wanxTxt2ImgV2InputSchema = defineInputSchema({
  model: {
    type: z
      .enum(["wanx2.1-t2i-turbo", "wanx2.1-t2i-plus", "wanx2.0-t2i-turbo"])
      .optional(),
    title: { en: "Model", "zh-CN": "模型名称" },
    description: {
      en: "Tongyi Wanxiang model to use.",
      "zh-CN": "选择要使用的通义万相模型。",
    },
    isToolParam: true,
  },
  prompt: {
    type: z.string(),
    title: { en: "Positive prompt", "zh-CN": "正向提示词" },
    description: {
      en: "Describe the desired image in Chinese or English, up to 800 characters.",
      "zh-CN": "描述期望生成的图像内容，支持中英文，长度不超过 800 个字符。",
    },
    isToolParam: true,
  },
  negative_prompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "反向提示词" },
    description: {
      en: "Describe content to exclude from the image, up to 500 characters.",
      "zh-CN": "描述不希望在画面中看到的内容，长度不超过 500 个字符。",
    },
    isToolParam: true,
  },
  size: {
    type: z
      .enum([
        "512*512",
        "512*1024",
        "768*768",
        "768*1024",
        "1024*512",
        "1024*768",
        "1024*1024",
        "1280*720",
        "1440*720",
      ])
      .optional(),
    title: { en: "Image size", "zh-CN": "图像尺寸" },
    description: {
      en: "Resolution of the generated image.",
      "zh-CN": "设置生成图像的分辨率。",
    },
    isToolParam: true,
  },
  n: {
    type: z.number().optional(),
    title: { en: "Image count", "zh-CN": "生成数量" },
    description: {
      en: "Number of images to generate (1–4).",
      "zh-CN": "生成图片的数量，取值范围为 1 至 4 张。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Controls randomness; the same seed produces similar results.",
      "zh-CN": "用于控制模型生成内容的随机性，相同种子会生成相似结果。",
    },
    isToolParam: true,
  },
  prompt_extend: {
    type: z.boolean().optional(),
    title: { en: "Prompt enhancement", "zh-CN": "智能改写" },
    description: {
      en: "Whether to use a language model to enhance the prompt.",
      "zh-CN": "是否开启提示词智能改写，开启后会使用大模型优化输入提示词。",
    },
    isToolParam: true,
  },
  watermark: {
    type: z.boolean().optional(),
    title: { en: "Add watermark", "zh-CN": "添加水印" },
    description: {
      en: "Whether to add an AI-generated watermark at the bottom right of the image.",
      "zh-CN": "是否添加 AI 生成水印标识，水印位于图片右下角。",
    },
    isToolParam: true,
  },
});
const wanxTxt2ImgV2OutputSchema = defineOutputSchema({
  images: {
    type: z.array(z.string()),
    title: { en: "Generated images", "zh-CN": "生成的图片" },
    description: {
      en: "Array of generated image URLs.",
      "zh-CN": "生成图片的 URL 数组。",
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
const wanxTxt2ImgV2Handler = createToolHandler({
  inputSchema: wanxTxt2ImgV2InputSchema,
  outputSchema: wanxTxt2ImgV2OutputSchema,
  secretSchema: wanxTxt2ImgV2SecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wanxTxt2ImgV2InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await wanxTxt2ImgV2Tool(parsedInput);
    return wanxTxt2ImgV2OutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "aliModelStudio",
    name: {
      en: "Aliyun Model Studio",
      "zh-CN": "阿里云百炼",
    },
    description: {
      en: "This is an Aliyun Model Studio toolset, supporting various model services provided by the Aliyun Model Studio platform",
      "zh-CN":
        "这是一个阿里云百炼工具集，支持调用多种阿里云百炼平台提供的模型服务",
    },
    version: "0.0.2",
    versionDescription: {
      en: "Replace the retired Qwen image editing model and support model selection",
      "zh-CN": "替换已下架的千问图像编辑模型，支持模型选择",
    },
    tags: ["multimodal"],
  },
  secretSchema,
  children: [
    {
      id: "flux",
      name: {
        en: "FLUX Text-to-Image",
        "zh-CN": "FLUX文生图",
      },
      description: {
        en: "Convert text descriptions to images using Alibaba Cloud FLUX models. Supports flux-schnell, flux-dev, flux-merged models with high-quality image generation capabilities.",
        "zh-CN":
          "使用阿里云百炼FLUX模型将文本描述转换为图像。支持flux-schnell、flux-dev、flux-merged等模型，提供高质量的图像生成能力。",
      },
      handler: fluxHandler,
    },
    {
      id: "qwenTx2Img",
      name: {
        en: "Qwen Image Editing",
        "zh-CN": "通义千问图像编辑",
      },
      description: {
        en: "Qwen-Image 2.0 supports model selection and multi-image editing to modify text, add, delete or move objects, change actions, transfer styles and enhance details.",
        "zh-CN":
          "通义千问图像编辑支持选择 Qwen-Image 2.0 系列模型及多图编辑，可精确修改图内文字、增删或移动物体、改变主体动作、迁移图片风格及增强画面细节。",
      },
      handler: qwenTx2ImgHandler,
    },
    {
      id: "wanxTxt2ImgV2",
      name: {
        en: "Qwen Wanx Text-to-Image",
        "zh-CN": "通义万相文生图v2",
      },
      description: {
        en: "Convert text descriptions to images using Alibaba Qwen Wanx models. Supports multiple models, custom sizes, intelligent prompt enhancement, and more.",
        "zh-CN":
          "使用阿里云百炼通义万相模型将文本描述转换为图像。支持多种模型、自定义尺寸、智能提示词改写等功能。",
      },
      handler: wanxTxt2ImgV2Handler,
    },
  ],
});

export default toolSet;
