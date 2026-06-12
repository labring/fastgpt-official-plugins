# Feed Reader

读取 RSS、Atom、RDF/RSS 1.0 和 JSON Feed 订阅，提取订阅源信息、最新条目和 Markdown 摘要。

## 输入

- `feedUrl`: 订阅地址，支持 `http`、`https`、`feed`、`rss`、`atom` 协议。
- `maxItems`: 最大返回条目数，范围 1-50，默认 10。
- `includeContent`: 是否返回条目正文，默认 `false`。

## 输出

- `feed`: 订阅源标题、描述、站点链接、最终订阅地址、语言、更新时间和格式。
- `items`: 条目标题、链接、作者、发布时间、更新时间、摘要、正文、ID 和分类。
- `markdown`: 订阅源和条目的 Markdown 摘要。

## 安全边界

- 仅允许公开 `http` 和 `https` 地址。
- `feed://`、`rss://`、`atom://` 会归一化为 `https://`。
- 拒绝 localhost、内网 IP、链路本地地址和 metadata host。
- 单次 feed 响应大小限制为 5MB。

## 开发

```bash
pnpm install
pnpm run build
pnpm run test
```
