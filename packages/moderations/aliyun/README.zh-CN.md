# 阿里云文本内容审查

语言：[简体中文](./README.zh-CN.md) | [English](./README.en.md)

基于阿里云内容安全增强版 `TextModerationPlus`（API 版本 `2022-03-02`）的同步文本内容审查插件（`moderation` 类型），适用于用户输入、模型输入与模型输出的安全审核。

## 配置说明

请先在阿里云开通内容安全增强版服务，并为 RAM 身份授予 `green:TextModerationPlus` 最小调用权限。凭据通过 FastGPT 插件配置界面加密保存，切勿写入源码、截图或提交记录中。审核标签与严格度在阿里云控制台配置，插件不自行设定置信度阈值。

| 字段 | 必填 | 加密存储 | 说明 |
| --- | --- | --- | --- |
| `accessKeyId` | 是 | 是 | 阿里云 RAM AccessKey ID |
| `accessKeySecret` | 是 | 是 | 阿里云 RAM AccessKey Secret |
| `securityToken` | 否 | 是 | 可选，临时 STS 安全令牌；使用临时凭据时请在过期前刷新 |
| `regionId` | 否 | 否 | 接入地域，默认 `cn-shanghai`，可选 `cn-beijing`、`cn-shenzhen`、`ap-southeast-1`（需账号在对应地域已开通服务） |
| `service` | 否 | 否 | `TextModerationPlus` 服务名，默认 `llm_query_moderation`；审核大模型生成回复时可按需配置为 `llm_response_moderation` |

接入域名固定为 HTTPS `green-cip.<regionId>.aliyuncs.com`，不接受任意自定义 URL，防止凭据泄露至不可信服务端。连接超时为 5 秒、读取超时为 10 秒；默认关闭自动重试以避免重复计费。

## 输入与输出协议

输入格式：`{ "content": "待审核文本", "dataId": "optional-id" }`。
`dataId` 会透传用于链路追踪；每次调用独立审查完整传入文本。文本长度限制遵循所选阿里云服务规格，超长文本不会静默截断或切分。

| 阿里云 `RiskLevel` | 标准裁决 `verdict` |
| --- | --- |
| `none`, `low` | `pass` |
| `medium` | `suspected` |
| `high` | `block` |
| 缺失/未知结果、非成功状态码、网络/鉴权/超时异常 | `error` |

除安全标记 `nonLabel` 与 `normal` 外，保留全部风险命中项，包含原始标签、原生置信度（`0`–`100`）以及从 `RiskWords`、`RiskPositions` 和 `CustomizedHit` 提取的命中关键词。未映射的新增或自定义标签归类为 `other` 并保留 `providerLabel` 原文。SDK 自动填充 `provider: "aliyun"` 与去重后的顶层 `keywords`。

异常信息不会回显底层 SDK 原始异常栈、送审文本或凭据内容。

## 本地开发与构建

```bash
pnpm --filter fastgpt-moderation-aliyun test
pnpm --filter fastgpt-moderation-aliyun type-check
pnpm --filter fastgpt-moderation-aliyun build
pnpm --filter fastgpt-moderation-aliyun check
pnpm --filter fastgpt-moderation-aliyun pack
```

## 参考链接

- [阿里云内容安全产品文档](https://help.aliyun.com/zh/content-moderation/)
- [阿里云 Green 20220302 TypeScript SDK](https://github.com/aliyun/alibabacloud-typescript-sdk/tree/master/green-20220302)
