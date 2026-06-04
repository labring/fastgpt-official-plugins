import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as repositoryInfoQueryInputType,
  OutputType as repositoryInfoQueryOutputType,
  tool as repositoryInfoQueryTool,
} from "./children/repositoryInfoQuery";
import {
  InputType as userInfoQueryInputType,
  OutputType as userInfoQueryOutputType,
  tool as userInfoQueryTool,
} from "./children/userInfoQuery";

const secretSchema = z.object({
  token: z.string().optional().meta({
    title: "GitHub Token",
    description: "可选，填写后可提升API速率或访问更多信息",
    isSecret: true,
  }),
});

const repositoryInfoQuerySecretSchema = z.object({});
const repositoryInfoQueryInputSchema = z.object({
  owner: z.string().meta({
    title: "仓库拥有者",
    description: "GitHub 仓库的拥有者用户名，如 facebook",
    toolDescription: "GitHub 仓库的拥有者用户名, 如 facebook",
  }),
  repo: z.string().meta({
    title: "仓库名",
    description: "GitHub 仓库名，如 react",
    toolDescription: "GitHub 仓库名，如 react",
  }),
});

const repositoryInfoQueryOutputSchema = z.object({
  info: z.record(z.string(), z.unknown()).meta({
    title: "仓库基本信息",
    description: "包含star数、fork数、描述、语言、topics等",
  }),
  readme: z.string().meta({
    title: "README内容",
    description: "仓库README的markdown原文内容",
  }),
  license: z.record(z.string(), z.unknown()).meta({
    title: "License信息",
    description: "仓库的license信息，如MIT、Apache-2.0等",
  }),
});
const repositoryInfoQueryHandler = createToolHandler({
  inputSchema: repositoryInfoQueryInputSchema,
  outputSchema: repositoryInfoQueryOutputSchema,
  secretSchema: repositoryInfoQuerySecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await repositoryInfoQueryInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await repositoryInfoQueryTool(parsedInput, ctx);
    return repositoryInfoQueryOutputType.parseAsync(output);
  },
});

const userInfoQuerySecretSchema = z.object({});
const userInfoQueryInputSchema = z.object({
  username: z.string().meta({
    title: "GitHub 用户名",
    description: "要查询的 GitHub 用户名，如 octocat",
    toolDescription: "要查询的 GitHub 用户名，如 octocat",
  }),
});
const userInfoQueryOutputSchema = z.object({
  userInfo: z.record(z.string(), z.unknown()).meta({
    title: "用户基本信息",
    description: "GitHub 用户的公开信息，如头像、bio、粉丝数、仓库数等",
  }),
  repos: z.array(z.record(z.string(), z.unknown())).meta({
    title: "公开仓库列表",
    description: "该用户的所有公开仓库",
  }),
});
const userInfoQueryHandler = createToolHandler({
  inputSchema: userInfoQueryInputSchema,
  outputSchema: userInfoQueryOutputSchema,
  secretSchema: userInfoQuerySecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await userInfoQueryInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await userInfoQueryTool(parsedInput, ctx);
    return userInfoQueryOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "github",
    name: {
      en: "GitHub Tool Set",
      "zh-CN": "GitHub 工具集",
    },
    description: {
      en: "GitHub Tool Set",
      "zh-CN": "GitHub 工具集",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "repositoryInfoQuery",
      name: {
        en: "GitHub Repository Info Query",
        "zh-CN": "GitHub 仓库信息查询",
      },
      description: {
        en: "Query any public repository for basic info (stars, forks, description, language, etc.), README content, and license info. Optional GitHub token for higher rate limit or private repos.",
        "zh-CN":
          "查询任意公开仓库的基本信息（star数、fork数、描述、语言等）、README内容和license信息。可选GitHub Token以提升速率或访问私有仓库。",
      },
      handler: repositoryInfoQueryHandler,
    },
    {
      id: "userInfoQuery",
      name: {
        en: "GitHub User Info Query",
        "zh-CN": "GitHub 用户信息查询",
      },
      description: {
        en: "Query any GitHub user's public info (avatar, bio, followers, repo count, etc.) and public repo list. Optional GitHub token for higher rate limit.",
        "zh-CN":
          "查询任意 GitHub 用户的公开信息（头像、bio、粉丝数、仓库数等）和公开仓库列表。可选 GitHub Token 以提升速率或访问更多信息。",
      },
      handler: userInfoQueryHandler,
    },
  ],
});

export default toolSet;
