# Grist 工具集

Grist 工具集用于在 FastGPT 工作流中调用 Grist REST API，支持文件导入、`.grist`/`xlsx`/表格文本格式导出，以及查询、新增和更新表格记录。

## 准备工作

1. 登录 Grist，进入个人资料或团队站点设置获取 API Key。
2. 在 FastGPT 工具密钥配置中填写 `gristApiKey`。
3. 默认服务地址为 `https://docs.getgrist.com`，自托管 Grist 可在工具密钥配置中填写 `gristBaseUrl`，该字段不是密钥。

API 文档参考：https://support.getgrist.com/api/

## 子工具

### 导入文档 documentImport

调用 `POST /api/docs`，通过 multipart/form-data 的 `upload` 字段导入文件并创建 Grist 文档。Grist 官方接口说明该统一创建文档 endpoint 可通过 file upload 导入文件，适用于 Excel、CSV、`.grist` 等 Grist 可导入文件。

输入参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| workspaceId | number | 是 | Grist 工作区 ID |
| fileUrl | string | 是 | 可下载的文件 URL |
| fileName | string | 否 | 上传文件名，留空时从 URL 推断 |
| documentName | string | 否 | 新建 Grist 文档名称 |
| timezone | string | 否 | 文档时区，例如 `America/New_York` |

输出：

```json
{
  "docId": "9PJhBDZPyCNoayZxaCwFfS",
  "raw": "9PJhBDZPyCNoayZxaCwFfS",
  "success": true
}
```

### 导出文档 documentExport

根据 `format` 调用 Grist 下载接口，并通过 FastGPT 文件上传能力返回可访问链接。

- `grist`: `GET /api/docs/{docId}/download`，导出完整 Grist 文档文件。
- `xlsx`: `GET /api/docs/{docId}/download/xlsx`，导出 Excel 文件。
- `csv`/`tsv`/`dsv`: `GET /api/docs/{docId}/download/{format}`，导出单个表格文本文件。

输入参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| docId | string | 是 | Grist 文档 ID |
| format | string | 否 | `grist`、`xlsx`、`csv`、`tsv`、`dsv`，默认 `grist` |
| tableId | string | 条件必填 | `csv`、`tsv`、`dsv` 导出必填；`xlsx` 可选用于限定表 |
| fileName | string | 否 | 导出文件名，默认 `{docId}.{format}` |
| header | string | 否 | `xlsx`、`csv`、`tsv`、`dsv` 表头格式，`colId` 或 `label` |
| nohistory | boolean | 否 | `grist` 格式导出时是否移除历史以减小文件体积 |
| template | boolean | 否 | `grist` 格式导出时是否传入 Grist `template` 查询参数 |

输出：

```json
{
  "fileUrl": "https://files.example.com/doc.grist",
  "fileName": "doc.grist",
  "contentType": "application/octet-stream",
  "success": true
}
```

### 查询记录 recordsList

调用 `GET /api/docs/{docId}/tables/{tableId}/records` 查询表记录。

输入参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| docId | string | 是 | Grist 文档 ID |
| tableId | string | 是 | Grist 表 ID |
| gristBaseUrl | string | 否 | Grist 服务地址，默认 `https://docs.getgrist.com` |
| limit | number | 否 | 返回记录数量限制 |
| sort | string | 否 | 排序字段，如 `pet,-age` |
| filter | object | 否 | 筛选对象，如 `{"pet":["cat","dog"]}` |
| viewSection | number | 否 | 视图区块 ID，作为可选查询参数传入 |

输出：

```json
{
  "records": [
    {
      "id": 1,
      "fields": {
        "pet": "cat",
        "popularity": 67
      }
    }
  ],
  "success": true
}
```

### 新增记录 recordCreate

调用 `POST /api/docs/{docId}/tables/{tableId}/records` 新增一条记录。

请求体格式：

```json
{
  "records": [
    {
      "fields": {
        "pet": "cat",
        "popularity": 67
      }
    }
  ]
}
```

输出：

```json
{
  "result": {
    "records": [
      {
        "id": 1
      }
    ]
  },
  "success": true
}
```

### 更新记录 recordUpdate

调用 `PATCH /api/docs/{docId}/tables/{tableId}/records` 更新一条记录。

请求体格式：

```json
{
  "records": [
    {
      "id": 1,
      "fields": {
        "popularity": 95
      }
    }
  ]
}
```

输出：

```json
{
  "result": {},
  "success": true
}
```

## 说明

- `fields` 使用 Grist 列 ID 作为对象 key。
- `filter` 会被序列化为 JSON 字符串后作为 query 参数传递。
- `gristBaseUrl` 会自动去掉末尾斜杠。
- 所有请求使用 `Authorization: Bearer <gristApiKey>` 鉴权。
- Grist 支持通过 `POST /api/docs` 的 multipart file upload 导入文件，Excel 文件可走该 API 导入为 Grist 文档。
- Grist 支持通过 REST API 导出完整 `.grist` 文档和 Excel `xlsx` 文件；`csv`、`tsv`、`dsv` 为表级导出，需要 `tableId`。
