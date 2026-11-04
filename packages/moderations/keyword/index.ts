import {
  defineModeration,
  defineModerationManifest,
  defineSecretSchema,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { moderateText } from "./src/moderation";

const secretSchema = defineSecretSchema({
  customBlockedKeywords: {
    type: z.string().optional(),
    title: {
      en: "Custom Blocklist",
      "zh-CN": "自定义拦截词库",
    },
    description: {
      en: "Comma, semicolon, or newline separated keywords that trigger immediate block. Supports 'keyword' or 'keyword:category'",
      "zh-CN":
        "逗号、分号或换行分隔。命中立即拦截并阻断，支持 '关键词' 或 '关键词:分类' 格式",
    },
    isSecret: false,
  },
  customSuspiciousKeywords: {
    type: z.string().optional(),
    title: {
      en: "Custom Suspected List",
      "zh-CN": "自定义疑似词库",
    },
    description: {
      en: "Comma, semicolon, or newline separated keywords marked as suspected risk",
      "zh-CN": "逗号、分号或换行分隔。命中标记为疑似风险",
    },
    isSecret: false,
  },
  whiteList: {
    type: z.string().optional(),
    title: {
      en: "Whitelist",
      "zh-CN": "白名单放行词库",
    },
    description: {
      en: "Comma, semicolon, or newline separated terms exempted even when matching sensitive substrings",
      "zh-CN": "逗号、分号或换行分隔。在此列表中的词或专有名词即便命中敏感词库也会放行",
    },
    isSecret: false,
  },
  enableDefaultDict: {
    type: z.boolean().default(true).optional(),
    title: {
      en: "Enable Built-in Lexicon",
      "zh-CN": "启用内置词库",
    },
    description: {
      en: "Enable the built-in sanitized and tiered sensitive keyword lexicon",
      "zh-CN": "启用内置经过工业级清洗与分级的敏感词库",
    },
    isSecret: false,
  },
  enablePolitics: {
    type: z.boolean().default(true).optional(),
    title: {
      en: "Enable Politics Category",
      "zh-CN": "启用涉政敏感词",
    },
    description: {
      en: "Review political and harmful ideological keywords",
      "zh-CN": "审查涉政反动、极端有害政治言论等",
    },
    isSecret: false,
  },
  enableViolence: {
    type: z.boolean().default(true).optional(),
    title: {
      en: "Enable Violence Category",
      "zh-CN": "启用暴恐违规词",
    },
    description: {
      en: "Review terrorism, violence, weapons, and explosives keywords",
      "zh-CN": "审查恐怖主义、暴力血腥、涉枪涉爆等",
    },
    isSecret: false,
  },
  enablePorn: {
    type: z.boolean().default(true).optional(),
    title: {
      en: "Enable Pornography Category",
      "zh-CN": "启用色情低俗词",
    },
    description: {
      en: "Review pornography, prostitution, and vulgar keywords",
      "zh-CN": "审查淫秽色情、卖淫招嫖、低俗文字等",
    },
    isSecret: false,
  },
  enableContraband: {
    type: z.boolean().default(true).optional(),
    title: {
      en: "Enable Contraband Category",
      "zh-CN": "启用违禁品/毒品词",
    },
    description: {
      en: "Review narcotics, smuggling, counterfeiting, and illicit trade keywords",
      "zh-CN": "审查毒品买卖、走私造假、黑产交易等",
    },
    isSecret: false,
  },
  enableAd: {
    type: z.boolean().default(false).optional(),
    title: {
      en: "Enable Advertising Category",
      "zh-CN": "启用广告引流词",
    },
    description: {
      en: "Review spam, gambling, and scam promotion terms (disabled by default to avoid false positives)",
      "zh-CN": "审查恶意引流与博彩诈骗网址（默认关闭，避免误杀正常商业信息）",
    },
    isSecret: false,
  },
  enableOther: {
    type: z.boolean().default(true).optional(),
    title: {
      en: "Enable Other Category",
      "zh-CN": "启用其他综合敏感词",
    },
    description: {
      en: "Review corruption, disciplinary violations, and other general sensitive terms",
      "zh-CN": "审查贪腐违纪等其他综合敏感词",
    },
    isSecret: false,
  },
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
