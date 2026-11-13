import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import { checkText, secretSchema } from "./src/moderation";

export default defineModeration({
  manifest: defineModerationManifest({
    pluginId: "aliyun-text-moderation",
    version: "1.0.0",
    name: {
      en: "Alibaba Cloud Text Moderation",
      "zh-CN": "阿里云文本内容审查",
    },
    description: {
      en: "Review text with Alibaba Cloud TextModerationPlus and return risk levels and detailed hits.",
      "zh-CN":
        "通过阿里云 TextModerationPlus 同步审核文本，返回风险裁决、原生置信度和全部命中明细。",
    },
    meta: {
      provider: "aliyun",
      docUrl: "https://help.aliyun.com/zh/content-moderation/",
    },
  }),
  secretSchema,
  provider: {
    name: "aliyun",
    check: (input, ctx) => checkText(input, ctx.secrets),
  },
});
