import { defineToolSet, ToolTagEnum } from "@fastgpt-plugin/helpers";

export default defineToolSet({
  name: {
    "zh-CN": "获取 FastGPT 信息",
    en: "Get FastGPT Info",
  },
  tags: [ToolTagEnum.tools],
  description: {
    "zh-CN": "获取 FastGPT 中用户、团队等信息",
    en: "Get information about users, teams, and other entities in FastGPT",
  },
  secretInputConfig: [],
});
