import { createToolHandler, defineToolSet } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import { InputType as paintInputType, OutputType as paintOutputType, tool as paintTool } from './children/paint';
import { InputType as qwenImageInputType, OutputType as qwenImageOutputType, tool as qwenImageTool } from './children/qwenImage';
import { InputType as qwenImageEdit2509InputType, OutputType as qwenImageEdit2509OutputType, tool as qwenImageEdit2509Tool } from './children/qwenImageEdit2509';
import { InputType as wanAiInputType, OutputType as wanAiOutputType, tool as wanAiTool } from './children/wanAi';

const secretSchema = z.object({
  "authorization": z.string().meta({
    title: "接口凭证（不需要 Bearer）",
    description: "sk-xxxx"
  })
});

const paintSecretSchema = z.object({});
const paintInputSchema = z.object({
  "prompt": z.string().meta({
    title: "绘图提示词",
    toolDescription: "绘图提示词"
  }),
  "image_size": z.enum(["1024x1024","960x1280","768x1024","720x1440","720x1280","512x512","2048x2048"]).meta({
    title: "绘图尺寸",
    description: "绘图尺寸，支持 512x512, 1024x1024, 2048x2048"
  }),
  "batch_size": z.number().meta({
    title: "输出图片数量",
    description: "生成的图片数量，范围为 1-4"
  }),
  "num_inference_steps": z.number().meta({
    title: "推理步数",
    description: "推理步数，范围为 1-100"
  }),
  "guidance_scale": z.number().meta({
    title: "引导尺度",
    description: "控制生成图像与提示词的匹配程度。值越高，生成图像越倾向于严格匹配文本提示。值越低，生成图像越具有创造性和多样性，可能包含更多意想不到的元素。"
  }),
  "negative_prompt": z.string().optional().meta({
    title: "负面提示词",
    description: "用于排除不希望出现在生成图像中的元素",
    toolDescription: "负面提示词"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于控制生成图像的随机性。相同的种子将产生相同的图像。范围为 0-9999999999"
  }),
  "image": z.string().optional().meta({
    title: "参考图",
    description: "需要上传的图片应转换为 base64 格式，如 \"data:image/png;base64, XXX\"。例如：\"data:image/png;base64, XXX\""
  })
});
const paintOutputSchema = z.object({
  "images": z.array(z.string()).meta({
    title: "生成的图片",
    description: "生成的图片列表"
  }),
  "timings": z.number().optional().meta({
    title: "推理时间",
    description: "推理过程的时间信息"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于控制生成图像的随机性"
  })
});

const paintHandler = createToolHandler({
  inputSchema: paintInputSchema,
  outputSchema: paintOutputSchema,
  secretSchema: paintSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await paintInputType.parseAsync(input);
    const output = await paintTool(parsedInput, ctx);
    return paintOutputType.parseAsync(output);
  }
});

const qwenImageSecretSchema = z.object({});
const qwenImageInputSchema = z.object({
  "prompt": z.string().meta({
    title: "绘图提示词",
    toolDescription: "绘图提示词"
  }),
  "image_size": z.enum(["1328x1328","1664x928","928x1664","1472x1140","1140x1472","1584x1056","1056x1584"]).meta({
    title: "绘图尺寸",
    description: "绘图尺寸，支持 512x512, 1024x1024, 2048x2048"
  }),
  "num_inference_steps": z.number().meta({
    title: "推理步数",
    description: "推理步数，范围为 1-100"
  }),
  "negative_prompt": z.string().optional().meta({
    title: "负面提示词",
    description: "用于排除不希望出现在生成图像中的元素",
    toolDescription: "负面提示词"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于控制生成图像的随机性。相同的种子将产生相同的图像。范围为 0-9999999999"
  })
});
const qwenImageOutputSchema = z.object({
  "imageUrl": z.string().meta({
    title: "图片链接"
  })
});

const qwenImageHandler = createToolHandler({
  inputSchema: qwenImageInputSchema,
  outputSchema: qwenImageOutputSchema,
  secretSchema: qwenImageSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await qwenImageInputType.parseAsync(input);
    const output = await qwenImageTool(parsedInput, ctx);
    return qwenImageOutputType.parseAsync(output);
  }
});

const qwenImageEdit2509SecretSchema = z.object({});
const qwenImageEdit2509InputSchema = z.object({
  "prompt": z.string().meta({
    title: "绘图提示词",
    toolDescription: "绘图提示词"
  }),
  "image": z.string().meta({
    title: "参考图片1",
    description: "参考图片URL或base64编码",
    toolDescription: "参考图片1 (URL或base64格式)"
  }),
  "image2": z.string().optional().meta({
    title: "参考图片2",
    description: "参考图片URL或base64编码",
    toolDescription: "参考图片2 (URL或base64格式)"
  }),
  "image3": z.string().optional().meta({
    title: "参考图片3",
    description: "参考图片URL或base64编码",
    toolDescription: "参考图片3 (URL或base64格式)"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于控制生成图像的随机性。相同的种子将产生相同的图像。范围为 0-9999999999"
  }),
  "num_inference_steps": z.number().meta({
    title: "推理步数",
    description: "推理步数，范围为 1-100"
  }),
  "negative_prompt": z.string().optional().meta({
    title: "负面提示词",
    description: "用于排除不希望出现在生成图像中的元素",
    toolDescription: "负面提示词"
  })
});
const qwenImageEdit2509OutputSchema = z.object({
  "imageUrl": z.string().meta({
    title: "图片链接"
  })
});

const qwenImageEdit2509Handler = createToolHandler({
  inputSchema: qwenImageEdit2509InputSchema,
  outputSchema: qwenImageEdit2509OutputSchema,
  secretSchema: qwenImageEdit2509SecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await qwenImageEdit2509InputType.parseAsync(input);
    const output = await qwenImageEdit2509Tool(parsedInput, ctx);
    return qwenImageEdit2509OutputType.parseAsync(output);
  }
});

const wanAiSecretSchema = z.object({});
const wanAiInputSchema = z.object({
  "model": z.enum(["Wan-AI/Wan2.1-T2V-14B","Wan-AI/Wan2.1-T2V-14B-Turbo","Wan-AI/Wan2.1-I2V-14B-720P","Wan-AI/Wan2.1-I2V-14B-720P-Turbo"]).meta({
    title: "模型",
    description: "对应模型名称。模型可能会定期调整，请关注公告或消息通知。"
  }),
  "prompt": z.string().meta({
    title: "提示词",
    description: "用于生成视频描述的文本提示词",
    toolDescription: "视频生成的文本提示词"
  }),
  "image_size": z.enum(["1280x720","720x1280","960x960"]).meta({
    title: "尺寸",
    description: "生成内容的长宽比"
  }),
  "negative_prompt": z.string().optional().meta({
    title: "负面提示词",
    description: "用于排除不希望出现在生成内容中的元素",
    toolDescription: "负面提示词"
  }),
  "image": z.string().optional().meta({
    title: "输入图片",
    description: "部分模型必填，支持 base64 或图片 URL。例如：\"data:image/png;base64,XXX\" 或图片链接"
  }),
  "seed": z.number().optional().meta({
    title: "随机种子",
    description: "用于控制生成内容的随机性"
  })
});
const wanAiOutputSchema = z.object({
  "url": z.string().meta({
    title: "视频链接"
  }),
  "status": z.enum(["Succeed","InQueue","InProgress","Failed"]).meta({
    title: "状态",
    description: "操作状态。可选值：'Succeed','InQueue','InProgress','Failed'"
  }),
  "results": z.record(z.string(), z.unknown()).meta({
    title: "结果",
    description: "生成结果对象，包含视频、推理时间、种子等信息"
  })
});

const wanAiHandler = createToolHandler({
  inputSchema: wanAiInputSchema,
  outputSchema: wanAiOutputSchema,
  secretSchema: wanAiSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wanAiInputType.parseAsync(input);
    const output = await wanAiTool(parsedInput, ctx);
    return wanAiOutputType.parseAsync(output);
  }
});

const toolSet = defineToolSet({
  manifest: {
  "pluginId": "silliconFlow",
  "name": {
    "en": "Silicon Flow",
    "zh-CN": "硅基流动"
  },
  "description": {
    "en": "This is a Silicon Flow tool set",
    "zh-CN": "这是一个硅基流动工具集"
  },
  "version": "0.0.1",
  "versionDescription": {
    "en": "Initial version",
    "zh-CN": "Initial version"
  },
  "tags": [
    "multimodal"
  ]
},
  secretSchema,
  children: [
    {
      id: "paint",
      name: {
  "en": "Kolors painting",
  "zh-CN": "Kolors画图"
},
      description: {
  "en": "Use the Kwai-Kolors/Kolors model provided by Silicon Flow for painting",
  "zh-CN": "采用硅基流动提供的Kwai-Kolors/Kolors 模型进行绘图"
},
      handler: paintHandler
    },
    {
      id: "qwenImage",
      name: {
  "en": "Qwen-image",
  "zh-CN": "Qwen-image"
},
      description: {
  "en": "Use the Qwen-image model provided by Silicon Flow for painting",
  "zh-CN": "采用硅基流动提供的Qwen-image 模型进行绘图"
},
      handler: qwenImageHandler
    },
    {
      id: "qwenImageEdit2509",
      name: {
  "en": "Qwen-image-edit",
  "zh-CN": "Qwen-image-edit"
},
      description: {
  "en": "Use the Qwen-imageedit-2509 model provided by Silicon Flow for painting",
  "zh-CN": "采用硅基流动提供的Qwen-image-edit-2509 模型进行绘图"
},
      handler: qwenImageEdit2509Handler
    },
    {
      id: "wanAi",
      name: {
  "en": "Wan-AI Video Generation",
  "zh-CN": "Wan-AI 视频生成"
},
      description: {
  "en": "Use the Wan-AI model provided by Silicon Flow for video generation",
  "zh-CN": "采用硅基流动提供的Wan-AI 模型进行视频生成"
},
      handler: wanAiHandler
    }
  ]
});

export default toolSet;
