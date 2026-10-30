import { AhoCorasick } from "./ac/automaton";
import { defaultCategorizedKeywords } from "./dict/defaultDict";

export type ModerationVerdict = "pass" | "block" | "suspected";

export type ModerationHit = {
  label: string;
  providerLabel: string;
  keywords: string[];
};

export type ModerationOutcome = {
  verdict: ModerationVerdict;
  hits: ModerationHit[];
};

export type KeywordSettings = {
  /** 自定义拦截敏感词（逗号、分号或换行分隔，支持 "词" 或 "词:分类"） */
  customBlockedKeywords?: string | undefined;
  /** 自定义疑似敏感词（逗号、分号或换行分隔） */
  customSuspiciousKeywords?: string | undefined;
  /** 白名单豁免词（逗号、分号或换行分隔） */
  whiteList?: string | undefined;
  /** 是否启用内置开源基础词库，默认 true */
  enableDefaultDict?: boolean | string | undefined;
  /** 兼容旧版配置字段 */
  blockedKeywords?: string | undefined;
  suspiciousKeywords?: string | undefined;
};

/**
 * 分隔符解析器：支持逗号、分号、换行符分隔
 */
function parseKeywordList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;\n\r]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

/**
 * 缓存的自动机实例
 */
let cachedDefaultAutomaton: AhoCorasick | null = null;

function getDefaultAutomaton(): AhoCorasick {
  if (cachedDefaultAutomaton) {
    return cachedDefaultAutomaton;
  }

  const ac = new AhoCorasick();
  for (const [category, words] of Object.entries(defaultCategorizedKeywords)) {
    ac.addWords(words, category, true);
  }
  ac.build();
  cachedDefaultAutomaton = ac;
  return ac;
}

/**
 * 构建针对特定配置的自动机（如果只有默认词库则直接复用单例）
 */
function getAutomatonForRequest(settings: KeywordSettings): {
  automaton: AhoCorasick;
  whiteListSet: Set<string>;
} {
  const whiteListWords = parseKeywordList(settings.whiteList).map((w) =>
    w.toLowerCase(),
  );
  const whiteListSet = new Set(whiteListWords);

  const blockedList = [
    ...parseKeywordList(settings.customBlockedKeywords),
    ...parseKeywordList(settings.blockedKeywords),
  ];
  const suspiciousList = [
    ...parseKeywordList(settings.customSuspiciousKeywords),
    ...parseKeywordList(settings.suspiciousKeywords),
  ];

  const enableDefault =
    settings.enableDefaultDict === undefined ||
    settings.enableDefaultDict === true ||
    settings.enableDefaultDict === "true";

  // 如果没有自定义词且启用默认词库，直接复用单例自动机
  if (blockedList.length === 0 && suspiciousList.length === 0 && enableDefault) {
    return {
      automaton: getDefaultAutomaton(),
      whiteListSet,
    };
  }

  // 构建临时自动机（合并自定义与可选的默认词库）
  const ac = new AhoCorasick();

  if (enableDefault) {
    for (const [category, words] of Object.entries(
      defaultCategorizedKeywords,
    )) {
      ac.addWords(words, category, true);
    }
  }

  // 添加自定义拦截词
  for (const item of blockedList) {
    const parts = item.split(":");
    const word = parts[0]?.trim();
    const category = parts[1]?.trim() || "custom";
    if (word) {
      ac.addWord(word, category, true);
    }
  }

  // 添加自定义疑似词
  for (const item of suspiciousList) {
    const parts = item.split(":");
    const word = parts[0]?.trim();
    const category = parts[1]?.trim() || "custom_suspected";
    if (word) {
      ac.addWord(word, category, false);
    }
  }

  ac.build();

  return {
    automaton: ac,
    whiteListSet,
  };
}

/**
 * 依据配置对文本进行本地多模式敏感词审查
 */
export function moderateText(
  content: string,
  settings: KeywordSettings = {},
): ModerationOutcome {
  if (!content || content.trim().length === 0) {
    return {
      verdict: "pass",
      hits: [],
    };
  }

  const { automaton, whiteListSet } = getAutomatonForRequest(settings);
  const matches = automaton.search(content, { whiteList: whiteListSet });

  if (matches.length === 0) {
    return {
      verdict: "pass",
      hits: [],
    };
  }

  // 区分 block 和 suspected
  const blockedMatches = matches.filter((m) => m.isBlocked);
  const suspectedMatches = matches.filter((m) => !m.isBlocked);

  const verdict: ModerationVerdict =
    blockedMatches.length > 0 ? "block" : "suspected";
  const targetMatches =
    blockedMatches.length > 0 ? blockedMatches : suspectedMatches;

  // 按分类标签聚合 hits
  const categoryKeywordsMap = new Map<string, Set<string>>();
  for (const match of targetMatches) {
    const set = categoryKeywordsMap.get(match.category) || new Set<string>();
    set.add(match.word);
    categoryKeywordsMap.set(match.category, set);
  }

  const hits: ModerationHit[] = [];
  for (const [category, wordsSet] of categoryKeywordsMap.entries()) {
    hits.push({
      label: category,
      providerLabel: `local-keyword:${category}`,
      keywords: Array.from(wordsSet),
    });
  }

  return {
    verdict,
    hits,
  };
}
