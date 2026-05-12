import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as NanoBananaInputType,
  OutputType as NanoBananaOutputType,
  tool as NanoBananaTool,
} from "./children/NanoBanana";

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "API Key"
  })
});
const NanoBananaSecretSchema = z.object({});
const NanoBananaInputSchema = z.object({
  "text": z.string().meta({
    title: "提示词",
    description: "生成图片的提示词",
    toolDescription: "生成图片的提示词"
  }),
  "aspect_ratio": z.enum(["1:1","2:3","3:4","4:3","2:1","3:2","16:9","9:16","21:9","9:21"]).meta({
    title: "宽高比",
    description: "图像的宽高比，例如 \"1:1\", \"16:9\", \"3:4\" 等，支持从 1:1 到 21:9"
  }),
  "model": z.enum(["google/gemini-2.5-flash-image-preview"]).meta({
    title: "模型"
  })
});
const NanoBananaOutputSchema = z.object({
  "imageUrl": z.string().meta({
    title: "图片链接"
  })
});
const NanoBananaHandler = createToolHandler({
  inputSchema: NanoBananaInputSchema,
  outputSchema: NanoBananaOutputSchema,
  secretSchema: NanoBananaSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await NanoBananaInputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await NanoBananaTool(parsedInput, ctx);
    return NanoBananaOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "openrouterMultiModal",
    name: {
      en: "OpenRouter Multi-Modal",
      "zh-CN": "OpenRouter 多模态",
    },
    description: {
      en: "This is an OpenRouter multi-modal tool set, supporting various model services provided by the OpenRouter platform",
      "zh-CN":
        "这是一个OpenRouter 多模态工具集，支持调用多种OpenRouter平台提供的模型服务",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "This is an OpenRouter multi-modal tool set, supporting various model services provided by the OpenRouter platform",
    tags: ["multimodal"],
  },
  secretSchema,
  children: [
    {
      id: "NanoBanana",
      name: {
        en: "Nano Banana Text-to-Image",
        "zh-CN": "Nano Banana 文生图",
      },
      description: {
        en: "Convert text descriptions to images using Nano Banana models.",
        "zh-CN": "使用Nano Banana模型将文本描述转换为图像。",
      },
      toolDescription:
        "Convert text descriptions to images using Nano Banana models.",
      handler: NanoBananaHandler,
    },
  ],
});

export default toolSet;
