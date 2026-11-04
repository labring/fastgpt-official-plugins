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

export type KeywordSettings = {
  /** 自定义拦截敏感词（逗号、分号或换行分隔，支持 "词" 或 "词:分类"） */
  customBlockedKeywords?: string | undefined;
  /** 自定义疑似敏感词（逗号、分号或换行分隔） */
  customSuspiciousKeywords?: string | undefined;
  /** 白名单豁免词（逗号、分号或换行分隔） */
  whiteList?: string | undefined;
  /** 是否启用内置开源基础词库，默认 true */
  enableDefaultDict?: boolean | string | undefined;

  /** 分类开关：是否启用涉政敏感词，默认 true */
  enablePolitics?: boolean | string | undefined;
  /** 分类开关：是否启用暴恐敏感词，默认 true */
  enableViolence?: boolean | string | undefined;
  /** 分类开关：是否启用色情低俗敏感词，默认 true */
  enablePorn?: boolean | string | undefined;
  /** 分类开关：是否启用违禁品/毒品敏感词，默认 true */
  enableContraband?: boolean | string | undefined;
  /** 分类开关：是否启用广告引流敏感词，默认 false (避免误杀正常商业与联系方式) */
  enableAd?: boolean | string | undefined;
  /** 分类开关：是否启用其他综合敏感词，默认 true */
  enableOther?: boolean | string | undefined;
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
 * 常见通用无害白名单词汇（即使文本中包含也绝不判定为敏感词）
 */
const BUILTIN_HARMLESS_WHITELIST = new Set([
  "is",
  "it",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "up",
  "down",
  "die",
  "cs",
  "bi",
  "gm",
  "it",
  "pc",
  "app",
  "api",
  "url",
  "web",
  "doc",
  "dev",
  "git",
  "com",
  "org",
  "net",
  "cn",
  "top",
  "vip",
  "xyz",
  "cctv",
  "cdma",
  "cbd",
  "10086",
  "10010",
  "10000",
  "189",
  "中国",
  "中文",
  "北京",
  "上海",
  "广州",
  "深圳",
  "成都",
  "武汉",
  "杭州",
  "南京",
  "天津",
  "重庆",
  "西安",
  "人民",
  "国家",
  "政府",
  "政治",
  "改革",
  "民主",
  "宪法",
  "法律",
  "社会",
  "经济",
  "科技",
  "教育",
  "文化",
  "操作",
  "操场",
  "操心",
  "操办",
  "日本",
  "日本人",
  "日本料理",
  "生日",
  "向日葵",
  "白日",
  "日光",
  "日常",
  "免费",
  "官网",
  "客服",
  "电话",
  "微信",
  "咨询",
  "代理",
  "兼职",
  "招聘",
  "购买",
  "优惠",
  "折扣",
  "会员",
  "医院",
  "医生",
  "器官",
  "受精",
  "怀孕",
  "乳腺",
  "胸部",
  "妇科",
  "生殖",
  "精子",
  "卵子",
  "护士",
  "手术",
  "发展",
  "建设",
  "服务",
  "管理",
  "系统",
  "数据",
  "平台",
  "安全",
  "测试",
  "代码",
  "程序",
  "算法",
  "函数",
  "开发",
  "应用",
  "接口",
  "网络",
  "协议",
  "配置",
  "说明",
  "文档",
  "项目",
  "用户",
  "角色",
  "权限",
  "助手",
  "13亿",
  "14亿",
  "24小时",
  "12月26日",
  "0投资",
  "0风险",
  "80块钱",
  "100块",
]);

/**
 * 缓存的默认自动机实例（默认分类开关配置下的单例）
 */
let cachedDefaultAutomaton: AhoCorasick | null = null;

function buildAutomatonWithCategories(categoryFilters: {
  politics: boolean;
  violence: boolean;
  porn: boolean;
  contraband: boolean;
  ad: boolean;
  other: boolean;
}): AhoCorasick {
  const ac = new AhoCorasick();

  // 1. 高危拦截词 (isBlocked = true)
  for (const [category, words] of Object.entries(
    coreBlockCategorizedKeywords,
  )) {
    if (!categoryFilters[category as keyof typeof categoryFilters]) continue;
    ac.addWords(words, category, true);
  }

  // 2. 疑似风险词 (isBlocked = false)
  for (const [category, words] of Object.entries(
    suspectedCategorizedKeywords,
  )) {
    if (!categoryFilters[category as keyof typeof categoryFilters]) continue;
    ac.addWords(words, category, false);
  }

  ac.build();
  return ac;
}

function getDefaultAutomaton(): AhoCorasick {
  if (cachedDefaultAutomaton) {
    return cachedDefaultAutomaton;
  }

  // 默认启用 politics, violence, porn, contraband, other；禁用 ad
  cachedDefaultAutomaton = buildAutomatonWithCategories({
    politics: true,
    violence: true,
    porn: true,
    contraband: true,
    ad: false,
    other: true,
  });

  return cachedDefaultAutomaton;
}

function parseBool(
  val: boolean | string | undefined,
  defaultVal: boolean,
): boolean {
  if (val === undefined || val === null || val === "") return defaultVal;
  return val === true || val === "true";
}

/**
 * 构建针对特定配置的自动机
 */
function getAutomatonForRequest(settings: KeywordSettings): {
  automaton: AhoCorasick;
  whiteListSet: Set<string>;
} {
  const userWhiteList = parseKeywordList(settings.whiteList).map((w) =>
    w.toLowerCase(),
  );
  const whiteListSet = new Set([
    ...BUILTIN_HARMLESS_WHITELIST,
    ...userWhiteList,
  ]);

  const blockedList = parseKeywordList(settings.customBlockedKeywords);
  const suspiciousList = parseKeywordList(settings.customSuspiciousKeywords);

  const enableDefault = parseBool(settings.enableDefaultDict, true);
  const enablePolitics = parseBool(settings.enablePolitics, true);
  const enableViolence = parseBool(settings.enableViolence, true);
  const enablePorn = parseBool(settings.enablePorn, true);
  const enableContraband = parseBool(settings.enableContraband, true);
  const enableAd = parseBool(settings.enableAd, false);
  const enableOther = parseBool(settings.enableOther, true);

  const isDefaultCategories =
    enablePolitics === true &&
    enableViolence === true &&
    enablePorn === true &&
    enableContraband === true &&
    enableAd === false &&
    enableOther === true;

  // 如果没有自定义词、启用默认词库且分类配置为默认，直接复用单例自动机
  if (
    blockedList.length === 0 &&
    suspiciousList.length === 0 &&
    enableDefault &&
    isDefaultCategories
  ) {
    return {
      automaton: getDefaultAutomaton(),
      whiteListSet,
    };
  }

  // 构建临时自动机（合并自定义与可选的默认词库）
  const ac = new AhoCorasick();

  if (enableDefault) {
    const categoryFilters = {
      politics: enablePolitics,
      violence: enableViolence,
      porn: enablePorn,
      contraband: enableContraband,
      ad: enableAd,
      other: enableOther,
    };

    for (const [category, words] of Object.entries(
      coreBlockCategorizedKeywords,
    )) {
      if (!categoryFilters[category as keyof typeof categoryFilters]) continue;
      ac.addWords(words, category, true);
    }

    for (const [category, words] of Object.entries(
      suspectedCategorizedKeywords,
    )) {
      if (!categoryFilters[category as keyof typeof categoryFilters]) continue;
      ac.addWords(words, category, false);
    }
  }

  // 添加自定义拦截词 (isBlocked = true)
  for (const item of blockedList) {
    const parts = item.split(":");
    const word = parts[0]?.trim();
    const category = parts[1]?.trim() || "custom";
    if (word) {
      ac.addWord(word, category, true);
    }
  }

  // 添加自定义疑似词 (isBlocked = false)
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
