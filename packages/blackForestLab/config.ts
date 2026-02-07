import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "Flux 绘图",
    en: "Flux Drawing",
  },
  tutorialUrl: "https://www.flux.ai",
  tags: [ToolTagEnum.multimodal],
  description: {
    "zh-CN": "Flux官方绘图模型工具集",
    en: "Flux official drawing model toolset",
  },
  secretInputConfig: [
    {
      key: "apiKey",
      label: "API Key",
      description: "可以在 https://api.bfl.ai/ 获取 API Key",
      required: true,
      inputType: "secret",
    },
  ],
});
