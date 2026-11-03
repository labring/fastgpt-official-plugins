import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as toFileInputType,
  OutputType as toFileOutputType,
  tool as toFileTool,
} from "./children/toFile";
import {
  InputType as toImageInputType,
  OutputType as toImageOutputType,
  tool as toImageTool,
} from "./children/toImage";
import {
  InputType as toTextInputType,
  OutputType as toTextOutputType,
  tool as toTextTool,
} from "./children/toText";

const secretSchema = z.object({});
const toFileSecretSchema = z.object({});
const toFileInputSchema = defineInputSchema({
  base64: {
    type: z.string(),
    title: { en: "Base64 data", "zh-CN": "Base64 字符串" },
    description: {
      en: "Base64-encoded content to upload as a file.",
      "zh-CN": "要上传为文件的 Base64 编码内容。",
    },
    isToolParam: true,
  },
  fileName: {
    type: z.string().optional(),
    title: { en: "File name", "zh-CN": "文件名" },
    description: {
      en: "Optional custom upload filename; the extension is added automatically if omitted.",
      "zh-CN": "可选。自定义上传文件名；不含扩展名时会自动补全。",
    },
    isToolParam: true,
  },
});
const toFileOutputSchema = defineOutputSchema({
  url: {
    type: z.string(),
    title: { en: "File URL", "zh-CN": "文件 URL" },
    description: {
      en: "URL of the uploaded file.",
      "zh-CN": "上传后文件的访问地址。",
    },
  },
});

const toFileHandler = createToolHandler({
  inputSchema: toFileInputSchema,
  outputSchema: toFileOutputSchema,
  secretSchema: toFileSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await toFileInputType.parseAsync(input);
    const output = await toFileTool(parsedInput, ctx);
    return toFileOutputType.parseAsync(output);
  },
});

const toImageSecretSchema = z.object({});
const toImageInputSchema = defineInputSchema({
  base64: {
    type: z.string(),
    title: { en: "Base64 data", "zh-CN": "Base64 字符串" },
    description: {
      en: "Base64-encoded image content to upload.",
      "zh-CN": "要上传的 Base64 编码图片内容。",
    },
    isToolParam: true,
  },
  fileName: {
    type: z.string().optional(),
    title: { en: "File name", "zh-CN": "文件名" },
    description: {
      en: "Optional custom upload filename; the extension is added automatically if omitted.",
      "zh-CN": "可选。自定义上传文件名；不含扩展名时会自动补全。",
    },
    isToolParam: true,
  },
});
const toImageOutputSchema = defineOutputSchema({
  url: {
    type: z.string(),
    title: { en: "Image URL", "zh-CN": "图片 URL" },
    description: {
      en: "Accessible URL of the image, e.g. http://example.com.",
      "zh-CN": "可访问的图片地址，例如：http://example.com。",
    },
  },
});
const toImageHandler = createToolHandler({
  inputSchema: toImageInputSchema,
  outputSchema: toImageOutputSchema,
  secretSchema: toImageSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await toImageInputType.parseAsync(input);
    const output = await toImageTool(parsedInput, ctx);
    return toImageOutputType.parseAsync(output);
  },
});

const toTextSecretSchema = z.object({});
const toTextInputSchema = defineInputSchema({
  base64: {
    type: z.string(),
    title: { en: "Base64 data", "zh-CN": "Base64 字符串" },
    description: {
      en: "Base64-encoded content to decode as text.",
      "zh-CN": "要解码为文本的 Base64 编码内容。",
    },
    isToolParam: true,
  },
  fileName: {
    type: z.string().optional(),
    title: { en: "File name", "zh-CN": "文件名" },
    description: {
      en: "Optional filename; when supplied, the decoded text is also uploaded as a file.",
      "zh-CN": "可选。填写后会将解码文本同时上传为文件。",
    },
    isToolParam: true,
  },
});
const toTextOutputSchema = defineOutputSchema({
  text: {
    type: z.string(),
    title: { en: "Text", "zh-CN": "文本" },
    description: { en: "Decoded text content.", "zh-CN": "解码后的文本内容。" },
  },
  url: {
    type: z.string().optional(),
    title: { en: "File URL", "zh-CN": "文件 URL" },
    description: {
      en: "URL of the text file returned when a filename is provided.",
      "zh-CN": "填写文件名后返回的文本文件地址。",
    },
  },
});
const toTextHandler = createToolHandler({
  inputSchema: toTextInputSchema,
  outputSchema: toTextOutputSchema,
  secretSchema: toTextSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await toTextInputType.parseAsync(input);
    const output = await toTextTool(parsedInput, ctx);
    return toTextOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "base64Decode",
    name: {
      en: "Base64 Decode",
      "zh-CN": "Base64 解析",
    },
    description: {
      en: "Enter a Base64-encoded string and get a text, image, etc.",
      "zh-CN": "输入 Base64 编码的字符串，输出文本、图片等。",
    },
    version: "0.0.2",
    versionDescription: {
      en: "Support custom upload file names for file, image, and text outputs",
      "zh-CN": "支持为文件、图片和文本输出自定义上传文件名",
    },
    tags: ["tools"],
    permission: ["file-upload:allow"],
  },
  secretSchema,
  children: [
    {
      id: "toFile",
      name: {
        en: "Base64 to File",
        "zh-CN": "Base64 转文件",
      },
      description: {
        en: "Enter a Base64-encoded string and get a file.",
        "zh-CN": "将 Base64 编码的字符串转换为文件。",
      },
      handler: toFileHandler,
    },
    {
      id: "toImage",
      name: {
        en: "Base64 to Image",
        "zh-CN": "Base64 转图片",
      },
      description: {
        en: "Enter a Base64-encoded string and get a image.",
        "zh-CN": "将 Base64 编码的字符串转换为图片。",
      },
      handler: toImageHandler,
    },
    {
      id: "toText",
      name: {
        en: "Base64 to text",
        "zh-CN": "Base64 转文本",
      },
      description: {
        en: "Enter a Base64-encoded string and get a text.",
        "zh-CN": "将 Base64 编码的字符串转换为文本。",
      },
      handler: toTextHandler,
    },
  ],
});

export default toolSet;
