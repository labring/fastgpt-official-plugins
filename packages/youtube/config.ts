import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "YouTube 工具集",
    en: "YouTube Tools",
  },
  tags: [ToolTagEnum.tools],
  description: {
    "zh-CN": "提供 YouTube 视频相关功能,包括字幕获取等",
    en: "Provides YouTube video-related functionalities, including subtitle extraction",
  },
});
