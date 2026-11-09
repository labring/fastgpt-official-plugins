# SearXNG 元搜索引擎 (searchXNG)

使用配置的 SearXNG 私有或公有实例进行互联网隐私检索。

## 实例配置

请在插件的密钥（Secret）配置项 `url` 中填入您的 SearXNG 实例访问地址。本插件不提供默认公有实例，因为 SearXNG 官方开源项目并不运营官方托管检索服务。

配置的目标 SearXNG 实例必须在其 `settings.yml` 中开启 JSON 格式响应：

```yaml
search:
  formats:
    - html
    - json
```

## 功能与调用行为

- 在密钥 `url` 中配置实例地址，仅支持 `http` 和 `https` 协议。输入参数 `query`（查询词）必须非空。
- 请求发送至实例的 `/search` 端点。若配置的 URL 结尾未包含 `/search`，插件会自动补齐。原有 URL query 参数会被清理，并自动追加 `q`、`format=json` 以及 `language=auto`。
- 输出结果格式为 `{ result: [{ title, link, snippet }] }`，最多返回 10 条结果。缺失或为 `null` 的字段会被规范化为空字符串。当搜索无结果、返回 HTTP 错误、JSON 解析失败或响应体超过 2 MiB 时，工具调用将报错提示。

参考资料：[SearXNG 搜索 API 官方文档](https://docs.searxng.org/dev/search_api.html) 与 [SearXNG 公共实例列表](https://searx.space/)。
