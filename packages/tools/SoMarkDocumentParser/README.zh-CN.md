# SoMark 文档解析

SoMark 文档解析工具用于将 PDF、图片、Office 文档等文件解析为结构化结果，并返回 Markdown 全文和 JSON 数据。工具适用于知识库入库、文档问答预处理、合同/报告解析、表格和公式抽取等场景。

工具同时支持 SoMark API 和 SoMark 私有化部署，两者使用同一组接口路径，仅 Base URL 和鉴权方式不同。支持多文件批量解析，工具会按输入顺序串行调用 SoMark 异步管线。

## 密钥配置

| 字段 | 说明 |
| --- | --- |
| Base URL | 必填。**中国大陆**使用请填写 `https://somark.cn/api/v1`；**中国大陆以外（包括中国台湾、中国香港、中国澳门及海外）** 使用请填写 `https://somark.ai/api/v1`；私有化部署时填写本地部署的 Base URL。<br><br>If you are in Mainland China (中国大陆), use `https://somark.cn/api/v1`. If you are outside Mainland China (including Taiwan, China; Hong Kong, China; Macau, China; and overseas), use `https://somark.ai/api/v1`. For self-hosted deployments, enter your local Base URL. |
| API Key | 使用 SoMark 公共 API（somark.cn 或 somark.ai）时填写，需以 `sk-` 开头；私有化部署无需填写。 |

API Key 校验会按 Base URL 切换：

- Base URL 为 `https://somark.cn/api/v1` 或 `https://somark.ai/api/v1` 时，API Key 必须非空且以 `sk-` 开头。
- 自定义 Base URL 时跳过格式校验，API Key 会原样透传给后端。

## 购买 / Purchase

使用 SoMark API 前需要先购买服务：

- **中国大陆**：[https://somark.cn/workbench/purchase](https://somark.cn/workbench/purchase)
- **中国大陆以外（包括中国台湾、中国香港、中国澳门及海外）**：[https://somark.ai/studio/purchase](https://somark.ai/studio/purchase)

If you are in Mainland China (中国大陆), purchase at [https://somark.cn/workbench/purchase](https://somark.cn/workbench/purchase). If you are outside Mainland China (including Taiwan, China; Hong Kong, China; Macau, China; and overseas), purchase at [https://somark.ai/studio/purchase](https://somark.ai/studio/purchase).

## 输入参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 文件 | 文件数组 | 无 | 必填，支持 PDF、图片、Office 格式。 |
| 输出格式 | 多选 | `json`, `markdown` | 选择返回 JSON、Markdown，或同时返回两种格式。 |
| 图片格式 | 单选 | `url` | 图片元素返回格式，支持 `url`、`base64`、`none`。 |
| 公式格式 | 单选 | `latex` | 公式元素返回格式，支持 `latex`、`mathml`、`ascii`。 |
| 表格格式 | 单选 | `html` | 表格元素返回格式，支持 `markdown`、`html`、`image`。 |
| 化学结构式格式 | 单选 | `image` | 当前仅支持 `image`。 |
| 文字跨页拼接 | 开关 | `false` | 将跨页文字段合并为连续段落。 |
| 表格跨页拼接 | 开关 | `false` | 将跨页表格合并为完整表格。 |
| 标题层级识别 | 开关 | `false` | 识别 H1、H2、H3 等标题层级。 |
| 返回文中图 | 开关 | `false` | 返回文字段落中的图片。 |
| 返回表格图 | 开关 | `true` | 返回表格单元格内的图片。 |
| 图片理解 | 开关 | `true` | 对文档内图片进行语义理解和结构化描述。 |
| 保留页眉页脚 | 开关 | `false` | 开启后保留页眉页脚内容。 |

## 输出结果

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `results` | 对象数组 | 每个输入文件对应一项，按输入顺序返回。 |

每个 `results[i]` 包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `markdown` | 字符串 | Markdown 格式全文。未选择 Markdown 输出时为空字符串。 |
| `json` | 对象 | JSON 格式解析结果。未选择 JSON 输出时为空对象。 |

## 注意事项

- FastGPT 文件选择器传入的是文件下载 URL，工具会先下载文件，再以 multipart form-data 方式发送到 SoMark。
- 如果下载 URL 带有 `filename` 查询参数，工具会优先使用该文件名，避免临时下载地址丢失 `.pdf`、`.docx` 等后缀导致上游误判文件类型。
- 多文件采用严格串行解析，避免同时挤占 SoMark 槽位；遇到 QPS 限流错误码 `1124` 时会在 10 分钟预算内自动退避重试。
- 单文件解析最长等待时长为 10 分钟轮询预算；多文件总耗时会随文件数量线性增加。

## 开发

```bash
pnpm install
pnpm run test
pnpm run build
pnpm run pack
```
