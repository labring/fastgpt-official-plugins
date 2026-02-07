import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "SearchApi",
    en: "SearchApi",
  },
  tutorialUrl: "https://www.searchapi.io/",
  tags: [ToolTagEnum.search],
  description: {
    "zh-CN": "SearchApi 服务",
    en: "SearchApi Service",
  },
  secretInputConfig: [
    {
      key: "apiKey",
      label: "Search API Key",
      required: true,
      inputType: "secret",
    },
  ],
});
