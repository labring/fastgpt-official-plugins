import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import { checkText, secretSchema } from "./src/moderation";

export default defineModeration({
  manifest: defineModerationManifest({
    pluginId: "tencent-tms-moderation",
    version: "1.0.0",
    name: {
      en: "Tencent Cloud Text Moderation",
      "zh-CN": "腾讯云文本内容审查",
    },
    description: {
      en: "Synchronous Tencent Cloud TMS text moderation with configurable BizType policies and detailed risk hits.",
      "zh-CN":
        "使用腾讯云 TMS 同步审查文本，支持 BizType 策略配置，返回审核建议、风险标签、分数与命中词。",
    },
    meta: {
      provider: "tencent",
      docUrl: "https://cloud.tencent.com/document/api/1124/51860",
    },
  }),
  secretSchema,
  provider: {
    name: "tencent",
    check: (input, ctx) => checkText(input, ctx.secrets),
  },
});
