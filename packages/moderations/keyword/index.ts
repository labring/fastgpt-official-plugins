import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { moderateText } from "./src/moderation";

const secretSchema = z.object({
  customBlockedKeywords: z.string().optional().meta({
    title: "自定义拦截词库 (Custom Blocklist)",
    description: "逗号、分号或换行分隔。命中立即拦截并阻断，支持 '关键词' 或 '关键词:分类' 格式",
    isSecret: false,
  }),
  customSuspiciousKeywords: z.string().optional().meta({
    title: "自定义疑似词库 (Custom Suspected List)",
    description: "逗号、分号或换行分隔。命中标记为疑似风险",
    isSecret: false,
  }),
  whiteList: z.string().optional().meta({
    title: "白名单放行词库 (Whitelist)",
    description: "逗号、分号或换行分隔。在此列表中的词即便命中敏感词库也会放行",
    isSecret: false,
  }),
  enableDefaultDict: z.boolean().default(true).optional().meta({
    title: "启用内置开源词库",
    description: "内置开源涉政、暴恐、色情、贪腐及违禁广告分类词库",
    isSecret: false,
  }),
  blockedKeywords: z.string().optional().meta({
    title: "兼容拦截词 (Blocked keywords)",
    description: "兼容旧版配置字段",
    isSecret: false,
  }),
  suspiciousKeywords: z.string().optional().meta({
    title: "兼容疑似词 (Suspicious keywords)",
    description: "兼容旧版配置字段",
    isSecret: false,
  }),
});

const moderation = defineModeration({
  manifest: defineModerationManifest({
    pluginId: "local-keyword-moderation",
    version: "1.0.0",
    name: {
      en: "Local Keyword Moderation",
      "zh-CN": "本地关键词内容安全审查",
    },
    description: {
      en: "Ultra-fast local text moderation powered by Aho-Corasick automaton and open-source sensitive lexicon (politics, violence, porn, corruption, spam). Supports custom blacklists and whitelists.",
      "zh-CN": "基于高性能 AC 自动机与开源敏感词库（涉政、暴恐、涉黄、贪腐、广告）的本地内容审查服务，支持自定义黑白名单，零外部网络依赖且亚毫秒级响应。",
    },
    versionDescription: {
      en: "High-performance Aho-Corasick engine with categorized open-source lexicons",
      "zh-CN": "基于 AC 自动机的高性能本地多模式敏感词审查引擎",
    },
    meta: {
      provider: "local-keyword",
      docUrl: "https://github.com/konsheng/Sensitive-lexicon",
    },
  }),
  secretSchema,
  provider: {
    name: "local-keyword",
    check: async (input, ctx) => moderateText(input.content, ctx.secrets),
  },
});

export default moderation;
