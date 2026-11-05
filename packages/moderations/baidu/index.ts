import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import { createBaiduModerator, secretSchema } from "./src/baidu";

const check = createBaiduModerator();

export default defineModeration({
  manifest: defineModerationManifest({
    pluginId: "baidu-text-moderation",
    version: "1.0.0",
    name: { en: "Baidu Text Moderation", "zh-CN": "百度文本内容审核" },
    description: {
      en: "Review text using Baidu Content Moderation and preserve all provider hit details.",
      "zh-CN":
        "调用百度内容审核，支持自定义审核策略，保留全部命中标签、关键词与置信度。",
    },
    versionDescription: {
      en: "Initial text moderation provider",
      "zh-CN": "首次发布百度文本审核插件",
    },
    meta: {
      provider: "baidu",
      docUrl: "https://ai.baidu.com/ai-doc/ANTIPORN/Rk3h6xb3i",
    },
  }),
  secretSchema,
  provider: {
    name: "baidu",
    check: (input, ctx) => check(input.content, ctx.secrets),
  },
});
