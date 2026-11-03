import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = defineInputSchema({});
const outputSchema = defineOutputSchema({
  access_token: {
    type: z.string(),
    title: { en: "Access token", "zh-CN": "访问令牌" },
    description: {
      en: "Authorization token for the WeChat Work API.",
      "zh-CN": "企业微信 API 的授权访问令牌。",
    },
  },
  expires_in: {
    type: z.number(),
    title: { en: "Expiration time (seconds)", "zh-CN": "过期时间（秒）" },
    description: {
      en: "Number of seconds until the access token expires.",
      "zh-CN": "访问令牌过期前的剩余秒数。",
    },
  },
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const [result, err] = await ctx.invoke.getWecomCorpToken();
    if (err) return Promise.reject(err);
    return result;
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "wecomCorpId",
    name: {
      en: "WeChat Work Auth",
      "zh-CN": "企业微信授权",
    },
    description: {
      en: "Get a WeChat Work (WeCom) authorization token using the corporation ID. Returns the access token and its expiration time.",
      "zh-CN": "使用企业 ID 获取企业微信授权令牌，并返回访问令牌及其过期时间。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Get WeChat Work authorization token",
      "zh-CN": "获取企业微信授权令牌",
    },
    tags: ["tools"],
    permission: ["teamInfo:read"],
  },
  handler,
});

export default tool;
