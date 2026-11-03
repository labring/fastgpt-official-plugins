import { describe, expect, it } from "vitest";
import z from "zod";

import plugin from "./index";

const handler = plugin.getToolHandler();

describe("i18n metadata test tool", () => {
  it("validates inputs and echoes optional and legacy values", async () => {
    const input = handler.inputSchema.parse({
      text: "Hello FastGPT",
      fallbackText: "Fallback value",
      legacyText: "Legacy value",
      unknown: "stripped",
    });

    expect(input).toEqual({
      text: "Hello FastGPT",
      fallbackText: "Fallback value",
      legacyText: "Legacy value",
    });
    expect(handler.inputSchema.safeParse({}).success).toBe(false);
    await expect(handler.handler(input, undefined as never)).resolves.toEqual({
      echo: "Hello FastGPT",
      fallbackEcho: "Fallback value",
      legacyEcho: "Legacy value",
    });
  });

  it("keeps localized helper metadata and schema-owned placeholders", () => {
    const inputJsonSchema = z.toJSONSchema(handler.inputSchema);

    expect(inputJsonSchema.properties?.text).toMatchObject({
      title: "回显文本",
      description: "输入一段文本，插件会原样回显提供的内容。",
      placeholder: "请输入要回显的内容",
      isToolParam: true,
      "x-i18n": {
        title: {
          en: "Text to echo",
          "zh-CN": "回显文本",
          "zh-Hant": "回顯文字",
        },
        description: {
          en: "Enter text and the plugin echoes the supplied value unchanged.",
          "zh-CN": "输入一段文本，插件会原样回显提供的内容。",
          "zh-Hant": "輸入一段文字，外掛會原樣回顯提供的內容。",
        },
        placeholder: {
          en: "Enter text to echo",
          "zh-CN": "请输入要回显的内容",
          "zh-Hant": "請輸入要回顯的內容",
        },
      },
    });
    expect(inputJsonSchema.properties?.text).not.toHaveProperty(
      "toolDescription",
    );
    expect(inputJsonSchema.properties?.fallbackText).toMatchObject({
      isToolParam: false,
      "x-i18n": {
        title: { en: "Fallback field", "zh-CN": "回退字段" },
        description: {
          en: "Traditional Chinese is intentionally omitted to test locale fallback.",
          "zh-CN": "故意不提供繁体中文译文，用于验证语言回退。",
        },
      },
    });
    expect(inputJsonSchema.required).toContain("text");
    expect(inputJsonSchema.required).not.toContain("fallbackText");
    expect(inputJsonSchema.properties?.legacyText).toMatchObject({
      title: "旧格式单语言字段",
      description: "此字段没有 x-i18n，用于验证旧插件字符串兼容。",
    });
    expect(inputJsonSchema.properties?.legacyText).not.toHaveProperty("x-i18n");
  });

  it("keeps output fallback and secret field metadata", () => {
    const outputJsonSchema = z.toJSONSchema(handler.outputSchema);
    const secretJsonSchema = z.toJSONSchema(plugin.getSecretSchema());

    expect(outputJsonSchema.properties?.fallbackEcho).toMatchObject({
      title: "回退字段结果",
      "x-i18n": {
        title: { en: "Fallback field result", "zh-CN": "回退字段结果" },
        description: {
          en: "Traditional Chinese is intentionally omitted to test output-field locale fallback.",
          "zh-CN": "故意不提供繁体中文译文，用于验证输出字段语言回退。",
        },
      },
    });
    expect(outputJsonSchema.properties?.legacyEcho).not.toHaveProperty(
      "x-i18n",
    );
    expect(secretJsonSchema.properties?.testSecret).toMatchObject({
      isSecret: true,
      "x-i18n": {
        title: {
          en: "Optional test secret",
          "zh-CN": "可选测试密钥",
          "zh-Hant": "可選測試密鑰",
        },
        placeholder: {
          en: "Enter any test value",
          "zh-CN": "输入任意测试值",
          "zh-Hant": "輸入任意測試值",
        },
      },
    });
  });
});
