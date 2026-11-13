# 腾讯云文本内容审查

语言：[简体中文](./README.zh-CN.md) | [English](./README.en.md)

FastGPT `moderation` 插件，调用腾讯云天御文本内容安全 TMS `TextModeration`（API 版本 `2020-12-29`）。使用腾讯云官方 SDK 处理 TC3 签名，通过固定 HTTPS 域名 `tms.tencentcloudapi.com` 发起请求，单次超时 15 秒。

## 配置说明

| 字段 | 必填 | 加密存储 | 说明 |
| --- | --- | --- | --- |
| `secretId` | 是 | 是 | 腾讯云 CAM SecretId（建议仅授予最小 TMS 文本审核权限） |
| `secretKey` | 是 | 是 | 腾讯云 CAM SecretKey |
| `region` | 否 | 否 | 接入地域，默认 `ap-guangzhou`；请选择账号已开通 TMS 的支持地域 |
| `bizType` | 否 | 否 | 可选，腾讯云内容安全控制台创建的审核策略编号；留空使用默认策略 |

使用前需先开通腾讯云文本内容安全服务。严格度阈值和自定义词库由腾讯云控制台策略管理，插件不在本地自行调分。

## 输入与输出协议

输入 `content` 为待审文本，插件自动进行 UTF-8 Base64 编码，并按需透传 `dataId`（不超过 64 字符）、`sessionId`、`userId`（`AccountType=7`）和 IPv4 `userIp`。

- `Pass` → `pass`；`Review` → `suspected`；`Block` → `block`。
- 输出全部 `DetailResults` 风险项，保留原始标签、子标签、`0`–`100` 原生分数和命中词；无明细时使用顶层结果。
- `Normal` 正常标签不生成风险命中项；自定义或新增标签归为 `other` 并保留 `providerLabel`。
- SDK 自动填充标准结果的 `provider: "tencent"` 与去重后的 `keywords`。
- 请求失败、超时或响应格式异常统一返回 `verdict: "error"`，不会伪装成 `pass` 或泄露密钥及待审原文。
- 不自动切分超长文本，避免改变语义及厂商策略判定效果。

## 本地开发与构建

```bash
pnpm --filter fastgpt-moderation-tencent test
pnpm --filter fastgpt-moderation-tencent type-check
pnpm --filter fastgpt-moderation-tencent build
pnpm --filter fastgpt-moderation-tencent check
pnpm --filter fastgpt-moderation-tencent pack
```

## 参考链接

- [腾讯云 TMS 文本内容安全接口文档](https://cloud.tencent.com/document/api/1124/51860)
- [腾讯云 Node.js SDK (TMS v20201229)](https://github.com/TencentCloud/tencentcloud-sdk-nodejs/tree/master/src/services/tms/v20201229)
