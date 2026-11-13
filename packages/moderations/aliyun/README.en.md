# Alibaba Cloud Text Moderation

Language: [English](./README.en.md) | [简体中文](./README.zh-CN.md)

A synchronous text moderation provider using Alibaba Cloud `TextModerationPlus` (API version `2022-03-02`). This is a `moderation` plugin, not a tool.

## Configuration

Activate the content safety service and grant the RAM identity permission to call `green:TextModerationPlus`. Configure credentials in the FastGPT plugin settings; never put them in source files, screenshots, or committed fixtures.

| Field | Required | Secret | Description |
| --- | --- | --- | --- |
| `accessKeyId` | Yes | Yes | RAM AccessKey ID; encrypted secret |
| `accessKeySecret` | Yes | Yes | RAM AccessKey Secret; encrypted secret |
| `securityToken` | No | Yes | Optional STS token; refresh temporary credentials before expiry |
| `regionId` | No | No | `cn-shanghai` (default), `cn-beijing`, `cn-shenzhen`, or `ap-southeast-1`; service availability depends on your account and region |
| `service` | No | No | `TextModerationPlus` service name; default `llm_query_moderation`; use `llm_response_moderation` for generated responses if enabled for your account |

The regional endpoint is fixed to `green-cip.<regionId>.aliyuncs.com` over HTTPS. Arbitrary endpoints are not accepted, to prevent forwarding credentials to an untrusted server. Connect/read timeouts are 5/10 seconds; automatic retries are disabled to avoid duplicate moderation charges.

## Contract

Input: `{ "content": "Text to review", "dataId": "optional-id" }`.
`dataId` is forwarded for tracing. Other standard host context fields are not forwarded; `partial` does not select an asynchronous/streaming API. Each call reviews the complete supplied text independently. Text length limits follow the selected Alibaba Cloud service; oversized text is not silently truncated or split.

| Alibaba Cloud `RiskLevel` | Verdict |
| --- | --- |
| `none`, `low` | `pass` |
| `medium` | `suspected` |
| `high` | `block` |
| Missing/unknown result, non-success status, network/authentication/timeout failure | `error` |

All result entries are retained, except safe markers `nonLabel` and `normal`. Hits preserve the original label and optional native confidence (`0`–`100`), with keywords collected from `RiskWords`, `RiskPositions`, and `CustomizedHit`. Unmapped labels use `other` without losing the original label. SDK factory fills `provider: "aliyun"` and the deduplicated aggregate `keywords`.

Errors never include raw SDK exception text, submitted content, or credentials.

## Development

```bash
pnpm --filter fastgpt-moderation-aliyun test
pnpm --filter fastgpt-moderation-aliyun type-check
pnpm --filter fastgpt-moderation-aliyun build
pnpm --filter fastgpt-moderation-aliyun check
pnpm --filter fastgpt-moderation-aliyun pack
```

## References

- [Alibaba Cloud Content Moderation Documentation](https://help.aliyun.com/zh/content-moderation/)
- [Alibaba Cloud Green 20220302 TypeScript SDK](https://github.com/aliyun/alibabacloud-typescript-sdk/tree/master/green-20220302)
