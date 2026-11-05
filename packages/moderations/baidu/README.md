# Baidu Text Moderation / 百度文本内容审核

Maps Baidu synchronous text moderation to FastGPT moderation results. Requires the
moderation-capable SDK factory and CLI from the companion fastgpt-plugin change.
The currently pinned published SDK/CLI do not support this plugin yet.

## Configuration

- `apiKey`: API Key of a Baidu application with text moderation enabled (secret).
- `secretKey`: application Secret Key (secret).
- `strategyId`: optional positive integer from the Baidu moderation policy console.

Supply credentials through FastGPT plugin configuration, not source files or shell history.
Strictness is controlled in the Baidu console, not by invented local confidence thresholds.

Input: `{ "content": "Text to review" }`. Only synchronous text is supported.
Results use `pass`, `block`, `suspected`, or `error`. All hit groups are retained,
including keyword-only and model-only detections. Native probability is scaled from
0–1 to the SDK 0–100 range; scores are omitted when absent. The SDK derives the
combined keyword list and provider name. `requestId` identifies the last checked chunk.

Text is split on Unicode code points at 20,000 UTF-8 bytes and checked sequentially.
Chunk verdict precedence is `error > block > suspected > pass`; incomplete checks
are never silently accepted. Chunking can miss patterns spanning chunk boundaries
and cannot preserve cross-chunk semantic context. Empty/whitespace input is accepted
without an upstream request.

Tokens are cached in process per active credential pair, with expiry safety margin
and concurrent refresh deduplication. Invalid/expired tokens trigger one retry only.
Each HTTP request has a 15-second timeout. Provider failures return an `error`
verdict without leaking credentials, URLs containing tokens, or raw provider responses.

## Development

```bash
pnpm --filter fastgpt-moderation-baidu test
pnpm --filter fastgpt-moderation-baidu type-check
pnpm --filter fastgpt-moderation-baidu build
pnpm --filter fastgpt-moderation-baidu check
pnpm --filter fastgpt-moderation-baidu pack
```

Build/check/pack require the companion moderation-capable SDK and CLI release.
Tests mock HTTP; real Baidu credentials and billable live calls are not required.

## References

- [Request contract](https://ai.baidu.com/ai-doc/ANTIPORN/Rk3h6xb3i)
- [Response contract](https://ai.baidu.com/ai-doc/ANTIPORN/Nk3h6xbb2)
