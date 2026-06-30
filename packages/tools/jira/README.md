# Jira Tool Set

Jira Cloud 工具集，用于在 FastGPT 工作流中搜索、读取、创建和评论 Jira issue。

## Secrets

- `siteUrl`: Jira Cloud 站点地址，例如 `https://example.atlassian.net`
- `email`: Atlassian 账号邮箱
- `apiToken`: Atlassian API token

## Tools

### Search Issues

使用 Jira Cloud `POST /rest/api/3/search/jql` 按 JQL 搜索 issue。

Inputs:

- `jql`: Jira Query Language 查询语句
- `maxResults`: 返回数量，1-50，默认 10
- `nextPageToken`: 分页 token
- `fields`: 可选，逗号分隔的 field 名称

### Get Issue

使用 `GET /rest/api/3/issue/{issueKeyOrId}` 获取 issue。

Inputs:

- `issueKeyOrId`: issue key 或数字 ID
- `fields`: 可选，逗号分隔的 field 名称

### Create Issue

使用 `POST /rest/api/3/issue` 创建 issue。描述会转换为 Atlassian Document Format。

Inputs:

- `projectKey`: Jira 项目 Key
- `issueTypeName`: issue 类型名称，默认 `Task`
- `summary`: issue 标题
- `description`: 可选纯文本描述
- `additionalFieldsJson`: 可选额外 fields JSON，不能覆盖 `project`、`issuetype`、`summary`、`description`

### Add Comment

使用 `POST /rest/api/3/issue/{issueKeyOrId}/comment` 添加纯文本评论。

Inputs:

- `issueKeyOrId`: issue key 或数字 ID
- `body`: 评论正文

## Safety Boundaries

- 仅允许 Jira Cloud `https://*.atlassian.net`
- 固定调用 `search/jql`、`issue`、`issue/{key}`、`issue/{key}/comment`
- 不支持 delete、transition、assign、bulk 或 arbitrary endpoint passthrough
- API token 和 Basic auth token 会从错误信息中脱敏
- `fields`、JQL、description、comment 和 JSON 输入有长度/数量限制
