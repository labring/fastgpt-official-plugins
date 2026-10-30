# DeepSeek Search & Fetch 工具集

基于 [DeepSeek 官方 Search & Fetch API](https://api-docs.deepseek.com/guides/search/) 提供的自研联网搜索与网页抓取工具集，包含 **网页搜索（Web Search）** 与 **网页抓取（Web Fetch）** 两个核心工具。

## 功能特性

- **DeepSeek Web Search（网页搜索）**：
  - 基于 DeepSeek 自研搜索引擎，专为 AI Agent 和 RAG 设计。
  - 支持高级搜索操作符：`site:`、`-site:`、`-`、`"..."`、`lang:`、`after:`、`before:` 等。
  - 返回高质量结构化搜索结果，包含相关性得分（`rerank_score`）、权威度（`authority`）、UI展示摘要（`snippet`）、供模型阅读的详细摘要（`summary`）以及可选的正文全文（`content`）。
  - 提供预格式化的 Markdown 结果文本（`formatText`），便于直接拼接为大模型提示词上下文。
- **DeepSeek Web Fetch（网页抓取）**：
  - 抓取指定 HTTP/HTTPS 网页内容并将其提取转换为 Markdown 格式文本。
  - 适用于深度阅读网页内容、文档提取或进一步问答。

## 密钥配置

在 FastGPT 插件配置中配置 DeepSeek API Key：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `apiKey` | 字符串 | 是 | DeepSeek API 密钥，可在 [DeepSeek 开放平台](https://platform.deepseek.com) 获取。 |

---

## 子工具 1：DeepSeek Web Search (网页搜索)

### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `query` | string | 是 | - | 搜索查询词（1 到 128 字符），支持 `site:`, `lang:` 等搜索语法。 |
| `count` | number | 否 | 10 | 返回结果数量，范围 1 到 50。 |
| `need_content` | boolean | 否 | false | 是否在结果中返回网页正文 Markdown 内容。 |
| `ori_question` | string | 否 | - | 用户的原始问题（1 到 128 字符），可提升语义检索准确度。 |
| `localization` | string | 否 | "" | 用于本地化搜索结果的 IP 地址。 |

### 输出参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `results` | array | 结构化搜索结果列表，每项包含 `title`、`url`、`snippet`、`summary`、`content`、`site_name`、`site_icon`、`date`、`rerank_score`、`authority`。 |
| `formatText` | string | 预格式化的 Markdown 文本，便于直接提供给大语言模型阅读。 |

---

## 子工具 2：DeepSeek Web Fetch (网页抓取)

### 输入参数

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| `url` | string | 是 | 目标网页 URL（HTTP 或 HTTPS 协议，最大 8192 字符，不能包含用户名或密码）。 |

### 输出参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 抓取到的网页标题。 |
| `content` | string | 网页内容提取并转换后的 Markdown 格式正文。 |

---

## 本地开发与测试

```bash
# 运行单元测试
pnpm test

# 生产环境构建
pnpm run build

# 插件规范检查与打包
npx @fastgpt-plugin/cli check --entry . --output ./dist
pnpm run pack
```

