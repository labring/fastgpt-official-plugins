import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as getUserInfoInputType,
  tool as getUserInfoTool,
} from "./children/getUserInfo";

const secretSchema = z.object({});

const getUserInfoInputSchema = defineInputSchema({});
const getUserInfoOutputSchema = defineOutputSchema({
  username: {
    type: z.string(),
    title: { en: "Account name", "zh-CN": "账户名" },
    description: {
      en: "Name of the current account.",
      "zh-CN": "当前账户名。",
    },
  },
  memberName: {
    type: z.string().nullish(),
    title: { en: "Member name", "zh-CN": "成员名" },
    description: { en: "Name of the current member.", "zh-CN": "当前成员名。" },
  },
  contact: {
    type: z.string().nullish(),
    title: { en: "Contact information", "zh-CN": "联系方式" },
    description: {
      en: "Contact details for the current account.",
      "zh-CN": "当前联系方式。",
    },
  },
  orgs: {
    type: z.array(
      defineOutputSchema({
        pathId: {
          type: z.string(),
          title: { en: "Organization path ID", "zh-CN": "组织路径 ID" },
          description: {
            en: "Path identifier of the organization.",
            "zh-CN": "组织的路径标识。",
          },
        },
        name: {
          type: z.string(),
          title: { en: "Organization name", "zh-CN": "组织名称" },
          description: {
            en: "Name of the organization.",
            "zh-CN": "组织名称。",
          },
        },
      }),
    ),
    title: { en: "Organizations", "zh-CN": "组织" },
    description: {
      en: "Organizations associated with the current account.",
      "zh-CN": "当前账户所属组织。",
    },
  },
  groups: {
    type: z.array(
      defineOutputSchema({
        name: {
          type: z.string(),
          title: { en: "Group name", "zh-CN": "群组名称" },
          description: { en: "Name of the group.", "zh-CN": "群组名称。" },
        },
      }),
    ),
    title: { en: "Groups", "zh-CN": "群组" },
    description: {
      en: "Groups associated with the current account.",
      "zh-CN": "当前账户所属群组。",
    },
  },
});

const getUserInfoHandler = createToolHandler({
  inputSchema: getUserInfoInputSchema,
  outputSchema: getUserInfoOutputSchema,
  secretSchema: secretSchema,
  handler: async (input, ctx) => {
    const output = await getUserInfoTool({}, ctx);
    return output;
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
      "zh-CN": "初始版本",
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
