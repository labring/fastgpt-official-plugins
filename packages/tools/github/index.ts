import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
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
  token: z
    .string()
    .optional()
    .meta({
      title: "GitHub Token",
      description: "可选，填写后可提升 API 速率或访问更多信息",
      isSecret: true,
      "x-i18n": {
        title: { en: "GitHub token", "zh-CN": "GitHub Token" },
        description: {
          en: "Optional. Add a token to increase API rate limits or access more information.",
          "zh-CN": "可选，填写后可提升 API 速率或访问更多信息",
        },
      },
    }),
});

const repositoryInfoQuerySecretSchema = z.object({});
const repositoryInfoQueryInputSchema = defineInputSchema({
  owner: {
    type: z.string(),
    title: { en: "Repository owner", "zh-CN": "仓库拥有者" },
    description: {
      en: "GitHub repository owner username, e.g. facebook.",
      "zh-CN": "GitHub 仓库拥有者用户名，如 facebook",
    },
    isToolParam: true,
  },
  repo: {
    type: z.string(),
    title: { en: "Repository name", "zh-CN": "仓库名" },
    description: {
      en: "GitHub repository name, e.g. react.",
      "zh-CN": "GitHub 仓库名，如 react",
    },
    isToolParam: true,
  },
});
const repositoryInfoQueryOutputSchema = defineOutputSchema({
  info: {
    type: defineOutputSchema({
      full_name: {
        type: z.string(),
        title: { en: "Full repository name", "zh-CN": "仓库全名" },
        description: {
          en: "Owner and repository name.",
          "zh-CN": "仓库拥有者和仓库名称。",
        },
      },
      description: {
        type: z.string().nullable(),
        title: { en: "Description", "zh-CN": "仓库描述" },
        description: {
          en: "Repository description, or null when not set.",
          "zh-CN": "仓库描述；未设置时为 null。",
        },
      },
      stargazers_count: {
        type: z.number(),
        title: { en: "Stars", "zh-CN": "Star 数" },
        description: {
          en: "Number of GitHub stars.",
          "zh-CN": "GitHub Star 数量。",
        },
      },
      forks_count: {
        type: z.number(),
        title: { en: "Forks", "zh-CN": "Fork 数" },
        description: {
          en: "Number of repository forks.",
          "zh-CN": "仓库 Fork 数量。",
        },
      },
      open_issues_count: {
        type: z.number(),
        title: { en: "Open issues", "zh-CN": "开放 Issue 数" },
        description: {
          en: "Number of open issues.",
          "zh-CN": "开放 Issue 的数量。",
        },
      },
      language: {
        type: z.string().nullable(),
        title: { en: "Primary language", "zh-CN": "主要语言" },
        description: {
          en: "Primary repository language, or null when unavailable.",
          "zh-CN": "仓库主要语言；不可用时为 null。",
        },
      },
      html_url: {
        type: z.string(),
        title: { en: "Repository URL", "zh-CN": "仓库链接" },
        description: {
          en: "URL of the repository on GitHub.",
          "zh-CN": "GitHub 上的仓库链接。",
        },
      },
      topics: {
        type: z.array(z.string()).optional(),
        title: { en: "Topics", "zh-CN": "主题标签" },
        description: {
          en: "Repository topics, when available.",
          "zh-CN": "仓库主题标签（如有）。",
        },
      },
      created_at: {
        type: z.string(),
        title: { en: "Created at", "zh-CN": "创建时间" },
      },
      updated_at: {
        type: z.string(),
        title: { en: "Updated at", "zh-CN": "更新时间" },
      },
      pushed_at: {
        type: z.string(),
        title: { en: "Last pushed at", "zh-CN": "最近推送时间" },
      },
    }),
    title: { en: "Repository information", "zh-CN": "仓库基本信息" },
    description: {
      en: "Repository details including stars, forks, description, language, and topics.",
      "zh-CN": "包含 star 数、fork 数、描述、语言和 topics 等仓库信息。",
    },
  },
  readme: {
    type: z.string().nullable(),
    title: { en: "README content", "zh-CN": "README 内容" },
    description: {
      en: "Raw Markdown content of the repository README, or null when unavailable.",
      "zh-CN": "仓库 README 的原始 Markdown 内容；不可用时为 null。",
    },
  },
  license: {
    type: defineOutputSchema({
      key: {
        type: z.string(),
        title: { en: "License key", "zh-CN": "许可证标识" },
      },
      name: {
        type: z.string(),
        title: { en: "License name", "zh-CN": "许可证名称" },
      },
      spdx_id: {
        type: z.string(),
        title: { en: "SPDX identifier", "zh-CN": "SPDX 标识" },
      },
      url: {
        type: z.string().nullable(),
        title: { en: "License URL", "zh-CN": "许可证链接" },
      },
    }).nullable(),
    title: { en: "License information", "zh-CN": "License 信息" },
    description: {
      en: "Repository license details, or null when no license is available.",
      "zh-CN": "仓库许可证信息；无许可证时为 null。",
    },
  },
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
    const output = await repositoryInfoQueryTool(parsedInput);
    return repositoryInfoQueryOutputType.parseAsync(output);
  },
});

const userInfoQuerySecretSchema = z.object({});
const userInfoQueryInputSchema = defineInputSchema({
  username: {
    type: z.string(),
    title: { en: "GitHub username", "zh-CN": "GitHub 用户名" },
    description: {
      en: "GitHub username to look up, e.g. octocat.",
      "zh-CN": "要查询的 GitHub 用户名，如 octocat",
    },
    isToolParam: true,
  },
});
const userInfoQueryOutputSchema = defineOutputSchema({
  userInfo: {
    type: defineOutputSchema({
      login: { type: z.string(), title: { en: "Username", "zh-CN": "用户名" } },
      id: { type: z.number(), title: { en: "User ID", "zh-CN": "用户 ID" } },
      avatar_url: {
        type: z.string(),
        title: { en: "Avatar URL", "zh-CN": "头像链接" },
      },
      html_url: {
        type: z.string(),
        title: { en: "Profile URL", "zh-CN": "个人资料链接" },
      },
      name: {
        type: z.string().nullable(),
        title: { en: "Display name", "zh-CN": "显示名称" },
      },
      company: {
        type: z.string().nullable(),
        title: { en: "Company", "zh-CN": "公司" },
      },
      blog: {
        type: z.string().nullable(),
        title: { en: "Blog", "zh-CN": "博客" },
      },
      location: {
        type: z.string().nullable(),
        title: { en: "Location", "zh-CN": "所在地" },
      },
      email: {
        type: z.string().nullable(),
        title: { en: "Email", "zh-CN": "邮箱" },
      },
      bio: {
        type: z.string().nullable(),
        title: { en: "Bio", "zh-CN": "个人简介" },
      },
      public_repos: {
        type: z.number(),
        title: { en: "Public repositories", "zh-CN": "公开仓库数" },
      },
      followers: {
        type: z.number(),
        title: { en: "Followers", "zh-CN": "关注者数" },
      },
      following: {
        type: z.number(),
        title: { en: "Following", "zh-CN": "正在关注数" },
      },
      created_at: {
        type: z.string(),
        title: { en: "Created at", "zh-CN": "创建时间" },
      },
      updated_at: {
        type: z.string(),
        title: { en: "Updated at", "zh-CN": "更新时间" },
      },
    }),
    title: { en: "User information", "zh-CN": "用户基本信息" },
    description: {
      en: "Public GitHub user profile, including avatar, bio, followers, and repository count.",
      "zh-CN": "GitHub 用户公开信息，如头像、bio、粉丝数和仓库数等。",
    },
  },
  repos: {
    type: z.array(
      defineOutputSchema({
        name: {
          type: z.string(),
          title: { en: "Repository name", "zh-CN": "仓库名" },
        },
        full_name: {
          type: z.string(),
          title: { en: "Full repository name", "zh-CN": "仓库全名" },
        },
        html_url: {
          type: z.string(),
          title: { en: "Repository URL", "zh-CN": "仓库链接" },
        },
        description: {
          type: z.string().nullable(),
          title: { en: "Description", "zh-CN": "仓库描述" },
        },
        stargazers_count: {
          type: z.number(),
          title: { en: "Stars", "zh-CN": "Star 数" },
        },
        forks_count: {
          type: z.number(),
          title: { en: "Forks", "zh-CN": "Fork 数" },
        },
        language: {
          type: z.string().nullable(),
          title: { en: "Primary language", "zh-CN": "主要语言" },
        },
        created_at: {
          type: z.string(),
          title: { en: "Created at", "zh-CN": "创建时间" },
        },
        updated_at: {
          type: z.string(),
          title: { en: "Updated at", "zh-CN": "更新时间" },
        },
        pushed_at: {
          type: z.string(),
          title: { en: "Last pushed at", "zh-CN": "最近推送时间" },
        },
      }),
    ),
    title: { en: "Public repositories", "zh-CN": "公开仓库列表" },
    description: {
      en: "All public repositories for this user.",
      "zh-CN": "该用户的所有公开仓库。",
    },
  },
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
    const output = await userInfoQueryTool(parsedInput);
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
      "zh-CN": "初始版本",
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
