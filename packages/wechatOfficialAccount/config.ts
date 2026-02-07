import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "微信公众号工具集",
    en: "WeChat Official Account Tool Set",
  },
  tags: [ToolTagEnum.social],
  description: {
    "zh-CN": "微信公众号素材管理、草稿管理和发布工具集",
    en: "WeChat Official Account materials, drafts and publishing management tool set",
  },
  toolDescription:
    "WeChat Official Account API tools for managing materials, drafts and publishing articles",
  secretInputConfig: [
    {
      key: "appId",
      label: "AppID",
      description: "微信公众号开发者ID(AppID)",
      required: false,
      inputType: "input",
    },
    {
      key: "secret",
      label: "AppSecret",
      description: "微信公众号开发者密钥(AppSecret)",
      required: false,
      inputType: "secret",
    },
  ],
});
