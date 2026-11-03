import { describe, expect, it } from "vitest";
import { moderateText } from "../src/moderation";

describe("moderateText with AC automaton and open-source lexicon", () => {
  it("blocks content matching built-in open-source lexicon with correct category", () => {
    // 涉枪涉爆测试
    const resWeapons = moderateText("非法炸弹制作技术交流与扩散");
    expect(resWeapons.verdict).toBe("block");
    expect(resWeapons.hits.some((h) => h.label === "violence")).toBe(true);

    // 色情测试
    const resPorn = moderateText("点击浏览色情网站与做爱视频");
    expect(resPorn.verdict).toBe("block");
    expect(resPorn.hits.some((h) => h.label === "porn")).toBe(true);
  });

  it("passes completely normal text", () => {
    const res = moderateText(
      "今天天气真好，我们一起去公园跑步吧。FastGPT 是一个优秀的 AI Agent 平台。",
    );
    expect(res.verdict).toBe("pass");
    expect(res.hits).toEqual([]);
  });

  it("does not false-positive on common English words, numbers, or harmless daily terms", () => {
    // 1. 常见英文句子，不能因包含 'is' 被误杀
    const resIs = moderateText("This is FastGPT AI assistant.");
    expect(resIs.verdict).toBe("pass");

    // 2. 包含数字 24 或 10086 或客服，不能被误杀
    const res24 = moderateText("提供 24 小时在线客服，咨询电话 10086。");
    expect(res24.verdict).toBe("pass");

    // 3. 常见计算机与商业缩写，不能因包含 'CS' 或 'BI' 被误杀
    const resCS = moderateText("我是 CS 专业的学生，正在学习 PowerBI 数据分析。");
    expect(resCS.verdict).toBe("pass");

    // 4. 常见操作与日常动词，不能因包含 '操' 或 '日' 被误杀
    const resOperate = moderateText("这是一份系统操作手册，明天是星期日，大家生日快乐。");
    expect(resOperate.verdict).toBe("pass");

    // 5. 常见人口与统计数字，不能被误杀
    const resPop = moderateText("中国有 14 亿人口，经济蓬勃发展。");
    expect(resPop.verdict).toBe("pass");
  });

  it("supports category toggles to selectively disable categories", () => {
    // 涉暴测试
    const text = "非法制造炸药和雷管引爆技术";
    const resBlocked = moderateText(text, { enableViolence: true });
    expect(resBlocked.verdict).toBe("block");

    // 禁用暴恐分类后，该项不再被拦截
    const resDisabled = moderateText(text, { enableViolence: false });
    expect(resDisabled.verdict).toBe("pass");
  });

  it("supports custom blocked keywords with custom category mapping", () => {
    const res = moderateText("本平台禁止讨论竞品名称 secretProduct", {
      customBlockedKeywords: "secretProduct:competitor, anotherBadWord",
      enableDefaultDict: false,
    });

    expect(res.verdict).toBe("block");
    expect(res.hits).toEqual([
      {
        label: "other",
        providerLabel: "local-keyword:competitor",
        keywords: ["secretproduct"],
      },
    ]);
  });

  it("records all hits when text contains both block and suspected keywords", () => {
    const res = moderateText("这是一段同时包含高危违禁词炸药和人工审核词的内容", {
      enableDefaultDict: false,
      customBlockedKeywords: "炸药:violence",
      customSuspiciousKeywords: "人工审核:custom_suspected",
    });

    // 只要有 block 词，整体裁决为 block
    expect(res.verdict).toBe("block");
    // 一并输出全部命中的敏感词（包含 block 词和 suspected 词）
    expect(res.hits.some((h) => h.keywords.includes("炸药"))).toBe(true);
    expect(res.hits.some((h) => h.keywords.includes("人工审核"))).toBe(true);
  });

  it("detects contraband, ad, and violence from the full open-source lexicon", () => {
    // 违禁品测试
    const resDrugs = moderateText("高纯度甲基苯丙胺合成方法交流");
    expect(resDrugs.verdict).toBe("block");
    expect(resDrugs.hits.some((h) => h.label === "contraband" || h.label === "violence")).toBe(true);

    // 广告分类测试（启用广告分类时检测为 suspected 疑似）
    const resAd = moderateText("欢迎访问 www.97cao97gan.cn 获取更多资讯", {
      enableAd: true,
    });
    expect(resAd.verdict).toBe("suspected");
    expect(resAd.hits.some((h) => h.label === "ad" || h.label === "porn")).toBe(true);
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
    const longText =
      "这是一段非常长的高频正常测试文本，用于测试 Aho-Corasick 算法的性能。".repeat(
        200,
      ); // 约 7,000 字
    const start = performance.now();
    const res = moderateText(longText);
    const duration = performance.now() - start;

    expect(res.verdict).toBe("pass");
    // 7,000 字扫描通常在 1~3ms 内完成
    expect(duration).toBeLessThan(15);
  });
});
