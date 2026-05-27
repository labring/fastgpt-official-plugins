import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({
  "baseUrl": z.string().optional().meta({
    title: "BaseUrl",
    description: "默认为：https://api.openai.com/v1"
  }),
  "apiKey": z.string().meta({
    title: "API Key",
    isSecret: true,
  })
});
const inputSchema = z.object({
  "model": z.enum(["whisper-1","gpt-4o-transcribe","gpt-4o-mini-transcribe","gpt-4o-transcribe-diarize"]).meta({
    title: "模型",
    toolDescription: "Whisper model to use for transcription"
  }),
  "file": z.string().meta({
    title: "音频文件",
    toolDescription: "音频文件，支持 URL 或 base64 格式。URL 格式如：https://example.com/audio.mp3，base64 格式如：data:audio/mp3;base64,xxx..."
  })
});
const outputSchema = z.object({
  "text": z.string().meta({
    title: "文本"
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
    pluginId: "whisper",
    name: {
      en: "Whisper Speech-to-Text",
      "zh-CN": "Whisper 语音转文字",
    },
    description: {
      en: "Convert audio files to text using OpenAI Whisper model, supporting multiple audio formats and multilingual recognition",
      "zh-CN":
        "使用 OpenAI Whisper 模型将音频文件转换为文字，支持多种音频格式和多语言识别",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "Default version",
    },
    toolDescription:
      "Convert audio files to text using OpenAI Whisper speech recognition API. Supports multiple audio formats and languages.",
    tags: ["multimodal"],
  },
  secretSchema,
  handler,
});

export default tool;
