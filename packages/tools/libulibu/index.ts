import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as star3InputType,
  OutputType as star3OutputType,
  tool as star3Tool,
} from "./children/star3";

const secretSchema = z.object({
  "accessKey": z.string().meta({
    title: "accessKey",
    description: "可以在 https://www.liblib.art/apis 获取",
    isSecret: true,
  }),
  "secretKey": z.string().meta({
    title: "secretKey",
    description: "可以在 https://www.liblib.art/apis 获取",
    isSecret: true,
  })
});
const star3SecretSchema = z.object({});
const star3InputSchema = z.object({
  "prompt": z.string().meta({
    title: "绘画提示词",
    toolDescription: "绘画提示词"
  }),
  "size": z.enum(["512*1024","768*512","768*1024","1024*576","576*1024","1024*1024"]).optional().meta({
    title: "图像尺寸",
    description: "设置生成图像的分辨率",
    toolDescription: "设置生成图像的分辨率, 可选值: 512*1024, 768*512, 768*1024, 1024*576, 576*1024, 1024*1024"
  })
});
const star3OutputSchema = z.object({
  "link": z.string().meta({
    title: "图片链接",
    description: "绘画结果图片链接"
  }),
  "error": z.string().optional().meta({
    title: "错误消息"
  })
});
const star3Handler = createToolHandler({
  inputSchema: star3InputSchema,
  outputSchema: star3OutputSchema,
  secretSchema: star3SecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await star3InputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await star3Tool(parsedInput, ctx);
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
      "zh-CN": "Initial version",
    },
    tags: ["multimodal"],
  },
  secretSchema,
  children: [
    {
      id: "star3",
      name: {
        en: "star3",
        "zh-CN": "star3",
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
