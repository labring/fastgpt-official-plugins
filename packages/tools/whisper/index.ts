import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  baseUrl: z
    .string()
    .optional()
    .meta({
      title: "基础 URL",
      description: "默认为：https://api.openai.com/v1",
      "x-i18n": {
        title: { en: "Base URL", "zh-CN": "基础 URL" },
        description: {
          en: "Defaults to https://api.openai.com/v1.",
          "zh-CN": "默认为：https://api.openai.com/v1",
        },
      },
      isSecret: false,
    }),
  apiKey: z.string().meta({
    title: "API 密钥",
    description: "用于访问 OpenAI 语音转写 API 的密钥。",
    isSecret: true,
    "x-i18n": {
      title: { en: "API key", "zh-CN": "API 密钥" },
      description: {
        en: "Credential used to access the OpenAI transcription API.",
        "zh-CN": "用于访问 OpenAI 语音转写 API 的密钥。",
      },
    },
  }),
});
const inputSchema = defineInputSchema({
  model: {
    type: z.enum([
      "whisper-1",
      "gpt-4o-transcribe",
      "gpt-4o-mini-transcribe",
      "gpt-4o-transcribe-diarize",
    ]),
    title: { en: "Transcription model", "zh-CN": "转写模型" },
    description: {
      en: "Whisper model to use for transcription.",
      "zh-CN": "用于语音转写的 Whisper 模型。",
    },
    isToolParam: true,
  },
  file: {
    type: z.string(),
    title: { en: "Audio file", "zh-CN": "音频文件" },
    description: {
      en: "Audio file as a URL or base64 data URL, for example https://example.com/audio.mp3 or data:audio/mp3;base64,xxx...",
      "zh-CN":
        "音频文件，支持 URL 或 base64 格式。URL 示例：https://example.com/audio.mp3；base64 示例：data:audio/mp3;base64,xxx...",
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  text: {
    type: z.string(),
    title: { en: "Transcribed text", "zh-CN": "转写文本" },
    description: {
      en: "Text transcribed from the audio file.",
      "zh-CN": "从音频文件转写得到的文本。",
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
    pluginId: "whisper",
    name: {
      en: "Whisper Speech-to-Text",
      "zh-CN": "Whisper 语音转文字",
    },
    description: {
      en: "Convert audio files to text using the OpenAI Whisper speech recognition API. Supports multiple audio formats and languages.",
      "zh-CN":
        "使用 OpenAI Whisper 语音识别 API 将音频文件转换为文本，支持多种音频格式和语言。",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["multimodal"],
  },
  handler,
});

export default tool;
