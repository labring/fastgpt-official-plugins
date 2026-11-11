# 旧版自定义审核兼容

语言：[简体中文](./README.zh-CN.md) | [English](./README.en.md)

将已有 FastGPT 旧版自定义安全审核 HTTP 服务（`customCensorURL`）接入新 `moderation` 插件体系，无需修改客户现有服务接口。

## 配置说明

| 字段 | 必填 | 加密存储 | 说明 |
| --- | --- | --- | --- |
| `endpoint` | 是 | 否 | 原 `customCensorURL`，必须为 HTTP(S) 地址。支持 Plugin Server 可达的内网地址；拒绝内嵌用户名/密码的 URL。 |
| `timeoutMs` | 否 | 否 | 请求与响应体读取超时（范围 `100`–`60000` 毫秒，默认 `10000`）。不自动重试、不跟随重定向，响应体上限 64 KiB。 |

## 旧服务通信协议

```http
POST <endpoint>
Content-Type: application/json
```

```json
{"text":"待审核文本"}
```

```json
{"success":true,"message":"optional legacy message"}
```

仅根据顶层布尔值 `success` 判定裁决结果：`true` → `pass`，`false` → `block`。忽略 `message` 与其他附加字段，不虚构风险标签、关键词或置信度分数。不支持 Pro 内部 `{code:200/5000}` 或 `{data:...}` 包装结构。

网络错误、超时、非 2xx 响应、非法 JSON 或非布尔 `success` 均返回 `verdict: "error"`，不会隐式放行。是否放行由 FastGPT 全局「服务异常」策略控制（如需保持旧版 fail-open 行为，请选择「放行未审核内容」）。

## 迁移步骤

1. 安装本插件，将原 `customCensorURL` 填入 `endpoint`。
2. 确认 Plugin Server 执行环境可访问该地址（注意 `localhost` 指 Plugin Server 容器/节点，而非 FastGPT 主服务）。
3. 在管理后台测试通过后，勾选启用该插件并配置生效环节与异常处理策略。

## 本地开发与构建

```bash
pnpm --filter fastgpt-moderation-legacy-custom-censor test
pnpm --filter fastgpt-moderation-legacy-custom-censor type-check
pnpm --filter fastgpt-moderation-legacy-custom-censor build
pnpm --filter fastgpt-moderation-legacy-custom-censor check
pnpm --filter fastgpt-moderation-legacy-custom-censor pack
```
