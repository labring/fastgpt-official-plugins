import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
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
const toFileInputSchema = z
  .object({
    base64: z.string(),
  });
const toFileOutputSchema = z
  .object({
    url: z.string(),
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
const toImageInputSchema = z
  .object({
    base64: z.string().meta({
      title: "Base64 字符串",
    }),
  });
const toImageOutputSchema = z
  .object({
    url: z.string().meta({
      title: "图片 URL",
      description: "可访问的图片地址: http://example.com",
    }),
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
const toTextInputSchema = z
  .object({
    base64: z.string().meta({
      title: "Base64 字符串",
    }),
  });
const toTextOutputSchema = z
  .object({
    text: z.string().meta({
      title: "文本",
    }),
  });
const toTextHandler = createToolHandler({
  inputSchema: toTextInputSchema,
  outputSchema: toTextOutputSchema,
  secretSchema: toTextSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await toTextInputType.parseAsync(input);
    const output = await toTextTool(parsedInput);
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
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
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
      toolDescription: "Base64-encoded to file",
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
      toolDescription: "Base64-encoded to image",
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
      toolDescription: "Base64-encoded to text",
      handler: toTextHandler,
    },
  ],
});

export default toolSet;
