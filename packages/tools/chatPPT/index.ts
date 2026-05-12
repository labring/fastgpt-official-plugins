import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "API Key",
    description: "可以在必优官网获取"
  })
});
const inputSchema = z.object({
  "text": z.string().meta({
    title: "描述文本",
    description: "生成PPT的描述文本",
    toolDescription: "生成PPT的描述文本"
  }),
  "color": z.string().optional().meta({
    title: "主题色",
    description: "PPT的主题色",
    toolDescription: "PPT的主题色"
  })
});
const outputSchema = z.object({
  "preview_url": z.string().meta({
    title: "PPT的预览URL",
    description: "PPT的预览URL"
  })
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets
    });
    const output = await toolCb(parsedInput, ctx);
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
      "zh-CN": "Default version",
    },
    toolDescription: "ChatPPT, one-click generate PPT",
    tags: ["productivity"],
  },
  secretSchema,
  handler,
});

export default tool;
