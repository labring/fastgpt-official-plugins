import type {
  ModerationHitType,
  ModerationLabelType,
} from "@fastgpt-plugin/sdk-factory";
import { AhoCorasick } from "./ac/automaton";
import {
  coreBlockCategorizedKeywords,
  suspectedCategorizedKeywords,
} from "./dict/curatedDict";

export type ModerationVerdict = "pass" | "block" | "suspected";

export type ModerationHit = ModerationHitType & {
  keywords: string[];
};

export type ModerationOutcome = {
  verdict: ModerationVerdict;
  hits: ModerationHit[];
};

let cachedAutomaton: AhoCorasick | null = null;

function getAutomaton(): AhoCorasick {
  if (cachedAutomaton) {
    return cachedAutomaton;
  }

  const ac = new AhoCorasick();

  // 1. 高危拦截词 (isBlocked = true)
  for (const [category, words] of Object.entries(
    coreBlockCategorizedKeywords,
  )) {
    ac.addWords(words, category, true);
  }

  // 2. 疑似风险词 (isBlocked = false)
  for (const [category, words] of Object.entries(
    suspectedCategorizedKeywords,
  )) {
    ac.addWords(words, category, false);
  }

  ac.build();
  cachedAutomaton = ac;
  return ac;
}

const STANDARD_LABELS: ReadonlySet<ModerationLabelType> = new Set([
  "porn",
  "politics",
  "terror",
  "contraband",
  "abuse",
  "hate",
  "ad",
  "advertising-law",
  "privacy",
  "flood",
  "self-harm",
  "violence",
  "sexual-minors",
  "other",
]);

function normalizeModerationLabel(category: string): ModerationLabelType {
  return STANDARD_LABELS.has(category as ModerationLabelType)
    ? (category as ModerationLabelType)
    : "other";
}

/**
 * 依据内置涉政与色情词库对文本进行本地多模式敏感词审查
 */
export function moderateText(content: string): ModerationOutcome {
  if (!content || content.trim().length === 0) {
    return {
      verdict: "pass",
      hits: [],
    };
  }

  const matches = getAutomaton().search(content);

  if (matches.length === 0) {
    return {
      verdict: "pass",
      hits: [],
    };
  }

  // 区分 block 和 suspected：只要有 block 命中则裁决为 block，否则为 suspected
  const blockedMatches = matches.filter((m) => m.isBlocked);

  const verdict: ModerationVerdict =
    blockedMatches.length > 0 ? "block" : "suspected";

  // 一并输出全部命中的敏感词记录（包含 block 与 suspected 的所有命中文档）
  const targetMatches = matches;

  // 按分类标签聚合 hits
  const categoryKeywordsMap = new Map<string, Set<string>>();
  for (const match of targetMatches) {
    const set = categoryKeywordsMap.get(match.category) || new Set<string>();
    set.add(match.word);
    categoryKeywordsMap.set(match.category, set);
  }

  const hits: ModerationHit[] = [];
  for (const [category, wordsSet] of categoryKeywordsMap.entries()) {
    const label = normalizeModerationLabel(category);
    hits.push({
      label,
      providerLabel: `local-keyword:${category}`,
      keywords: Array.from(wordsSet),
    });
  }

  return {
    verdict,
    hits,
  };
}
