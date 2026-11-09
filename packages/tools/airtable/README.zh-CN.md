# Airtable 多维表格

使用 Airtable Web API v0 在指定的 Base 与数据表中执行记录列表查询、创建与更新操作。

## 密钥配置 (Secrets)

- `token`：Airtable 个人访问令牌（Personal Access Token, PAT）。请求时仅作为 `Authorization: Bearer <token>` 发送至 `https://api.airtable.com/v0`。

## 子工具列表

- `listRecords`：根据 `baseId` 和 `tableIdOrName` 查询记录列表。支持 `maxRecords`、`pageSize`、`filterByFormula`、`view` 和 `sort` 排序。
- `createRecord`：创建单条记录，传入受限的 `fields` 字段对象。支持可选的 `typecast` 自动类型转换。
- `updateRecord`：根据 `recordId` 更新单条记录的 `fields` 字段对象。支持可选的 `typecast` 自动类型转换。

## 安全与防护限制

- API 请求域名固定为 `api.airtable.com`。
- 未暴露任何删除（Delete）、Webhook 或任意外部 URL 请求操作。
- 列表查询每次调用最多返回 100 条记录。
- 创建与更新每次调用仅处理 1 条记录。
- `fields` 必须为有效的 JSON 对象且不能为空，并受键数量与 JSON 大小限制。
- 错误摘要保留 Airtable 状态码、错误类型与错误信息，自动脱敏 PAT 及 Bearer Token 等敏感凭据。
