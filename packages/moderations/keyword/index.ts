import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import { moderateText } from "./src/moderation";

const moderation = defineModeration({
  manifest: defineModerationManifest({
    pluginId: "local-keyword-moderation",
    version: "1.0.0",
    name: {
      en: "Local Keyword Moderation",
      "zh-CN": "本地关键词内容安全审查",
    },
    description: {
      en: "Ultra-fast local text moderation powered by Aho-Corasick automaton and built-in sensitive lexicons (politics, porn) with zero configuration.",
      "zh-CN":
        "基于高性能 AC 自动机与内置敏感词库（涉政、色情）的本地内容审查服务，开箱即用、零外部网络依赖且亚毫秒级响应。",
    },
    versionDescription: {
      en: "High-performance Aho-Corasick engine with politics and porn lexicons",
      "zh-CN": "基于 AC 自动机的高性能本地涉政与色情敏感词审查引擎",
    },
    meta: {
      provider: "local-keyword",
      docUrl: "https://github.com/konsheng/Sensitive-lexicon",
    },
  }),
  provider: {
    name: "local-keyword",
    check: async (input) => moderateText(input.content),
  },
});

export default moderation;
