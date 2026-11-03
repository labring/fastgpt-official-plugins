import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as paintInputType,
  OutputType as paintOutputType,
  tool as paintTool,
} from "./children/paint";
import {
  InputType as qwenImageInputType,
  OutputType as qwenImageOutputType,
  tool as qwenImageTool,
} from "./children/qwenImage";
import {
  InputType as qwenImageEdit2509InputType,
  OutputType as qwenImageEdit2509OutputType,
  tool as qwenImageEdit2509Tool,
} from "./children/qwenImageEdit2509";
import {
  InputType as wanAiInputType,
  OutputType as wanAiOutputType,
  tool as wanAiTool,
} from "./children/wanAi";

const secretSchema = z.object({
  authorization: z.string().meta({
    title: "Authorization token (without Bearer)",
    description: "SiliconFlow API token, for example sk-xxxx.",
    isSecret: true,
    "x-i18n": {
      title: {
        en: "Authorization token (without Bearer)",
        "zh-CN": "接口凭证（不需要 Bearer）",
      },
      description: {
        en: "SiliconFlow API token, for example sk-xxxx.",
        "zh-CN": "硅基流动 API 令牌，例如 sk-xxxx。",
      },
    },
  }),
});

const paintSecretSchema = z.object({});
const paintInputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Image prompt", "zh-CN": "绘图提示词" },
    description: {
      en: "Text prompt describing the image to generate.",
      "zh-CN": "描述要生成图像内容的文本提示词。",
    },
    isToolParam: true,
  },
  image_size: {
    type: z.enum([
      "1024x1024",
      "960x1280",
      "768x1024",
      "720x1440",
      "720x1280",
      "512x512",
      "2048x2048",
    ]),
    title: { en: "Image size", "zh-CN": "绘图尺寸" },
    description: {
      en: "Image resolution; supported sizes include 512x512, 1024x1024, and 2048x2048.",
      "zh-CN": "图像分辨率，支持 512x512、1024x1024、2048x2048 等尺寸。",
    },
    isToolParam: true,
  },
  batch_size: {
    type: z.number(),
    title: { en: "Number of images", "zh-CN": "输出图片数量" },
    description: {
      en: "Number of images to generate (1–4).",
      "zh-CN": "要生成的图片数量，范围为 1-4。",
    },
    isToolParam: true,
  },
  num_inference_steps: {
    type: z.number(),
    title: { en: "Inference steps", "zh-CN": "推理步数" },
    description: {
      en: "Number of inference steps (1–100).",
      "zh-CN": "推理步数，范围为 1-100。",
    },
    isToolParam: true,
  },
  guidance_scale: {
    type: z.number(),
    title: { en: "Guidance scale", "zh-CN": "引导尺度" },
    description: {
      en: "Controls how closely the image follows the prompt. Higher values follow the text more strictly; lower values allow more creativity and variation.",
      "zh-CN":
        "控制生成图像与提示词的匹配程度。值越高越严格匹配文本；值越低越有创造性和多样性。",
    },
    isToolParam: true,
  },
  negative_prompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "负面提示词" },
    description: {
      en: "Describe elements to exclude from the generated image.",
      "zh-CN": "描述生成图像中需要排除的元素。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Controls generation randomness; the same seed produces the same image (0–9999999999).",
      "zh-CN":
        "用于控制生成图像的随机性；相同种子将产生相同图像，范围为 0-9999999999。",
    },
    isToolParam: true,
  },
  image: {
    type: z.string().optional(),
    title: { en: "Reference image", "zh-CN": "参考图" },
    description: {
      en: 'Reference image as base64 data, for example "data:image/png;base64, XXX".',
      "zh-CN":
        '参考图片需转换为 base64 格式，例如 "data:image/png;base64, XXX"。',
    },
    isToolParam: true,
  },
});
const paintOutputSchema = defineOutputSchema({
  images: {
    type: z.array(z.string()),
    title: { en: "Generated images", "zh-CN": "生成的图片" },
    description: {
      en: "List of generated image URLs or data.",
      "zh-CN": "生成的图片列表。",
    },
  },
  timings: {
    type: z.number().optional(),
    title: { en: "Inference time", "zh-CN": "推理时间" },
    description: {
      en: "Timing information for inference.",
      "zh-CN": "推理过程的时间信息。",
    },
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Seed used to control image generation randomness.",
      "zh-CN": "用于控制图像生成随机性的种子。",
    },
  },
});

const paintHandler = createToolHandler({
  inputSchema: paintInputSchema,
  outputSchema: paintOutputSchema,
  secretSchema: paintSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await paintInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await paintTool(parsedInput);
    return paintOutputType.parseAsync(output);
  },
});

const qwenImageSecretSchema = z.object({});
const qwenImageInputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Image prompt", "zh-CN": "绘图提示词" },
    description: {
      en: "Text prompt describing the image to generate.",
      "zh-CN": "描述要生成图像内容的文本提示词。",
    },
    isToolParam: true,
  },
  image_size: {
    type: z.enum([
      "1328x1328",
      "1664x928",
      "928x1664",
      "1472x1140",
      "1140x1472",
      "1584x1056",
      "1056x1584",
    ]),
    title: { en: "Image size", "zh-CN": "绘图尺寸" },
    description: {
      en: "Resolution of the generated image; choose one of the supported sizes.",
      "zh-CN": "生成图像的分辨率，请选择支持的尺寸。",
    },
    isToolParam: true,
  },
  num_inference_steps: {
    type: z.number(),
    title: { en: "Inference steps", "zh-CN": "推理步数" },
    description: {
      en: "Number of inference steps (1–100).",
      "zh-CN": "推理步数，范围为 1-100。",
    },
    isToolParam: true,
  },
  negative_prompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "负面提示词" },
    description: {
      en: "Describe elements to exclude from the generated image.",
      "zh-CN": "描述生成图像中需要排除的元素。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Controls generation randomness; the same seed produces the same image (0–9999999999).",
      "zh-CN":
        "用于控制生成图像的随机性；相同种子将产生相同图像，范围为 0-9999999999。",
    },
    isToolParam: true,
  },
});
const qwenImageOutputSchema = defineOutputSchema({
  imageUrl: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "URL of the generated image.",
      "zh-CN": "生成图片的 URL。",
    },
  },
});

const qwenImageHandler = createToolHandler({
  inputSchema: qwenImageInputSchema,
  outputSchema: qwenImageOutputSchema,
  secretSchema: qwenImageSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await qwenImageInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await qwenImageTool(parsedInput);
    return qwenImageOutputType.parseAsync(output);
  },
});

const qwenImageEdit2509SecretSchema = z.object({});
const qwenImageEdit2509InputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Image prompt", "zh-CN": "绘图提示词" },
    description: {
      en: "Text prompt describing the desired image edits.",
      "zh-CN": "描述期望图像编辑效果的文本提示词。",
    },
    isToolParam: true,
  },
  image: {
    type: z.string(),
    title: { en: "Reference image 1", "zh-CN": "参考图片1" },
    description: {
      en: "First reference image as a URL or base64-encoded data.",
      "zh-CN": "第一张参考图片，支持 URL 或 base64 编码。",
    },
    isToolParam: true,
  },
  image2: {
    type: z.string().optional(),
    title: { en: "Reference image 2", "zh-CN": "参考图片2" },
    description: {
      en: "Optional second reference image as a URL or base64-encoded data.",
      "zh-CN": "可选的第二张参考图片，支持 URL 或 base64 编码。",
    },
    isToolParam: true,
  },
  image3: {
    type: z.string().optional(),
    title: { en: "Reference image 3", "zh-CN": "参考图片3" },
    description: {
      en: "Optional third reference image as a URL or base64-encoded data.",
      "zh-CN": "可选的第三张参考图片，支持 URL 或 base64 编码。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Controls generation randomness; the same seed produces the same image (0–9999999999).",
      "zh-CN":
        "用于控制生成图像的随机性；相同种子将产生相同图像，范围为 0-9999999999。",
    },
    isToolParam: true,
  },
  num_inference_steps: {
    type: z.number(),
    title: { en: "Inference steps", "zh-CN": "推理步数" },
    description: {
      en: "Number of inference steps (1–100).",
      "zh-CN": "推理步数，范围为 1-100。",
    },
    isToolParam: true,
  },
  negative_prompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "负面提示词" },
    description: {
      en: "Describe elements to exclude from the generated image.",
      "zh-CN": "描述生成图像中需要排除的元素。",
    },
    isToolParam: true,
  },
});
const qwenImageEdit2509OutputSchema = defineOutputSchema({
  imageUrl: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "URL of the edited image.",
      "zh-CN": "编辑后图片的 URL。",
    },
  },
});

const qwenImageEdit2509Handler = createToolHandler({
  inputSchema: qwenImageEdit2509InputSchema,
  outputSchema: qwenImageEdit2509OutputSchema,
  secretSchema: qwenImageEdit2509SecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await qwenImageEdit2509InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await qwenImageEdit2509Tool(parsedInput);
    return qwenImageEdit2509OutputType.parseAsync(output);
  },
});

const wanAiSecretSchema = z.object({});
const wanAiInputSchema = defineInputSchema({
  model: {
    type: z.enum([
      "Wan-AI/Wan2.1-T2V-14B",
      "Wan-AI/Wan2.1-T2V-14B-Turbo",
      "Wan-AI/Wan2.1-I2V-14B-720P",
      "Wan-AI/Wan2.1-I2V-14B-720P-Turbo",
    ]),
    title: { en: "Model", "zh-CN": "模型" },
    description: {
      en: "Model identifier; available models may change, so check SiliconFlow announcements.",
      "zh-CN":
        "对应模型名称。模型可能会定期调整，请关注硅基流动公告或消息通知。",
    },
    isToolParam: true,
  },
  prompt: {
    type: z.string(),
    title: { en: "Video prompt", "zh-CN": "提示词" },
    description: {
      en: "Text prompt describing the video to generate.",
      "zh-CN": "用于描述要生成视频内容的文本提示词。",
    },
    isToolParam: true,
  },
  image_size: {
    type: z.enum(["1280x720", "720x1280", "960x960"]),
    title: { en: "Video size", "zh-CN": "尺寸" },
    description: {
      en: "Aspect ratio and resolution of the generated video.",
      "zh-CN": "生成视频的长宽比和尺寸。",
    },
    isToolParam: true,
  },
  negative_prompt: {
    type: z.string().optional(),
    title: { en: "Negative prompt", "zh-CN": "负面提示词" },
    description: {
      en: "Describe elements to exclude from the generated video.",
      "zh-CN": "描述生成内容中需要排除的元素。",
    },
    isToolParam: true,
  },
  image: {
    type: z.string().optional(),
    title: { en: "Input image", "zh-CN": "输入图片" },
    description: {
      en: 'Required by some models; provide base64 data or an image URL, for example "data:image/png;base64,XXX".',
      "zh-CN":
        '部分模型必填，支持 base64 或图片 URL，例如 "data:image/png;base64,XXX" 或图片链接。',
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Seed", "zh-CN": "随机种子" },
    description: {
      en: "Controls the randomness of video generation.",
      "zh-CN": "用于控制视频生成的随机性。",
    },
    isToolParam: true,
  },
});
const wanAiOutputSchema = defineOutputSchema({
  url: {
    type: z.string(),
    title: { en: "Video URL", "zh-CN": "视频链接" },
    description: {
      en: "URL of the generated video.",
      "zh-CN": "生成视频的 URL。",
    },
  },
  status: {
    type: z.enum(["Succeed", "InQueue", "InProgress", "Failed"]),
    title: { en: "Status", "zh-CN": "状态" },
    description: {
      en: "Operation status: 'Succeed', 'InQueue', 'InProgress', or 'Failed'.",
      "zh-CN":
        "操作状态，可选值：'Succeed'、'InQueue'、'InProgress'、'Failed'。",
    },
  },
  results: {
    type: z.record(z.string(), z.unknown()),
    title: { en: "Results", "zh-CN": "结果" },
    description: {
      en: "Generated result object, including video, inference timing, seed, and other dynamic fields.",
      "zh-CN": "生成结果对象，包含视频、推理时间、种子等动态字段。",
    },
  },
});

const wanAiHandler = createToolHandler({
  inputSchema: wanAiInputSchema,
  outputSchema: wanAiOutputSchema,
  secretSchema: wanAiSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await wanAiInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await wanAiTool(parsedInput);
    return wanAiOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "silliconFlow",
    name: {
      en: "Silicon Flow",
      "zh-CN": "硅基流动",
    },
    description: {
      en: "This is a Silicon Flow tool set",
      "zh-CN": "这是一个硅基流动工具集",
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
      id: "paint",
      name: {
        en: "Kolors painting",
        "zh-CN": "Kolors 绘图",
      },
      description: {
        en: "Use the Kwai-Kolors/Kolors model provided by Silicon Flow for painting",
        "zh-CN": "采用硅基流动提供的Kwai-Kolors/Kolors 模型进行绘图",
      },
      handler: paintHandler,
    },
    {
      id: "qwenImage",
      name: {
        en: "Qwen-image",
        "zh-CN": "Qwen 图像生成",
      },
      description: {
        en: "Use the Qwen-image model provided by Silicon Flow for painting",
        "zh-CN": "采用硅基流动提供的Qwen-image 模型进行绘图",
      },
      handler: qwenImageHandler,
    },
    {
      id: "qwenImageEdit2509",
      name: {
        en: "Qwen-image-edit",
        "zh-CN": "Qwen 图像编辑",
      },
      description: {
        en: "Use the Qwen-imageedit-2509 model provided by Silicon Flow for painting",
        "zh-CN": "采用硅基流动提供的Qwen-image-edit-2509 模型进行绘图",
      },
      handler: qwenImageEdit2509Handler,
    },
    {
      id: "wanAi",
      name: {
        en: "Wan-AI Video Generation",
        "zh-CN": "Wan-AI 视频生成",
      },
      description: {
        en: "Use the Wan-AI model provided by Silicon Flow for video generation",
        "zh-CN": "采用硅基流动提供的Wan-AI 模型进行视频生成",
      },
      handler: wanAiHandler,
    },
  ],
});

export default toolSet;
