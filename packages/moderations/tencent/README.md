# 腾讯云文本内容审查 / Tencent Cloud Text Moderation

FastGPT moderation 插件，调用腾讯云 TMS `TextModeration`（API 版本 `2020-12-29`）。
使用腾讯云官方 SDK 处理 TC3 签名，通过固定 HTTPS 域名 `tms.tencentcloudapi.com` 请求；超时 15 秒。

## 配置

- `secretId`、`secretKey`：腾讯云 CAM 凭据，均为加密字段；仅授予所需的 TMS 文本审核权限。不要提交密钥到仓库。
- `region`：接入地域，默认 `ap-guangzhou`；选择账号所开通的 TMS 支持地域。
- `bizType`：可选，腾讯云内容安全控制台创建的审核策略编号；留空使用厂商默认策略。

需要先开通腾讯云文本内容安全服务。严格度和自定义词库由腾讯云策略管理，插件不自行调分。

## 协议

输入 `content` 是待审文本，自动 UTF-8 Base64 编码。透传 `dataId`、`sessionId`、`userId`（AccountType=7）和 `userIp`。
`DataId` 须符合腾讯云的格式及 64 字符限制，`Device.IP` 目前仅支持 IPv4。
`scene`、`partial` 无对应同步 TMS 字段，不发送给厂商。

- `Pass` → `pass`；`Review` → `suspected`；`Block` → `block`。
- 输出全部 DetailResults 风险项，保留原始标签、子标签、0–100 原始分数和命中词；无明细时使用顶层结果。
- 正常标签不生成风险项；自定义/新增标签归为 `other`，保留 `providerLabel`。
- SDK 自动生成统一结果的 `provider` 与去重 `keywords`，不使用旧式 `status/result` envelope。
- 请求失败、超时或响应格式异常返回 `error`，不会伪装成 `pass` 或泄露上游异常中的密钥/原文。
- 不自动拆分长文本：拆分会改变语义和厂商策略效果。超出厂商限制的请求由腾讯云返回错误。

## Development

Requires the companion SDK factory/CLI release supporting `defineModeration` (not the legacy tool-only template).

```bash
pnpm --filter fastgpt-moderation-tencent test
pnpm --filter fastgpt-moderation-tencent type-check
pnpm --filter fastgpt-moderation-tencent build
pnpm --filter fastgpt-moderation-tencent check
pnpm --filter fastgpt-moderation-tencent pack
```

Tests mock the official SDK; they do not send text to Tencent Cloud or incur API charges. Configure credentials through the FastGPT plugin settings for a live check.

References:
- https://cloud.tencent.com/document/api/1124/51860
- https://github.com/TencentCloud/tencentcloud-sdk-nodejs/tree/master/src/services/tms/v20201229
