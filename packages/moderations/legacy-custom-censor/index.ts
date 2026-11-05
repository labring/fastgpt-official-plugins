import {
  defineModeration,
  defineModerationManifest,
} from "@fastgpt-plugin/sdk-factory";
import { createLegacyModerator, secretSchema } from "./src/moderation";

const check = createLegacyModerator();

export default defineModeration({
  manifest: defineModerationManifest({
    pluginId: "legacy-custom-censor",
    version: "1.0.0",
    name: { en: "Legacy Custom Moderation", "zh-CN": "旧版自定义审核兼容" },
    description: {
      en: "Connect existing FastGPT custom censor services using POST {text} and boolean success responses.",
      "zh-CN":
        "兼容旧版自定义安全审核接口，沿用 POST {text} 请求与布尔 success 响应，无需修改已有服务。",
    },
    versionDescription: {
      en: "Initial legacy HTTP adapter",
      "zh-CN": "首次发布旧版 HTTP 审核协议适配器",
    },
    meta: { provider: "legacy-custom-censor" },
  }),
  secretSchema,
  provider: {
    name: "legacy-custom-censor",
    check: (input, ctx) => check(input.content, ctx.secrets),
  },
});
