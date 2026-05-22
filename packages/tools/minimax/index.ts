import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as ttsInputType,
  OutputType as ttsOutputType,
  tool as ttsTool,
} from "./children/tts";

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "API Key",
    description: "可以在 minimax 官网获取"
  })
});
const ttsSecretSchema = z.object({});
const ttsInputSchema = z.object({
  "text": z.string().meta({
    title: "文本内容",
    toolDescription: "文本内容"
  }),
  "model": z.enum(["speech-2.5-hd-preview","speech-2.5-turbo-preview","speech-02-hd","speech-02-turbo","speech-01-hd","speech-01-turbo"]).meta({
    title: "模型"
  }),
  "voice_id": z.enum(["male-qn-qingse","male-qn-jingying","female-shaonv","female-chengshu"]).meta({
    title: "音色"
  }),
  "speed": z.number().meta({
    title: "语速",
    description: "语速，范围为 0.5-2, 值越大语速越快"
  }),
  "vol": z.number().meta({
    title: "音量",
    description: "音量，范围为 0.1-10, 值越大音量越大"
  }),
  "pitch": z.number().meta({
    title: "语调",
    description: "语调，范围为 -12-12, 值越大语调越高"
  }),
  "emotion": z.enum(["","happy","sad","angry","fearful","disgusted","surprised","calm"]).optional().meta({
    title: "情绪"
  }),
  "english_normalization": z.boolean().meta({
    title: "英文规范化",
    description: "支持英语文本规范化，开启后可提升数字阅读场景的性能，但会略微增加延迟"
  })
});
const ttsOutputSchema = z.object({
  "audioUrl": z.string().meta({
    title: "音频链接",
    description: "语音合成后的音频文件链接"
  })
});
const ttsHandler = createToolHandler({
  inputSchema: ttsInputSchema,
  outputSchema: ttsOutputSchema,
  secretSchema: ttsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await ttsInputType.parseAsync({
      ...input,
      ...ctx.secrets
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
      en: "minimax tool set, including text-to-speech, speech-to-text, speech synthesis, speech recognition等功能",
      "zh-CN":
        "minimax 工具集, 包含文本转语音、语音转文本、语音合成、语音识别等功能",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    toolDescription:
      "minimax tool set, including text-to-speech, speech-to-text, speech synthesis, speech recognition等功能",
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
        en: "Convert text to high-quality speech using MinMax platform",
        "zh-CN": "使用MinMax平台将文本转换为高质量语音",
      },
      toolDescription:
        "Convert text to speech using MinMax TTS API. Supports multiple voice settings and audio formats.",
      handler: ttsHandler,
    },
  ],
});

export default toolSet;
