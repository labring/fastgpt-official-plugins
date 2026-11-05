import { describe, expect, it } from "vitest";
import { moderateText } from "../src/moderation";

describe("moderateText", () => {
  it("blocks content containing a blocked keyword case-insensitively", () => {
    expect(
      moderateText("This contains a BLOCKED phrase.", {
        blockedKeywords: "blocked phrase",
      }),
    ).toEqual({
      verdict: "block",
      hits: [
        {
          label: "other",
          providerLabel: "keyword",
          keywords: ["blocked phrase"],
        },
      ],
    });
  });

  it("returns suspected for suspicious keywords when nothing is blocked", () => {
    expect(
      moderateText("Please review this", {
        blockedKeywords: "blocked",
        suspiciousKeywords: "review, inspect",
      }),
    ).toEqual({
      verdict: "suspected",
      hits: [
        { label: "other", providerLabel: "keyword", keywords: ["review"] },
      ],
    });
  });

  it("gives blocked keywords priority over suspicious keywords", () => {
    expect(
      moderateText("review and blocked", {
        blockedKeywords: "blocked",
        suspiciousKeywords: "review",
      }).verdict,
    ).toBe("block");
  });

  it("passes content when no configured keyword matches", () => {
    expect(
      moderateText("hello world", {
        blockedKeywords: "blocked",
        suspiciousKeywords: "review",
      }),
    ).toEqual({
      verdict: "pass",
      hits: [],
    });
  });

  it("ignores blank keywords and duplicate matches", () => {
    expect(
      moderateText("bad input", { blockedKeywords: ", bad, bad, " }),
    ).toEqual({
      verdict: "block",
      hits: [{ label: "other", providerLabel: "keyword", keywords: ["bad"] }],
    });
  });
});
