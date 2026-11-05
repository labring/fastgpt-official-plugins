# Alibaba Cloud Text Moderation / 阿里云文本内容审查

A synchronous text moderation provider using Alibaba Cloud `TextModerationPlus`
(API version `2022-03-02`). This is a `moderation` plugin, not a tool.

通过阿里云内容安全增强版同步审核文本，适用于用户输入和模型输出。

## Configuration / 配置

Activate the content safety service and grant the RAM identity permission to call
`green:TextModerationPlus`. Configure credentials in the FastGPT plugin settings;
never put them in source files, screenshots, or committed fixtures.

| Field | Description |
| --- | --- |
| `accessKeyId` | RAM AccessKey ID; encrypted secret |
| `accessKeySecret` | RAM AccessKey Secret; encrypted secret |
| `securityToken` | Optional STS token; refresh temporary credentials before expiry |
| `regionId` | `cn-shanghai` (default), `cn-beijing`, `cn-shenzhen`, or `ap-southeast-1`; service availability depends on your account and region |
| `service` | TextModerationPlus service name; default `llm_query_moderation`; use `llm_response_moderation` for generated responses if enabled for your account |

The regional endpoint is fixed to `green-cip.<regionId>.aliyuncs.com` over HTTPS.
Arbitrary endpoints are not accepted, to prevent forwarding credentials to an
untrusted server. Connect/read timeouts are 5/10 seconds; automatic retries are
disabled to avoid duplicate moderation charges.

先在阿里云开通相应服务，并配置具有最小调用权限的 RAM 凭据。审核标签和严格度在阿里云控制台配置，插件不自行设定置信度阈值。

## Contract / 输入输出

Input: `{ "content": "Text to review", "dataId": "optional-id" }`.
`dataId` is forwarded for tracing. Other standard host context fields are not
forwarded; `partial` does not select an asynchronous/streaming API. Each call
reviews the complete supplied text independently. Text length limits follow the
selected Alibaba Cloud service; oversized text is not silently truncated or split.

| Alibaba Cloud `RiskLevel` | Verdict |
| --- | --- |
| `none`, `low` | `pass` |
| `medium` | `suspected` |
| `high` | `block` |
| Missing/unknown result, non-success status, network/authentication/timeout failure | `error` |

All result entries are retained, except safe markers `nonLabel` and `normal`.
Hits preserve the original label and optional native confidence (0–100), with
keywords collected from `RiskWords`, `RiskPositions`, and `CustomizedHit`.
Unmapped labels use `other` without losing the original label. SDK factory fills
`provider: "aliyun"` and the deduplicated aggregate `keywords`.

Errors never include raw SDK exception text, submitted content, or credentials.
No image/audio/video moderation, async polling, prompt-attack or sensitive-data
service-specific verdicts are implemented. Select a content moderation service
that returns `RiskLevel`.

## Development

```bash
pnpm --filter fastgpt-moderation-aliyun test
pnpm --filter fastgpt-moderation-aliyun type-check
pnpm --filter fastgpt-moderation-aliyun build
pnpm --filter fastgpt-moderation-aliyun check
pnpm --filter fastgpt-moderation-aliyun pack
```

**SDK release prerequisite:** the repository's pinned factory `1.2.0-alpha.3`
and CLI `0.2.2-alpha.4` do not expose moderation authoring/build support. Use the
companion moderation-enabled factory/CLI release once published and update the
workspace catalog/lockfile. Tests for the provider adapter run against the
published Alibaba SDK; full plugin validation currently requires the companion
locally built factory/CLI. No machine-specific dependency paths are committed.
Use the same Zod version for the CLI and plugin (validated with 4.3.6): older
CLI-bundled Zod 4.1 can lose secret metadata across registries. Before distributing
the package, assert `isSecret: true` for all three credential fields in
`dist/manifest.json`; the validated local package preserves these flags.

Tests mock network requests. Live Alibaba Cloud authentication, service activation,
regional availability, billing, and vendor decisions require account-level validation.

References:
- https://help.aliyun.com/zh/content-moderation/
- https://github.com/aliyun/alibabacloud-typescript-sdk/tree/master/green-20220302
