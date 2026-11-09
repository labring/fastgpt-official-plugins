# Notion 工具集 (Notion Tool Set)

通过 Notion API 在 FastGPT 工作流中搜索、读取、查询并创建 Notion 页面与数据源。

## 密钥配置 (Secrets)

- `integrationToken`：Notion 内部集成密钥（Internal Integration Secret），通常以 `ntn_` 开头。

> **重要提示**：在调用本工具前，请务必先在 Notion 中将目标页面、数据库或数据源共享（Connect to）给所创建的 Integration。

## 子工具列表

### 1. 搜索 (Search)

在工作区中搜索 Notion 页面、数据库或数据源。

输入参数：
- `query`：可选的搜索关键词。
- `objectType`：可选过滤对象类型：`page`、`database` 或 `data_source`。
- `pageSize`：返回数量（1~100，默认 10）。
- `cursor`：分页游标。

### 2. 获取页面 (Get Page)

根据 `pageId` 获取 Notion 页面元数据及 `properties_json` 属性对象。

### 3. 获取子块列表 (Get Block Children)

根据页面或块 ID 读取其下属子块列表。工具返回规范化的块元数据，并自动提取富文本块的纯文本内容。

### 4. 查询数据源 (Query Data Source)

根据 `dataSourceId` 查询 Notion 数据源/数据库记录。

输入参数：
- `filterJson`：可选的 Notion Filter JSON 过滤条件对象。
- `sortsJson`：可选的排序 JSON 对象，形如 `{"sorts":[...]}`。
- `pageSize`：返回数量（1~100，默认 20）。
- `cursor`：分页游标。

### 5. 创建页面 (Create Page)

在指定的父级页面或数据源下创建新的 Notion 页面。

输入参数：
- `parentType`：父级类型，可选 `page_id` 或 `data_source_id`。
- `parentId`：父级页面或数据源 ID。
- `title`：页面标题。
- `propertiesJson`：当父级为数据源时使用的属性 JSON 对象。
- `content`：以纯文本或 Markdown 格式写入页面的正文内容。
