import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as star3InputType,
  OutputType as star3OutputType,
  tool as star3Tool,
} from "./children/star3";

const secretSchema = z.object({
  accessKey: z.string().meta({
    title: "Access key",
    description: "Get it from https://www.liblib.art/apis",
    isSecret: true,
    "x-i18n": {
      title: { en: "Access key", "zh-CN": "Access Key" },
      description: {
        en: "Get it from https://www.liblib.art/apis",
        "zh-CN": "可以在 https://www.liblib.art/apis 获取",
      },
    },
  }),
  secretKey: z.string().meta({
    title: "Secret key",
    description: "Get it from https://www.liblib.art/apis",
    isSecret: true,
    "x-i18n": {
      title: { en: "Secret key", "zh-CN": "Secret Key" },
      description: {
        en: "Get it from https://www.liblib.art/apis",
        "zh-CN": "可以在 https://www.liblib.art/apis 获取",
      },
    },
  }),
});
const star3SecretSchema = z.object({});
const star3InputSchema = defineInputSchema({
  prompt: {
    type: z.string(),
    title: { en: "Image prompt", "zh-CN": "绘画提示词" },
    description: {
      en: "Prompt describing the image to generate.",
      "zh-CN": "描述要生成图像的绘画提示词",
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
      en: "Image resolution. Allowed values: 512*1024, 768*512, 768*1024, 1024*576, 576*1024, 1024*1024.",
      "zh-CN":
        "生成图像的分辨率，可选值：512*1024、768*512、768*1024、1024*576、576*1024、1024*1024",
    },
    isToolParam: true,
  },
});
const star3OutputSchema = defineOutputSchema({
  link: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片链接" },
    description: {
      en: "URL of the generated image.",
      "zh-CN": "生成图片的链接",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error message", "zh-CN": "错误消息" },
    description: {
      en: "Error returned during image generation, if any.",
      "zh-CN": "图像生成过程中返回的错误信息（如有）",
    },
  },
});
const star3Handler = createToolHandler({
  inputSchema: star3InputSchema,
  outputSchema: star3OutputSchema,
  secretSchema: star3SecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await star3InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await star3Tool(parsedInput);
    return star3OutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "libulibu",
    name: {
      en: "Libulibu Tool Set",
      "zh-CN": "libulibu 工具集",
    },
    description: {
      en: "Libulibu Tool Set",
      "zh-CN": "libulibu 工具集",
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
      id: "star3",
      name: {
        en: "star3",
        "zh-CN": "星流 3",
      },
      description: {
        en: "Used to interact with the libulibu Star3 model",
        "zh-CN": "用以与libulibu星流3模型交互",
      },
      handler: star3Handler,
    },
  ],
});

export default toolSet;
