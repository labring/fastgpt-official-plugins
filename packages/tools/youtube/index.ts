import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as getSubtitleInputType,
  OutputType as getSubtitleOutputType,
  tool as getSubtitleTool,
} from "./children/getSubtitle";

const secretSchema = z.object({});
const getSubtitleSecretSchema = z.object({});
const getSubtitleInputSchema = z.object({
  "videoUrl": z.string().meta({
    title: "视频链接",
    description: "YouTube 视频链接或视频 ID",
    toolDescription: "YouTube 视频链接 (例如: https://www.youtube.com/watch?v=VIDEO_ID) 或直接输入视频 ID"
  }),
  "lang": z.enum(["en","zh-CN","zh-TW","ja","ko","es","fr","de","ru","ar"]).optional().meta({
    title: "字幕语言",
    description: "不一定有对应字幕，不存在的话可能默认会返回英文。",
    toolDescription: "字幕语言代码,如 en (英语), zh-CN (简体中文), zh-TW (繁体中文), ja (日语), ko (韩语) 等"
  })
});
const getSubtitleOutputSchema = z.object({
  "subtitle": z.string().meta({
    title: "字幕内容",
    description: "提取的字幕文本内容"
  }),
  "videoId": z.string().meta({
    title: "视频 ID",
    description: "YouTube 视频的唯一标识符"
  })
});
const getSubtitleHandler = createToolHandler({
  inputSchema: getSubtitleInputSchema,
  outputSchema: getSubtitleOutputSchema,
  secretSchema: getSubtitleSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getSubtitleInputType.parseAsync(input);
    const output = await getSubtitleTool(parsedInput, ctx);
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
      "zh-CN": "Initial version",
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
