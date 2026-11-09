# Firecrawl 网页爬虫与智能搜索

专为大语言模型设计的网络搜索与网页抓取 API。支持全网智能搜索，并将任意网页转换为干净规整的 Markdown 或 HTML 格式供 AI 应用使用。

## API 密钥配置

前往 [firecrawl.dev/app/api-keys](https://www.firecrawl.dev/app/api-keys?utm_source=fastgpt&utm_medium=integration) 获取 Firecrawl API Key。使用官方服务时 API Url 保持留空即可。

## 子工具列表

- `search`（全网搜索）：检索互联网网页。输入参数包含 `query`（查询词）、`limit`（返回数量 1~20，默认 5）、`includeContent`（是否同时以 Markdown 格式返回每个搜索结果的网页正文）。输出每个结果的 `url`、`title` 和 `description`。
- `scrape`（单页抓取）：抓取单个网页内容。输入参数包含 `url`、`format`（返回格式，可选 `markdown` 或 `html`）、`faster`（是否允许使用最多 1 小时前的缓存副本以加快响应）。

官方文档参考：[Search 功能文档](https://docs.firecrawl.dev/features/search?utm_source=fastgpt&utm_medium=integration)
