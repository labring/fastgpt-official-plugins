import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "阿里云百炼",
    en: "Aliyun Model Studio",
  },
  tutorialUrl: "https://bailian.console.aliyun.com/",
  tags: [ToolTagEnum.multimodal],
  description: {
    "zh-CN":
      "这是一个阿里云百炼工具集，支持调用多种阿里云百炼平台提供的模型服务",
    en: "This is an Aliyun Model Studio toolset, supporting various model services provided by the Aliyun Model Studio platform",
  },
  secretInputConfig: [
    {
      key: "apiKey",
      label: "API Key",
      required: true,
      inputType: "secret",
    },
  ],
});
