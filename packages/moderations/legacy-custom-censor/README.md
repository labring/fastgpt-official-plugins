# 旧版自定义审核兼容 / Legacy Custom Moderation

将已有 FastGPT 自定义审核 HTTP 服务接入 moderation 插件体系，无需修改客户服务。
Connect an existing legacy FastGPT custom censor endpoint without changing its HTTP contract.

## 配置 / Configuration

- `endpoint`：原 `customCensorURL`，必须为 HTTP(S) 地址。管理员配置，可使用内网地址；不支持 URL 内嵌用户名／密码。插件不附带 Pro 内部 token 或其他鉴权头。
- `timeoutMs`：100–60000 毫秒，默认 10000。请求和响应读取共用超时，不自动重试、不跟随重定向，响应最大 64 KiB。

`endpoint` is the operator-controlled legacy HTTP(S) URL. Private network addresses are supported when reachable from the Plugin Server. Embedded credentials are rejected. No Pro token or authorization header is sent. `timeoutMs` defaults to 10000 (100–60000 ms); it covers request and body reading. No retries or redirects; response size is capped at 64 KiB.

## 旧服务协议 / Wire contract

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

只读取顶层布尔 `success`：true → pass，false → block。`message` 与其他字段忽略；不返回虚构标签、关键词或分数。不支持 Pro 内部 `{code:200/5000}` 或 `{data:...}` 包装协议。

Only a top-level boolean `success` determines the verdict. The legacy `message` and extra fields are ignored. No labels, keywords or scores are fabricated. Pro-internal `{code:200/5000}` and `{data:...}` envelopes are not supported.

网络错误、超时、非 2xx、非法 JSON 或非布尔 success 均返回 `error`，不隐式放行。是否放行由 FastGPT「服务异常」策略决定；沿用旧 fail-open 行为时请选择异常放行。

Network errors, timeouts, non-2xx responses and malformed payloads return `error`, not `pass`. Configure the FastGPT service-exception policy to choose fail-open or fail-closed.

## 迁移 / Migration

1. 安装本插件，将原 `customCensorURL` 填入 `endpoint`。
2. 确认 Plugin Server 网络可访问旧服务；`localhost` 指 Plugin Server 执行环境，不再指 FastGPT/Pro。确认 pod 网络权限及出站白名单。
3. 在管理侧测试后手动选择生效插件、审核环节与异常策略；不要假设旧模型级 censor 开关与新全局审核范围相同。

Install the plugin, copy the original URL, verify connectivity from the Plugin Server (including sandbox permissions), test it, then explicitly select moderation stages and error policy. This plugin does not migrate or reactivate the old global hook/model switches.

## 开发 / Development

```sh
pnpm test
pnpm type-check
pnpm build
pnpm check
pnpm pack
```
