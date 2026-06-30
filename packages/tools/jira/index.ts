import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as addCommentInputType,
  OutputType as addCommentOutputType,
  tool as addCommentTool,
} from "./children/addComment";
import {
  InputType as createIssueInputType,
  OutputType as createIssueOutputType,
  tool as createIssueTool,
} from "./children/createIssue";
import {
  InputType as getIssueInputType,
  OutputType as getIssueOutputType,
  tool as getIssueTool,
} from "./children/getIssue";
import {
  InputType as searchIssuesInputType,
  OutputType as searchIssuesOutputType,
  tool as searchIssuesTool,
} from "./children/searchIssues";

const secretSchema = z.object({
  siteUrl: z.string().meta({
    title: "Jira Site URL",
    description: "Jira Cloud 站点地址，例如 https://example.atlassian.net",
    isSecret: false,
  }),
  email: z.string().meta({
    title: "Jira Account Email",
    description: "Atlassian 账号邮箱",
    isSecret: false,
  }),
  apiToken: z.string().meta({
    title: "Jira API Token",
    description: "Atlassian API token",
    isSecret: true,
  }),
});

const childSecretSchema = z.object({});

const issueOutputSchema = z.object({
  id: z.string(),
  key: z.string(),
  url: z.string(),
  summary: z.string(),
  status: z.string(),
  issue_type: z.string(),
  project_key: z.string(),
  assignee: z.string(),
  reporter: z.string(),
  priority: z.string(),
  created: z.string(),
  updated: z.string(),
  fields_json: z.string(),
});

const searchIssuesInputSchema = z.object({
  jql: z.string().min(1).max(2_000).meta({
    title: "JQL",
    description: "Jira Query Language 查询语句",
    toolDescription: "JQL query used to search Jira issues.",
  }),
  maxResults: z.number().int().min(1).max(50).optional().meta({
    title: "Max Results",
    description: "返回数量，范围 1-50，默认 10",
    toolDescription: "Maximum number of Jira issues to return.",
  }),
  nextPageToken: z.string().optional().meta({
    title: "Next Page Token",
    description: "分页 token",
    toolDescription: "Pagination token from a previous Jira search call.",
  }),
  fields: z.string().optional().meta({
    title: "Fields",
    description: "可选，逗号分隔的 Jira fields",
    toolDescription: "Optional comma-separated Jira field names to retrieve.",
  }),
});
const searchIssuesOutputSchema = z.object({
  issues: z.array(issueOutputSchema),
  is_last: z.boolean(),
  next_page_token: z.string(),
});
const searchIssuesHandler = createToolHandler({
  inputSchema: searchIssuesInputSchema,
  outputSchema: searchIssuesOutputSchema,
  secretSchema: childSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await searchIssuesInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await searchIssuesTool(parsedInput);
    return searchIssuesOutputType.parseAsync(output);
  },
});

const getIssueInputSchema = z.object({
  issueKeyOrId: z.string().meta({
    title: "Issue Key Or ID",
    description: "Jira issue key 或数字 ID，例如 PROJ-123",
    toolDescription: "Jira issue key or numeric issue ID to retrieve.",
  }),
  fields: z.string().optional().meta({
    title: "Fields",
    description: "可选，逗号分隔的 Jira fields",
    toolDescription: "Optional comma-separated Jira field names to retrieve.",
  }),
});
const getIssueHandler = createToolHandler({
  inputSchema: getIssueInputSchema,
  outputSchema: issueOutputSchema,
  secretSchema: childSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await getIssueInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await getIssueTool(parsedInput);
    return getIssueOutputType.parseAsync(output);
  },
});

const createIssueInputSchema = z.object({
  projectKey: z.string().meta({
    title: "Project Key",
    description: "Jira 项目 Key，例如 PROJ",
    toolDescription: "Jira project key where the issue should be created.",
  }),
  issueTypeName: z.string().optional().meta({
    title: "Issue Type Name",
    description: "Issue 类型名称，默认 Task",
    toolDescription: "Jira issue type name such as Task, Bug, or Story.",
  }),
  summary: z.string().min(1).max(255).meta({
    title: "Summary",
    description: "Issue 标题",
    toolDescription: "Jira issue summary.",
  }),
  description: z.string().optional().meta({
    title: "Description",
    description: "Issue 描述，会转换为 Atlassian Document Format",
    toolDescription: "Plain-text Jira issue description.",
  }),
  additionalFieldsJson: z.string().optional().meta({
    title: "Additional Fields JSON",
    description:
      "可选额外 fields JSON，不能覆盖 project/issuetype/summary/description",
    toolDescription: "Optional Jira fields JSON for non-reserved fields.",
  }),
});
const createIssueOutputSchema = z.object({
  id: z.string(),
  key: z.string(),
  self: z.string(),
  url: z.string(),
});
const createIssueHandler = createToolHandler({
  inputSchema: createIssueInputSchema,
  outputSchema: createIssueOutputSchema,
  secretSchema: childSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await createIssueInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await createIssueTool(parsedInput);
    return createIssueOutputType.parseAsync(output);
  },
});

const addCommentInputSchema = z.object({
  issueKeyOrId: z.string().meta({
    title: "Issue Key Or ID",
    description: "Jira issue key 或数字 ID，例如 PROJ-123",
    toolDescription: "Jira issue key or numeric issue ID to comment on.",
  }),
  body: z.string().min(1).max(10_000).meta({
    title: "Body",
    description: "评论正文，会转换为 Atlassian Document Format",
    toolDescription: "Plain-text Jira comment body.",
  }),
});
const addCommentOutputSchema = z.object({
  id: z.string(),
  self: z.string(),
  created: z.string(),
  updated: z.string(),
  body_text: z.string(),
});
const addCommentHandler = createToolHandler({
  inputSchema: addCommentInputSchema,
  outputSchema: addCommentOutputSchema,
  secretSchema: childSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await addCommentInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await addCommentTool(parsedInput);
    return addCommentOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "jira",
    name: {
      en: "Jira Tool Set",
      "zh-CN": "Jira 工具集",
    },
    description: {
      en: "Search, read, create, and comment on Jira Cloud issues.",
      "zh-CN": "搜索、读取、创建和评论 Jira Cloud issue。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial Jira Cloud tool suite",
      "zh-CN": "初始 Jira Cloud 工具集版本",
    },
    toolDescription:
      "Jira Cloud tool suite for issue search, issue retrieval, issue creation, and comments.",
    tags: ["productivity", "tools"],
    permission: [],
  },
  secretSchema,
  children: [
    {
      id: "searchIssues",
      name: {
        en: "Search Issues",
        "zh-CN": "搜索 Issue",
      },
      description: {
        en: "Search Jira issues with JQL using cursor pagination.",
        "zh-CN": "使用 JQL 分页搜索 Jira issue。",
      },
      toolDescription: "Search Jira Cloud issues using JQL.",
      handler: searchIssuesHandler,
    },
    {
      id: "getIssue",
      name: {
        en: "Get Issue",
        "zh-CN": "获取 Issue",
      },
      description: {
        en: "Retrieve a Jira issue by key or ID.",
        "zh-CN": "通过 issue key 或 ID 获取 Jira issue。",
      },
      toolDescription: "Retrieve a Jira Cloud issue by key or numeric ID.",
      handler: getIssueHandler,
    },
    {
      id: "createIssue",
      name: {
        en: "Create Issue",
        "zh-CN": "创建 Issue",
      },
      description: {
        en: "Create a Jira issue with project, issue type, summary, and optional fields.",
        "zh-CN": "按项目、类型、标题和可选字段创建 Jira issue。",
      },
      toolDescription: "Create a Jira Cloud issue.",
      handler: createIssueHandler,
    },
    {
      id: "addComment",
      name: {
        en: "Add Comment",
        "zh-CN": "添加评论",
      },
      description: {
        en: "Add a plain-text comment to a Jira issue.",
        "zh-CN": "向 Jira issue 添加纯文本评论。",
      },
      toolDescription: "Add a plain-text comment to a Jira Cloud issue.",
      handler: addCommentHandler,
    },
  ],
});

export default toolSet;
