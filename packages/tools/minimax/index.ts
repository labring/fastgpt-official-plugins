import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as ttsInputType,
  OutputType as ttsOutputType,
  tool as ttsTool,
} from "./children/tts";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "API key",
    description: "Get an API key from the Minimax website.",
    isSecret: true,
    "x-i18n": {
      title: { en: "API key", "zh-CN": "API Key" },
      description: {
        en: "Get an API key from the Minimax website.",
        "zh-CN": "可以在 Minimax 官网获取",
      },
    },
  }),
});
const ttsSecretSchema = z.object({});
const ttsInputSchema = defineInputSchema({
  text: {
    type: z.string(),
    title: { en: "Text", "zh-CN": "文本内容" },
    description: {
      en: "Text to convert to speech.",
      "zh-CN": "需要转换为语音的文本内容",
    },
    isToolParam: true,
  },
  model: {
    type: z.enum([
      "speech-2.5-hd-preview",
      "speech-2.5-turbo-preview",
      "speech-02-hd",
      "speech-02-turbo",
      "speech-01-hd",
      "speech-01-turbo",
    ]),
    title: { en: "Model", "zh-CN": "模型" },
    description: {
      en: "Minimax speech synthesis model.",
      "zh-CN": "Minimax 语音合成模型",
    },
    isToolParam: true,
  },
  voice_id: {
    type: z.enum([
      "male-qn-qingse",
      "male-qn-jingying",
      "female-shaonv",
      "female-chengshu",
    ]),
    title: { en: "Voice", "zh-CN": "音色" },
    description: {
      en: "Voice ID to use for synthesis.",
      "zh-CN": "语音合成使用的音色 ID",
    },
    isToolParam: true,
  },
  speed: {
    type: z.number(),
    title: { en: "Speech speed", "zh-CN": "语速" },
    description: {
      en: "Speech speed from 0.5 to 2; higher values are faster.",
      "zh-CN": "语速范围为 0.5-2，数值越大语速越快",
    },
    isToolParam: true,
  },
  vol: {
    type: z.number(),
    title: { en: "Volume", "zh-CN": "音量" },
    description: {
      en: "Volume from 0.1 to 10; higher values are louder.",
      "zh-CN": "音量范围为 0.1-10，数值越大音量越大",
    },
    isToolParam: true,
  },
  pitch: {
    type: z.number(),
    title: { en: "Pitch", "zh-CN": "语调" },
    description: {
      en: "Pitch from -12 to 12; higher values raise the pitch.",
      "zh-CN": "语调范围为 -12-12，数值越大语调越高",
    },
    isToolParam: true,
  },
  emotion: {
    type: z
      .enum([
        "",
        "happy",
        "sad",
        "angry",
        "fearful",
        "disgusted",
        "surprised",
        "calm",
      ])
      .optional(),
    title: { en: "Emotion", "zh-CN": "情绪" },
    description: {
      en: "Emotion style for the generated speech.",
      "zh-CN": "生成语音的情绪风格",
    },
    isToolParam: true,
  },
  english_normalization: {
    type: z.boolean(),
    title: { en: "English normalization", "zh-CN": "英文规范化" },
    description: {
      en: "Normalize English text to improve number reading, with slightly increased latency.",
      "zh-CN": "启用英语文本规范化可提升数字阅读效果，但会略微增加延迟",
    },
    isToolParam: true,
  },
});
const ttsOutputSchema = defineOutputSchema({
  audioUrl: {
    type: z.string(),
    title: { en: "Audio URL", "zh-CN": "音频链接" },
    description: {
      en: "URL of the synthesized audio file.",
      "zh-CN": "语音合成后的音频文件链接",
    },
  },
});
const ttsHandler = createToolHandler({
  inputSchema: ttsInputSchema,
  outputSchema: ttsOutputSchema,
  secretSchema: ttsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await ttsInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await ttsTool(parsedInput, ctx);
    return ttsOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "minimax",
    name: {
      en: "minimax Tool Set",
      "zh-CN": "minimax 工具集",
    },
    description: {
      en: "Minimax tools for text-to-speech, speech-to-text, speech synthesis, and speech recognition.",
      "zh-CN":
        "Minimax 工具集，包含文本转语音、语音转文本、语音合成和语音识别等功能。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
    permission: ["file-upload:allow"],
  },
  secretSchema,
  children: [
    {
      id: "tts",
      name: {
        en: "minmax Text-to-Speech",
        "zh-CN": "minmax 文本转语音",
      },
      description: {
        en: "Convert text to high-quality speech using the Minimax TTS API, with multiple voice settings and audio formats.",
        "zh-CN":
          "使用 Minimax TTS API 将文本转换为高质量语音，支持多种音色设置和音频格式。",
      },
      handler: ttsHandler,
    },
  ],
});

export default toolSet;
