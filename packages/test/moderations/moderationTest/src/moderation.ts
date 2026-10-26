export type ModerationVerdict = "pass" | "block" | "suspected";

export type ModerationHit = {
  label: "other";
  providerLabel: "keyword";
  keywords: string[];
};

export type ModerationOutcome = {
  verdict: ModerationVerdict;
  hits: ModerationHit[];
};

export type KeywordSettings = {
  blockedKeywords?: string | undefined;
  suspiciousKeywords?: string | undefined;
};

function parseKeywords(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}

function findMatches(content: string, keywords: string[]): string[] {
  const normalizedContent = content.toLowerCase();
  return [
    ...new Set(
      keywords.filter((keyword) =>
        normalizedContent.includes(keyword.toLowerCase()),
      ),
    ),
  ];
}

function createHits(keywords: string[]): ModerationHit[] {
  return keywords.map((keyword) => ({
    label: "other",
    providerLabel: "keyword",
    keywords: [keyword],
  }));
}

/** Apply blocked keywords first, then suspicious keywords, using case-insensitive substring matching. */
export function moderateText(
  content: string,
  settings: KeywordSettings,
): ModerationOutcome {
  const blocked = findMatches(content, parseKeywords(settings.blockedKeywords));
  if (blocked.length > 0) {
    return {
      verdict: "block",
      hits: createHits(blocked),
    };
  }

  const suspicious = findMatches(
    content,
    parseKeywords(settings.suspiciousKeywords),
  );
  if (suspicious.length > 0) {
    return {
      verdict: "suspected",
      hits: createHits(suspicious),
    };
  }

  return {
    verdict: "pass",
    hits: [],
  };
}
