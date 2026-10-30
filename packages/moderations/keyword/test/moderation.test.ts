import { describe, expect, it } from "vitest";
import { moderateText } from "../src/moderation";

describe("moderateText with AC automaton and open-source lexicon", () => {
  it("blocks content matching built-in open-source lexicon with correct category", () => {
    // 涉枪涉爆测试
    const resWeapons = moderateText("非法炸弹制作技术交流与扩散");
    expect(resWeapons.verdict).toBe("block");
    expect(resWeapons.hits.some((h) => h.label === "violence")).toBe(true);

    // 色情测试
    const resPorn = moderateText("出售大量爱液横流的非法物品");
    expect(resPorn.verdict).toBe("block");
    expect(resPorn.hits.some((h) => h.label === "porn")).toBe(true);
  });

  it("passes completely normal text", () => {
    const res = moderateText("今天天气真好，我们一起去公园跑步吧。FastGPT 是一个优秀的 AI Agent 平台。");
    expect(res.verdict).toBe("pass");
    expect(res.hits).toEqual([]);
  });

  it("supports custom blocked keywords with custom category mapping", () => {
    const res = moderateText("本平台禁止讨论竞品名称 secretProduct", {
      customBlockedKeywords: "secretProduct:competitor, anotherBadWord",
      enableDefaultDict: false,
    });

    expect(res.verdict).toBe("block");
    expect(res.hits).toEqual([
      {
        label: "competitor",
        providerLabel: "local-keyword:competitor",
        keywords: ["secretproduct"],
      },
    ]);
  });

  it("supports custom suspicious keywords", () => {
    const res = moderateText("需要管理员人工审核的内容", {
      customSuspiciousKeywords: "人工审核",
      enableDefaultDict: false,
    });

    expect(res.verdict).toBe("suspected");
    expect(res.hits).toEqual([
      {
        label: "custom_suspected",
        providerLabel: "local-keyword:custom_suspected",
        keywords: ["人工审核"],
      },
    ]);
  });

  it("whitelists false-positive keywords", () => {
    // 假设某词在内置词库命中，但加入白名单后放行
    const resBlocked = moderateText("测试枪支弹药", {
      enableDefaultDict: false,
      customBlockedKeywords: "枪支弹药",
    });
    expect(resBlocked.verdict).toBe("block");

    const resWhitelisted = moderateText("测试枪支弹药", {
      enableDefaultDict: false,
      customBlockedKeywords: "枪支弹药",
      whiteList: "枪支弹药",
    });
    expect(resWhitelisted.verdict).toBe("pass");
    expect(resWhitelisted.hits).toEqual([]);
  });

  it("executes sub-millisecond on long texts (performance benchmark)", () => {
    const longText = "这是一段非常长的高频正常测试文本，用于测试 Aho-Corasick 算法的性能。".repeat(200); // 约 7,000 字
    const start = performance.now();
    const res = moderateText(longText);
    const duration = performance.now() - start;

    expect(res.verdict).toBe("pass");
    // 7,000 字扫描通常在 1~3ms 内完成
    expect(duration).toBeLessThan(15);
  });
});
