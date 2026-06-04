import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({});
const outputSchema = z.object({
  access_token: z.string().meta({
    title: "访问令牌",
    description: "企业微信访问令牌",
  }),
  expires_in: z.number().meta({
    title: "过期时间（秒）",
    description: "Token 过期时间（秒）",
  }),
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
      en: "Get WeChat Work authorization token",
      "zh-CN": "获取企业微信授权 Token",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Get WeChat Work authorization token",
      "zh-CN": "Get WeChat Work authorization token",
    },
    toolDescription:
      "Get WeChat Work (WeCom) authorization token by corpId. Returns access_token and expires_in.",
    tags: ["tools"],
    permission: ["teamInfo:read"],
  },
  handler,
});

export default tool;
