import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
  type SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";

const inputSchema = defineInputSchema({
  text: {
    type: z
      .string()
      .min(1)
      .meta({
        placeholder: "请输入要回显的内容",
        "x-i18n": {
          placeholder: {
            en: "Enter text to echo",
            "zh-CN": "请输入要回显的内容",
            "zh-Hant": "請輸入要回顯的內容",
          },
        },
      }),
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
    isToolParam: true,
  },
  fallbackText: {
    type: z.string().optional(),
    title: {
      en: "Fallback field",
      "zh-CN": "回退字段",
    },
    description: {
      en: "Traditional Chinese is intentionally omitted to test locale fallback.",
      "zh-CN": "故意不提供繁体中文译文，用于验证语言回退。",
    },
    isToolParam: false,
  },
});

const fullInputSchema = inputSchema.extend({
  legacyText: z.string().optional().meta({
    title: "旧格式单语言字段",
    description: "此字段没有 x-i18n，用于验证旧插件字符串兼容。",
  }),
});

const secretSchema = z.object({
  testSecret: z
    .string()
    .optional()
    .meta({
      title: "可选测试密钥",
      description: "此密钥不会发送到外部服务，仅用于测试密钥字段的本地化。",
      placeholder: "输入任意测试值",
      "x-i18n": {
        title: {
          en: "Optional test secret",
          "zh-CN": "可选测试密钥",
          "zh-Hant": "可選測試密鑰",
        },
        description: {
          en: "This secret is not sent to an external service; it only tests localized secret-field metadata.",
          "zh-CN": "此密钥不会发送到外部服务，仅用于测试密钥字段的本地化。",
          "zh-Hant": "此密鑰不會傳送至外部服務，僅用於測試密鑰欄位的本地化。",
        },
        placeholder: {
          en: "Enter any test value",
          "zh-CN": "输入任意测试值",
          "zh-Hant": "輸入任意測試值",
        },
      },
      isSecret: true,
    } satisfies SecretSchemaMetaType),
});

const outputSchema = defineOutputSchema({
  echo: {
    type: z.string(),
    title: {
      en: "Echo result",
      "zh-CN": "回显结果",
      "zh-Hant": "回顯結果",
    },
    description: {
      en: "The same value as the input text.",
      "zh-CN": "与输入文本相同。",
      "zh-Hant": "與輸入文字相同。",
    },
  },
  fallbackEcho: {
    type: z.string(),
    title: {
      en: "Fallback field result",
      "zh-CN": "回退字段结果",
    },
    description: {
      en: "Traditional Chinese is intentionally omitted to test output-field locale fallback.",
      "zh-CN": "故意不提供繁体中文译文，用于验证输出字段语言回退。",
    },
  },
});

const fullOutputSchema = outputSchema.extend({
  legacyEcho: z.string().meta({
    title: "旧格式输出字段",
    description: "此字段没有 x-i18n，用于验证旧 schema 字符串兼容。",
  }),
});

const handler = createToolHandler({
  inputSchema: fullInputSchema,
  outputSchema: fullOutputSchema,
  secretSchema,
  handler: async (input) => ({
    echo: input.text,
    fallbackEcho: input.fallbackText ?? "",
    legacyEcho: input.legacyText ?? "",
  }),
});

export default defineTool({
  manifest: {
    pluginId: "i18nTest",
    name: {
      en: "I18n Metadata Test",
      "zh-CN": "多语言元数据测试",
      "zh-Hant": "多語言中繼資料測試",
    },
    description: {
      en: "Echo the supplied text unchanged to test localized plugin metadata, JSON Schema field labels, and legacy string compatibility.",
      "zh-CN":
        "原样回显提供的文本，用于测试插件元数据、JSON Schema 字段本地化和旧字符串兼容。",
      "zh-Hant":
        "原樣回顯提供的文字，用於測試外掛中繼資料、JSON Schema 欄位本地化與舊字串相容。",
    },
    version: "0.2.0",
    versionDescription: {
      en: "Add localized tool descriptions and schema metadata",
      "zh-CN": "新增多语言工具说明和 Schema 字段元数据",
      "zh-Hant": "新增多語言工具說明和 Schema 欄位中繼資料",
    },
    tags: ["tools"],
  },
  handler,
});
