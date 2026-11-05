import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { moderateText } from "./src/moderation";

const secretSchema = z.object({
  blockedKeywords: z.string().optional().meta({
    title: "Blocked keywords",
    description: "Comma-separated keywords that always block the content",
    isSecret: true,
  }),
  suspiciousKeywords: z.string().optional().meta({
    title: "Suspicious keywords",
    description: "Comma-separated keywords that require manual review",
    isSecret: true,
  }),
});

const moderation = defineModeration({
  manifest: defineModerationManifest({
    pluginId: "moderationTest",
    version: "0.1.0",
    name: {
      en: "Keyword Moderation Test",
      "zh-CN": "关键词内容审核测试",
    },
    description: {
      en: "Moderate text locally using configurable keyword lists for testing.",
      "zh-CN": "使用可配置的关键词在本地审查文本，仅用于测试内容审核。",
    },
    versionDescription: {
      en: "Initial test version",
      "zh-CN": "初始测试版本",
    },
    meta: {
      provider: "keyword",
    },
  }),
  secretSchema,
  provider: {
    name: "keyword",
    check: async (input, ctx) => moderateText(input.content, ctx.secrets),
  },
});

export default moderation;
