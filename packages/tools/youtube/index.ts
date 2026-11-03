import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as getSubtitleInputType,
  OutputType as getSubtitleOutputType,
  tool as getSubtitleTool,
} from "./children/getSubtitle";

const secretSchema = z.object({});
const getSubtitleSecretSchema = z.object({});
const getSubtitleInputSchema = defineInputSchema({
  videoUrl: {
    type: z.string(),
    title: { en: "Video URL", "zh-CN": "视频链接" },
    description: {
      en: "YouTube video URL (for example, https://www.youtube.com/watch?v=VIDEO_ID) or an 11-character video ID.",
      "zh-CN":
        "YouTube 视频链接（例如：https://www.youtube.com/watch?v=VIDEO_ID）或 11 位视频 ID。",
    },
    isToolParam: true,
  },
  lang: {
    type: z
      .enum(["en", "zh-CN", "zh-TW", "ja", "ko", "es", "fr", "de", "ru", "ar"])
      .optional(),
    title: { en: "Subtitle language", "zh-CN": "字幕语言" },
    description: {
      en: "Language code for the subtitles, such as en (English), zh-CN (Simplified Chinese), zh-TW (Traditional Chinese), ja (Japanese), or ko (Korean). The video may not have subtitles in the requested language; English may be returned by default.",
      "zh-CN":
        "字幕语言代码，如 en（英语）、zh-CN（简体中文）、zh-TW（繁体中文）、ja（日语）或 ko（韩语）。视频可能没有指定语言的字幕，此时可能默认返回英语。",
    },
    isToolParam: true,
  },
});
const getSubtitleOutputSchema = defineOutputSchema({
  subtitle: {
    type: z.string(),
    title: { en: "Subtitle text", "zh-CN": "字幕内容" },
    description: {
      en: "Extracted subtitle text from the video.",
      "zh-CN": "从视频中提取的字幕文本。",
    },
  },
  videoId: {
    type: z.string(),
    title: { en: "Video ID", "zh-CN": "视频 ID" },
    description: {
      en: "Unique identifier of the YouTube video.",
      "zh-CN": "YouTube 视频的唯一标识符。",
    },
  },
});
const getSubtitleHandler = createToolHandler({
  inputSchema: getSubtitleInputSchema,
  outputSchema: getSubtitleOutputSchema,
  secretSchema: getSubtitleSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getSubtitleInputType.parseAsync(input);
    const output = await getSubtitleTool(parsedInput);
    return getSubtitleOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "youtube",
    name: {
      en: "YouTube Tools",
      "zh-CN": "YouTube 工具集",
    },
    description: {
      en: "Provides YouTube video-related functionalities, including subtitle extraction",
      "zh-CN": "提供 YouTube 视频相关功能,包括字幕获取等",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "getSubtitle",
      name: {
        en: "YouTube Subtitle Extraction",
        "zh-CN": "YouTube 字幕获取",
      },
      description: {
        en: "Extract subtitle content from YouTube videos, supporting multiple languages",
        "zh-CN": "获取 YouTube 视频的字幕内容,支持多种语言",
      },
      handler: getSubtitleHandler,
    },
  ],
});

export default toolSet;
