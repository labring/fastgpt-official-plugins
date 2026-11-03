import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { moderateText } from "./src/moderation";

const secretSchema = z.object({
  customBlockedKeywords: z.string().optional().meta({
    title: "自定义拦截词库 (Custom Blocklist)",
    description:
      "逗号、分号或换行分隔。命中立即拦截并阻断，支持 '关键词' 或 '关键词:分类' 格式",
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
    title: "启用内置词库",
    description: "启用内置经过工业级清洗与分级的敏感词库",
    isSecret: false,
  }),
  enablePolitics: z.boolean().default(true).optional().meta({
    title: "启用涉政敏感词",
    description: "审查涉政反动、极端有害政治言论等",
    isSecret: false,
  }),
  enableViolence: z.boolean().default(true).optional().meta({
    title: "启用暴恐违规词",
    description: "审查恐怖主义、暴力血腥、涉枪涉爆等",
    isSecret: false,
  }),
  enablePorn: z.boolean().default(true).optional().meta({
    title: "启用色情低俗词",
    description: "审查淫秽色情、卖淫招嫖、低俗文字等",
    isSecret: false,
  }),
  enableContraband: z.boolean().default(true).optional().meta({
    title: "启用违禁品/毒品词",
    description: "审查毒品买卖、走私造假、黑产交易等",
    isSecret: false,
  }),
  enableAd: z.boolean().default(false).optional().meta({
    title: "启用广告引流词",
    description: "审查恶意引流与博彩诈骗网址（默认关闭，避免误杀正常商业信息）",
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
      "zh-CN":
        "基于高性能 AC 自动机与开源敏感词库（涉政、暴恐、涉黄、贪腐、广告）的本地内容审查服务，支持自定义黑白名单，零外部网络依赖且亚毫秒级响应。",
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
