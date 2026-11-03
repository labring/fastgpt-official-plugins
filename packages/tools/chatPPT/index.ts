import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "API Key",
    description: "可以在必优官网获取",
    "x-i18n": {
      title: { en: "API key", "zh-CN": "API Key" },
      description: {
        en: "Get an API key from the Biyou website.",
        "zh-CN": "可以在必优官网获取。",
      },
    },
    isSecret: true,
  }),
});
const inputSchema = defineInputSchema({
  text: {
    type: z.string(),
    title: { en: "Description", "zh-CN": "描述文本" },
    description: {
      en: "Description of the presentation to generate.",
      "zh-CN": "生成 PPT 的描述文本",
    },
    isToolParam: true,
  },
  color: {
    type: z.string().optional(),
    title: { en: "Theme color", "zh-CN": "主题色" },
    description: { en: "Presentation theme color.", "zh-CN": "PPT 的主题色" },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  preview_url: {
    type: z.string(),
    title: { en: "Presentation preview URL", "zh-CN": "PPT 预览链接" },
    description: {
      en: "URL for previewing the generated presentation.",
      "zh-CN": "生成的 PPT 预览链接",
    },
  },
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "chatPPT",
    name: {
      en: "ChatPPT",
      "zh-CN": "必优ChatPPT",
    },
    description: {
      en: "ChatPPT, one-click generate PPT",
      "zh-CN": "必优ChatPPT，一键生成PPT",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["productivity"],
  },
  handler,
});

export default tool;
