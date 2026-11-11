# Legacy Custom Moderation

Language: [English](./README.en.md) | [简体中文](./README.zh-CN.md)

Connect an existing legacy FastGPT custom censor HTTP endpoint (`customCensorURL`) to the moderation plugin system without changing the upstream service contract.

## Configuration

| Field | Required | Secret | Description |
| --- | --- | --- | --- |
| `endpoint` | Yes | No | Operator-controlled legacy HTTP(S) URL. Private network addresses are supported when reachable from the Plugin Server. Embedded URL credentials are rejected. |
| `timeoutMs` | No | No | Request and body read timeout in milliseconds (`100`–`60000`, default `10000`). No automatic retries or redirects; response body is capped at 64 KiB. |

## Wire Contract

```http
POST <endpoint>
Content-Type: application/json
```

```json
{"text":"text to review"}
```

```json
{"success":true,"message":"optional legacy message"}
```

Only a top-level boolean `success` determines the verdict (`true` -> `pass`, `false` -> `block`). The legacy `message` and extra fields are ignored; no labels, keywords, or scores are fabricated. Pro-internal `{code:200/5000}` and `{data:...}` envelopes are not supported.

Network errors, timeouts, non-2xx responses, and malformed payloads return `verdict: "error"` rather than `pass`. Configure the FastGPT service-exception policy to choose fail-open or fail-closed behavior.

## Migration

1. Install this plugin and copy the original `customCensorURL` into `endpoint`.
2. Verify network reachability from the Plugin Server execution environment (including pod network permissions and outbound allowlists).
3. Test the configuration in the admin console, then explicitly enable the plugin and select moderation stages and exception handling policy.

## Development

```bash
pnpm --filter fastgpt-moderation-legacy-custom-censor test
pnpm --filter fastgpt-moderation-legacy-custom-censor type-check
pnpm --filter fastgpt-moderation-legacy-custom-censor build
pnpm --filter fastgpt-moderation-legacy-custom-censor check
pnpm --filter fastgpt-moderation-legacy-custom-censor pack
```
