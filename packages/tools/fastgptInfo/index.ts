import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as getUserInfoInputType,
  OutputType as getUserInfoOutputType,
  tool as getUserInfoTool,
} from "./children/getUserInfo";

const secretSchema = z.object({});

const getUserInfoInputSchema = z.object({});
const getUserInfoOutputSchema = z.object({
  username: z.string().meta({
    title: "账户名",
    description: "当前账户名",
  }),
  memberName: z.string().nullish().meta({
    title: "成员名",
    description: "当前成员名",
  }),
  contact: z.string().nullish().meta({
    title: "联系方式",
    description: "当前联系方式",
  }),
  orgs: z.array(z.record(z.string(), z.unknown())).meta({
    title: "组织",
    description: "当前组织",
  }),
  groups: z.array(z.record(z.string(), z.unknown())).meta({
    title: "群组",
    description: "当前群组",
  }),
});

const getUserInfoHandler = createToolHandler({
  inputSchema: getUserInfoInputSchema,
  outputSchema: getUserInfoOutputSchema,
  secretSchema: secretSchema,
  handler: async (input, ctx) => {
    const output = await getUserInfoTool({}, ctx);
    return output;
    // return getUserInfoOutputType.parse(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "fastgptInfo",
    name: {
      en: "FastGPT Information Retrieval",
      "zh-CN": "FastGPT 信息获取 ",
    },
    description: {
      en: "Retrieve information from FastGPT",
      "zh-CN": "获取 FastGPT 中的信息",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    tags: ["tools"],
    permission: ["userInfo:read"],
  },
  secretSchema,
  children: [
    {
      id: "getUserInfo",
      name: {
        en: "Get User Information",
        "zh-CN": "获取用户信息",
      },
      description: {
        en: "Get user information",
        "zh-CN": "获取用户信息",
      },
      handler: getUserInfoHandler,
    },
  ],
});

export default toolSet;
