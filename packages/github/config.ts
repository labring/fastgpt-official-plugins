import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "GitHub 工具集",
    en: "GitHub Tool Set",
  },
  tags: [ToolTagEnum.tools],
  description: {
    "zh-CN": "GitHub 工具集",
    en: "GitHub Tool Set",
  },
  secretInputConfig: [
    {
      key: "token",
      label: "GitHub Token",
      description: "可选，填写后可提升API速率或访问更多信息",
      inputType: "secret",
      required: false,
    },
  ],
});
