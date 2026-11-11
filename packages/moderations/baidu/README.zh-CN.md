# 百度文本内容审核

语言：[简体中文](./README.zh-CN.md) | [English](./README.en.md)

将百度智能云同步文本内容审核接口（`text_censor/v2/user_defined`）映射为 FastGPT 标准内容审核结构。

## 配置说明

| 字段 | 必填 | 加密存储 | 说明 |
| --- | --- | --- | --- |
| `apiKey` | 是 | 是 | 已开通文本内容审核的百度智能云应用 API Key |
| `secretKey` | 是 | 是 | 百度智能云应用 Secret Key |
| `strategyId` | 否 | 否 | 可选，在百度内容审核控制台配置的自定义审核策略 ID（正整数）；不填使用默认策略 |

请通过 FastGPT 插件配置界面保存凭据，切勿写入源码或终端历史。审核严格度与词库由百度控制台策略控制，插件不在本地伪造置信度阈值。

## 输入与输出协议

输入：`{ "content": "待审核文本" }`（仅支持同步文本审查）。
裁决结果 `verdict` 为 `pass`、`block`、`suspected` 或 `error`。保留全部命中分组（包括纯关键词命中与纯模型命中）；百度原生概率从 `0`–`1` 映射至 SDK 标准 `0`–`100` 区间，无概率字段时省略 `score`。SDK 自动汇总顶层去重 `keywords` 与 `provider: "baidu"`，`requestId` 对应最后一个分块的 `log_id`。

超过 20,000 UTF-8 字节的长文本按 Unicode 码点安全切分并顺序送审，多分块裁决优先级为 `error > block > suspected > pass`，不会将未完成的半截审查静默放行。空白文本直接放行，不发起上游请求。

OAuth `access_token` 在进程内按凭据对缓存并带过期安全余量与并发刷新去重；令牌失效仅自动重试一次。单次 HTTP 请求超时为 15 秒；上游报错统一返回 `verdict: "error"`，绝不泄露凭据、含 token 的 URL 或原始响应体。

## 本地开发与构建

```bash
pnpm --filter fastgpt-moderation-baidu test
pnpm --filter fastgpt-moderation-baidu type-check
pnpm --filter fastgpt-moderation-baidu build
pnpm --filter fastgpt-moderation-baidu check
pnpm --filter fastgpt-moderation-baidu pack
```

## 参考链接

- [百度文本审核请求说明](https://ai.baidu.com/ai-doc/ANTIPORN/Rk3h6xb3i)
- [百度文本审核返回说明](https://ai.baidu.com/ai-doc/ANTIPORN/Nk3h6xbb2)
