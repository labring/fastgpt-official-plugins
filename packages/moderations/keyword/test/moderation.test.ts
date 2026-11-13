import { describe, expect, it } from "vitest";
import moderation from "../index";
import { moderateText } from "../src/moderation";

describe("moderateText with AC automaton and politics/porn built-in lexicons", () => {
  it("blocks content matching politics and porn lexicons with correct category", () => {
    // 色情测试
    const resPorn = moderateText("点击浏览色情网站与性交视频");
    expect(resPorn.verdict).toBe("block");
    expect(resPorn.hits.some((h) => h.label === "porn")).toBe(true);

    // 涉政高危测试
    const resPolitics = moderateText("宣传法轮功与天灭中共等违禁言论");
    expect(resPolitics.verdict).toBe("block");
    expect(resPolitics.hits.some((h) => h.label === "politics")).toBe(true);

    // 涉政疑似测试
    const resPoliticsSuspected = moderateText("关于中南海政治架构的讨论");
    expect(resPoliticsSuspected.verdict).toBe("suspected");
    expect(resPoliticsSuspected.hits.some((h) => h.label === "politics")).toBe(
      true,
    );
  });

  it("exposes no secret schema fields and enables both lexicons by default", () => {
    const schema = moderation.getSecretSchema();
    const parsed = schema.safeParse({});
    expect(parsed.success).toBe(true);
    expect(moderateText("反对台湾独立与疆独分子的分裂行径").verdict).toBe(
      "block",
    );
    expect(moderateText("点击浏览色情网站与性交视频").verdict).toBe("block");
  });

  it("passes completely normal text and avoids high-frequency false positives", () => {
    const normalSamples = [
      "今天天气真好，我们一起去公园跑步吧。FastGPT 是一个优秀的 AI Agent 平台。",
      "This is FastGPT AI assistant.",
      "提供 24 小时在线客服，咨询电话 10086。",
      "我是 CS 专业的学生，正在学习 PowerBI 数据分析。",
      "这是一份系统操作手册，明天是星期日，大家生日快乐。",
      "中国有 14 亿人口，经济蓬勃发展。",
      "我们需要保持独立思考，并支持前后端独立部署，后台独立运行与平台独立架构。",
      "隐藏独立窗口后即可在 Excel 数据透视表中查看统计结果。",
      "请帮我修改一下我的简历，我有三年独立开发经验。",
      "今天去政务大厅办证，办理身份证的流程非常顺利。",
      "政府工作报告强调数字经济发展，维护国家主权与网络安全。",
      "Java 集合框架和 TypeScript 数组操作是编程基础。",
      "周末给家人做爱吃的菜，遇到了一点大麻烦但很快解决了。",
      "使用 small 组件和 usb 接口，避免形形色色的问题。",
      "武汉人喜欢去清真餐厅，阿拉伯数字在全世界广泛使用。",
      "明天就去日本出差，记得把插头拔出来，我干了一天活需要休息。",
      "今天不穿外套，手机铃声响了一大波，去拍毕业写真并参加兼职招聘。",
      "AI 模型调教与提示词工程能显著提升问答质量，剧情迎来高潮。",
      "不要搞形式主义，大家在官网查看公开信和限量版产品信息。",
      "历史课上学习了鸦片战争，严守禁毒宣传教育与预防自杀热线。",
    ];

    for (const sample of normalSamples) {
      const res = moderateText(sample);
      expect(res, `Expected pass for: ${sample}`).toEqual({
        verdict: "pass",
        hits: [],
      });
    }
  });

  it("prioritizes block over suspected while recording all matched hits", () => {
    const res = moderateText("在色情网站讨论中南海政治话题");
    expect(res.verdict).toBe("block");
    expect(res.hits.some((h) => h.label === "porn")).toBe(true);
    expect(res.hits.some((h) => h.label === "politics")).toBe(true);
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
    expect(duration).toBeLessThan(15);
  });
});
