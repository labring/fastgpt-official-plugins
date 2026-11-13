# Baidu Text Moderation

Language: [English](./README.en.md) | [简体中文](./README.zh-CN.md)

Maps Baidu synchronous text moderation (`text_censor/v2/user_defined`) to FastGPT's standardized moderation result contract.

## Configuration

| Field | Required | Secret | Description |
| --- | --- | --- | --- |
| `apiKey` | Yes | Yes | API Key of a Baidu application with text moderation enabled |
| `secretKey` | Yes | Yes | Application Secret Key |
| `strategyId` | No | No | Optional positive integer strategy ID from the Baidu content moderation console |

Supply credentials through FastGPT plugin configuration, not source files or shell history. Strictness is controlled in the Baidu console, not by invented local confidence thresholds.

## Contract

Input: `{ "content": "Text to review" }`. Only synchronous text is supported.
Results use `pass`, `block`, `suspected`, or `error`. All hit groups are retained, including keyword-only and model-only detections. Native probability is scaled from `0`–`1` to the SDK `0`–`100` range; scores are omitted when absent. The SDK derives the combined keyword list and provider name. `requestId` identifies the last checked chunk.

Text is split on Unicode code points at 20,000 UTF-8 bytes and checked sequentially. Chunk verdict precedence is `error > block > suspected > pass`; incomplete checks are never silently accepted. Empty or whitespace-only input is accepted without an upstream request.

Tokens are cached in process per active credential pair, with an expiry safety margin and concurrent refresh deduplication. Invalid or expired tokens trigger one retry only. Each HTTP request has a 15-second timeout. Provider failures return an `error` verdict without leaking credentials, URLs containing tokens, or raw provider responses.

## Development

```bash
pnpm --filter fastgpt-moderation-baidu test
pnpm --filter fastgpt-moderation-baidu type-check
pnpm --filter fastgpt-moderation-baidu build
pnpm --filter fastgpt-moderation-baidu check
pnpm --filter fastgpt-moderation-baidu pack
```

## References

- [Baidu Text Moderation Request Contract](https://ai.baidu.com/ai-doc/ANTIPORN/Rk3h6xb3i)
- [Baidu Text Moderation Response Contract](https://ai.baidu.com/ai-doc/ANTIPORN/Nk3h6xbb2)
