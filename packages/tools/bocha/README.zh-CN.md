# 博查 AI 搜索 (Bocha Search)

博查 AI 搜索引擎（Bocha Web Search）是专为大语言模型（LLM）与智能体应用设计的互联网信息检索服务。本插件为 FastGPT 提供实时联网检索能力，支持按时间范围筛选、指定目标网站包含或排除、获取网页正文长摘要等特性，助力智能体获取时效性信息、验证事实并拓展专业领域的知识边界。

## 应用场景

- **实时资讯与热点检索**：检索最新的新闻动态、行业事件与政策发布，配合 `freshness` 时间过滤获取最新信息。
- **知识库问答与检索增强（RAG）**：为大模型提供权威的外部信源与实时事实支撑，有效抑制模型幻觉。
- **垂直领域与站点定向搜索**：通过 `include` 限制在权威官网、官方文档或特定行业门户内搜索，获取高置信度结果。
- **过滤噪声与干扰源**：利用 `exclude` 屏蔽低质量聚合站点、内容农场或无关域名，提升返回内容的质量。

---

## 密钥配置说明

使用本插件需要配置博查 AI 开放平台的 API 密钥（`apiKey`）。

### 获取渠道

1. 访问 [博查 AI 开放平台](https://open.bochaai.com)（或官网 [https://bochaai.com](https://bochaai.com)）注册并登录账号。
2. 进入控制台的「API 密钥管理」页面。
3. 创建新的 API Key 并复制保存。

### 配置方式

在 FastGPT 插件配置的密钥（Secrets）区域中填写以下字段：

| 字段名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `apiKey` | 字符串 (`string`) | 是 | 博查开放平台 API 密钥。请求时将作为 Bearer Token 发送至博查搜索接口进行鉴权认证。 |

---

## 输入参数

| 参数名 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `query` | 字符串 (`string`) | 无 | 是 | **搜索关键词**。支持自然语言提问或关键词组合，用于在互联网检索相关网页。 |
| `freshness` | 枚举字符串 (`string`) | `noLimit` | 否 | **时间范围过滤**。可选值：<br>• `noLimit`：不限时间范围（默认）<br>• `oneDay`：过去 24 小时（1天）内<br>• `oneWeek`：过去 1 周内<br>• `oneMonth`：过去 1 个月内<br>• `oneYear`：过去 1 年内 |
| `summary` | 布尔值 (`boolean`) | `true` | 否 | **是否显示摘要**。设为 `true` 时由模型提取更详尽的长文本摘要；设为 `false` 则仅返回基础片段。 |
| `include` | 字符串 (`string`) | `""` | 否 | **指定包含的网站域名**。将搜索范围限制在指定站点内，多个域名使用竖线 `\|` 或逗号 `,` 分隔，最多支持 20 个站点。例如：`qq.com\|m.163.com`。 |
| `exclude` | 字符串 (`string`) | `""` | 否 | **指定排除的网站域名**。在搜索结果中过滤掉指定站点，多个域名使用竖线 `\|` 或逗号 `,` 分隔，最多支持 20 个站点。例如：`csdn.net\|zhihu.com`。 |
| `count` | 数值 (`number`) | `10` | 否 | **返回结果条数**。可填范围：`1` ~ `50`，默认为 `10`。 |

---

## 输出结果

插件执行成功后返回顶层对象，包含 `result` 数组；调用失败时返回 `error` 错误信息。

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| `result` | 对象数组 (`Array<Object>`) | 检索到的网页结果列表。 |
| `error` | 字符串 (`string`) | 可选。发生异常时的错误提示信息。 |

### `result` 数组条目结构

`result` 列表中的每个对象包含以下字段：

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string \| null` | 搜索结果的唯一标识符（如有）。 |
| `name` | `string \| null` | 网页标题（Title）。 |
| `url` | `string \| null` | 目标网页的完整 URL 访问链接。 |
| `snippet` | `string \| null` | 搜索结果匹配词上下文摘要片段。 |
| `summary` | `string \| null` | 网页核心内容长文本摘要（开启 `summary: true` 时返回）。 |
| `siteName` | `string \| null` | 来源网站名称（例如“新华网”、“GitHub”等）。 |
| `siteIcon` | `string \| null` | 来源网站的图标链接（Favicon URL）。 |
| `datePublished` | `string \| null` | 网页发布时间（如 ISO 8601 或标准日期时间字符串）。 |
| `dateLastCrawled` | `string \| null` | 搜索引擎最近抓取与更新的时间。 |
| `language` | `string \| null` | 网页主要语言代码（如 `zh-CN`、`en`）。 |
| `isNavigational` | `boolean \| null` | 是否为站点官方导航或主页链接。 |

### 返回示例

```json
{
  "result": [
    {
      "id": "https://api.bochaai.com/v1/web-search#1",
      "name": "FastGPT - 基于 LLM 的知识库问答系统",
      "url": "https://fastgpt.in",
      "snippet": "FastGPT 是一个基于 LLM 大语言模型的知识库问答系统，提供开箱即用的数据处理、模型调用、智能体工作流编排等能力...",
      "summary": "FastGPT 是一款开源的基于大语言模型的 AI 知识库平台，支持多渠道数据导入与向量化检索，提供直观的可视化工作流和 API 接入能力。",
      "siteName": "FastGPT 官网",
      "siteIcon": "https://fastgpt.in/favicon.ico",
      "datePublished": "2024-01-15T08:00:00Z",
      "dateLastCrawled": "2025-02-20T12:00:00Z",
      "language": "zh-CN",
      "isNavigational": true
    }
  ]
}
```

---

## 实际调用与场景示例

### 场景一：搜索过去 24 小时内的最新科技资讯

```json
{
  "query": "大模型最新发布与开源动态",
  "freshness": "oneDay",
  "summary": true,
  "count": 5
}
```

### 场景二：在官方文档与知名站点中定向检索

只在 `github.com` 和 `doc.fastgpt.in` 中检索插件开发说明：

```json
{
  "query": "FastGPT plugin SDK 接入指南",
  "freshness": "noLimit",
  "include": "github.com|doc.fastgpt.in",
  "summary": true,
  "count": 5
}
```

### 场景三：排查技术问题并排除无关社区站点

在全网检索时屏蔽某些内容聚合网站或干扰站点：

```json
{
  "query": "Docker 部署 PostgreSQL 内存超限解决办法",
  "freshness": "oneYear",
  "exclude": "spam-site.com|lowquality.org",
  "count": 10
}
```

---

## 错误排查

| 状态码 / 现象 | 可能原因 | 解决办法 |
| --- | --- | --- |
| `HTTP 401 Unauthorized` | API Key 缺失、无效或已过期 | 检查 FastGPT 密钥设置中的 `apiKey` 是否正确填入，确保博查平台控制台中的 Key 处于可用状态。 |
| `HTTP 400 Bad Request` | 请求参数格式错误或数值超出有效范围 | 检查参数设置：<br>• `count` 需在 `1` 到 `50` 之间；<br>• `freshness` 必须为有效枚举值；<br>• `include` / `exclude` 域名数量不超过 20 个。 |
| `HTTP 429 Too Many Requests` | 超出并发或账号调用额度上限 | 检查博查开放平台控制台的配额余量与 QPS 限制，按需升级计划或在工作流中控制调用频率。 |
| `HTTP 500 / 502 / 503` | 博查搜索服务端内部错误或网络暂时中断 | 属于上游服务瞬时异常，可在工作流中配置异常捕获并进行重试。 |
| 网络连接超时 | 当前运行网络环境无法连通博查 API 域名 | 确认服务所在节点能够正常访问 `https://api.bochaai.com`，检查网络策略、代理或防火墙配置。 |

---

## 本地开发与测试

在插件目录 `packages/tools/bocha` 下运行以下命令：

```bash
# 安装依赖
pnpm install

# 运行单元测试
pnpm run test

# 构建产物
pnpm run build

# 校验插件规范与产物结构
npx @fastgpt-plugin/cli check --entry .

# 打包发布为 .pkg 文件
pnpm run pack
```

