import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "硅基流动",
    en: "Silicon Flow",
  },
  tags: [ToolTagEnum.multimodal],
  description: {
    "zh-CN": "这是一个硅基流动工具集",
    en: "This is a Silicon Flow tool set",
  },
  tutorialUrl: "https://cloud.siliconflow.cn/i/TR9Ym0c4",
  secretInputConfig: [
    {
      key: "authorization",
      label: "接口凭证（不需要 Bearer）",
      description: "sk-xxxx",
      required: true,
      inputType: "secret",
    },
  ],
});
