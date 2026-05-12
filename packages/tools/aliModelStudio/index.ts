import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
  "apiKey": z.string().meta({
    title: "API Key"
  })
});
const fluxSecretSchema = z.object({});
const fluxInputSchema = z.object({
  "prompt": z.string().meta({
    title: "文本提示词",
    description: "文本内容，支持中英文，中文不超过500个字符，英文不超过500个单词",
    toolDescription: "文本提示词"
  }),
  "model": z.enum(["flux-schnell","flux-dev","flux-merged"]).optional().meta({
    title: "模型名称",
    description: "选择要使用的FLUX模型"
  }),
  "size": z.enum(["512*1024","768*512","768*1024","1024*576","576*1024","1024*1024"]).optional().meta({
    title: "图像尺寸",
    description: "设置生成图像的分辨率"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "图片生成时候的种子值，如果不提供，则算法自动用一个随机生成的数字作为种子"
  }),
  "steps": z.number().optional().meta({
    title: "推理步数",
    description: "图片生成的推理步数，如果不提供，则默认为30。flux-schnell模型官方默认steps为4，flux-dev模型官方默认steps为50"
  }),
  "guidance": z.number().optional().meta({
    title: "指导度量值",
    description: "用于在图像生成过程中调整模型的创造性与文本指导的紧密度。较高的值会使得生成的图像更忠于文本提示，但可能减少多样性；较低的值则允许更多创造性，增加图像变化。默认值为3.5"
  }),
  "offload": z.boolean().optional().meta({
    title: "GPU卸载",
    description: "是否在采样过程中将部分计算密集型组件临时从GPU卸载到CPU，以减轻内存压力或提升效率。默认为False"
  }),
  "add_sampling_metadata": z.boolean().optional().meta({
    title: "添加元数据",
    description: "是否在输出的图像文件中嵌入生成时使用的提示文本等元数据信息。默认为True"
  })
});
const fluxOutputSchema = z.object({
  "images": z.array(z.string()).meta({
    title: "生成的图片",
    description: "包含图片URL的数组"
  }),
  "error": z.string().optional().meta({
    title: "错误信息"
  })
});
const fluxHandler = createToolHandler({
  inputSchema: fluxInputSchema,
  outputSchema: fluxOutputSchema,
  secretSchema: fluxSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await fluxInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await fluxTool(parsedInput, ctx);
    return fluxOutputType.parseAsync(output);
  },
});

const qwenTx2ImgSecretSchema = z.object({});
const qwenTx2ImgInputSchema = z.object({
  "prompt": z.string().meta({
    title: "正向提示词",
    description: "描述期望生成的图像内容，支持中英文，长度不超过800个字符",
    toolDescription: "文本提示词"
  }),
  "image1": z.string().meta({
    title: "图片1",
    description: "第一张输入图片的URL或Base64编码数据（必需）",
    toolDescription: "第一张输入图片"
  }),
  "image2": z.string().optional().meta({
    title: "图片2",
    description: "第二张输入图片的URL或Base64编码数据（可选）",
    toolDescription: "第二张输入图片"
  }),
  "image3": z.string().optional().meta({
    title: "图片3",
    description: "第三张输入图片的URL或Base64编码数据（可选）",
    toolDescription: "第三张输入图片"
  }),
  "negative_prompt": z.string().optional().meta({
    title: "反向提示词",
    description: "描述不希望在画面中看到的内容，长度不超过500个字符",
    toolDescription: "反向提示词"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于控制模型生成内容的随机性，相同种子会生成相似结果，最小值为0，最大值为2147483647"
  })
});
const qwenTx2ImgOutputSchema = z.object({
  "image": z.string().meta({
    title: "生成的图片",
    description: "生成图片的URL"
  })
});
const qwenTx2ImgHandler = createToolHandler({
  inputSchema: qwenTx2ImgInputSchema,
  outputSchema: qwenTx2ImgOutputSchema,
  secretSchema: qwenTx2ImgSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await qwenTx2ImgInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await qwenTx2ImgTool(parsedInput, ctx);
    return qwenTx2ImgOutputType.parseAsync(output);
  },
});

const wanxTxt2ImgV2SecretSchema = z.object({});
const wanxTxt2ImgV2InputSchema = z.object({
  "model": z.enum(["wanx2.1-t2i-turbo","wanx2.1-t2i-plus","wanx2.0-t2i-turbo"]).optional().meta({
    title: "模型名称",
    description: "选择要使用的通义万相模型"
  }),
  "prompt": z.string().meta({
    title: "正向提示词",
    description: "描述期望生成的图像内容，支持中英文，长度不超过800个字符",
    toolDescription: "文本提示词"
  }),
  "negative_prompt": z.string().optional().meta({
    title: "反向提示词",
    description: "描述不希望在画面中看到的内容，长度不超过500个字符",
    toolDescription: "反向提示词"
  }),
  "size": z.enum(["512*512","512*1024","768*768","768*1024","1024*512","1024*768","1024*1024","1280*720","1440*720"]).optional().meta({
    title: "图像尺寸",
    description: "设置生成图像的分辨率"
  }),
  "n": z.number().optional().meta({
    title: "生成数量",
    description: "生成图片的数量，取值范围为1~4张"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于控制模型生成内容的随机性，相同种子会生成相似结果"
  }),
  "prompt_extend": z.boolean().optional().meta({
    title: "智能改写",
    description: "是否开启prompt智能改写，开启后会使用大模型对输入prompt进行智能改写"
  }),
  "watermark": z.boolean().optional().meta({
    title: "添加水印",
    description: "是否添加AI生成水印标识，水印位于图片右下角"
  })
});
const wanxTxt2ImgV2OutputSchema = z.object({
  "images": z.array(z.string()).meta({
    title: "生成的图片",
    description: "生成图片的URL数组"
  }),
  "error": z.string().optional().meta({
    title: "错误信息"
  })
});
const wanxTxt2ImgV2Handler = createToolHandler({
  inputSchema: wanxTxt2ImgV2InputSchema,
  outputSchema: wanxTxt2ImgV2OutputSchema,
  secretSchema: wanxTxt2ImgV2SecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wanxTxt2ImgV2InputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await wanxTxt2ImgV2Tool(parsedInput, ctx);
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
        en: "Qwen-Image-Edit supports multi-image editing, can accurately modify text in the image, add, delete or move objects, change the main action, migrate image style and enhance image details.",
        "zh-CN":
          "通义千问-图像编辑模型（Qwen-Image-Edit）支持多图编辑，可精确修改图内文字、增删或移动物体、改变主体动作、迁移图片风格及增强画面细节。",
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
