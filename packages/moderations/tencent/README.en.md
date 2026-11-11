# Tencent Cloud Text Moderation

Language: [English](./README.en.md) | [简体中文](./README.zh-CN.md)

A synchronous FastGPT `moderation` plugin powered by Tencent Cloud TMS `TextModeration` (API version `2020-12-29`). It uses the official Tencent Cloud SDK for TC3 signing over the fixed HTTPS endpoint `tms.tencentcloudapi.com` with a 15-second timeout.

## Configuration

| Field | Required | Secret | Description |
| --- | --- | --- | --- |
| `secretId` | Yes | Yes | Tencent Cloud CAM SecretId with TMS text moderation permission |
| `secretKey` | Yes | Yes | Tencent Cloud CAM SecretKey |
| `region` | No | No | Service region (default `ap-guangzhou`); select a region supported by your TMS account |
| `bizType` | No | No | Optional policy ID configured in the Tencent Cloud content safety console; leave blank for the default policy |

Enable Tencent Cloud Text Moderation Service (TMS) before use. Strictness and custom lexicons are managed in Tencent Cloud policies rather than by local score thresholds.

## Contract

Input `content` is UTF-8 Base64-encoded before calling TMS. Correlation fields `dataId` (up to 64 characters), `sessionId`, `userId` (`AccountType=7`), and IPv4 `userIp` are forwarded when provided.

- `Pass` -> `pass`; `Review` -> `suspected`; `Block` -> `block`.
- All `DetailResults` risk entries are preserved with their original label, sub-label, native score (`0`–`100`), and keywords; the top-level result is used when `DetailResults` is empty.
- `Normal` labels are omitted from hits; custom or newly added vendor labels map to `other` while preserving `providerLabel`.
- The SDK automatically populates `provider: "tencent"` and deduplicated `keywords`.
- Request failures, timeouts, or malformed responses return `verdict: "error"` without leaking credentials or submitted text.
- Oversized text is not automatically split so that vendor policy semantics remain intact.

## Development

```bash
pnpm --filter fastgpt-moderation-tencent test
pnpm --filter fastgpt-moderation-tencent type-check
pnpm --filter fastgpt-moderation-tencent build
pnpm --filter fastgpt-moderation-tencent check
pnpm --filter fastgpt-moderation-tencent pack
```

## References

- [Tencent Cloud TMS TextModeration API](https://cloud.tencent.com/document/api/1124/51860)
- [Tencent Cloud Node.js SDK (TMS v20201229)](https://github.com/TencentCloud/tencentcloud-sdk-nodejs/tree/master/src/services/tms/v20201229)
