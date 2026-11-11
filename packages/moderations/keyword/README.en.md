# Local Keyword Moderation

Language: [English](./README.en.md) | [简体中文](./README.zh-CN.md)

An official FastGPT `moderation` plugin (`packages/moderations/keyword`) powered by an **Aho-Corasick multi-pattern automaton** and a sanitized, tiered open-source sensitive lexicon ([konsheng/Sensitive-lexicon](https://github.com/konsheng/Sensitive-lexicon)).

It runs **100% locally with zero external network calls** and sub-millisecond latency (~0.2 ms), making it ideal for private networks, privacy-sensitive deployments, and low-latency streaming output checks.

## Key Features

- **High Performance**: $O(N + M)$ Aho-Corasick automaton scanning decouples latency from dictionary size; 7,000-character texts are reviewed in 1–2 ms.
- **Built-in Tiered Lexicon**: Sanitized into `block` (high-risk) and `suspected` (review) tiers across six categories (all enabled by default except `ad`):
  - `politics`: political and harmful ideological terms
  - `violence`: terrorism, violence, firearms, and explosives
  - `porn`: pornography, prostitution, and vulgarity
  - `contraband`: narcotics, smuggling, counterfeiting, and illicit trade
  - `ad`: spam, gambling, and scam promotion URLs (disabled by default to avoid false positives)
  - `other`: corruption, disciplinary violations, and general sensitive terms
- **Flexible Customization**: Configure custom blocklists, custom suspected lists, domain whitelists (exempting longer compound terms containing sensitive substrings), and per-category toggles directly in the FastGPT UI.

## Configuration (`secretSchema`)

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `customBlockedKeywords` | `string` | - | Comma/semicolon/newline separated keywords that immediately trigger `block` (supports `keyword` or `keyword:category`) |
| `customSuspiciousKeywords` | `string` | - | Comma/semicolon/newline separated keywords marked as `suspected` |
| `whiteList` | `string` | - | Comma/semicolon/newline separated exempted terms (prevents false positives on compound domain nouns) |
| `enableDefaultDict` | `boolean` | `true` | Enable the built-in open-source lexicon |
| `enablePolitics` | `boolean` | `true` | Enable politics category |
| `enableViolence` | `boolean` | `true` | Enable violence/terrorism category |
| `enablePorn` | `boolean` | `true` | Enable pornography category |
| `enableContraband` | `boolean` | `true` | Enable contraband/narcotics category |
| `enableAd` | `boolean` | `false` | Enable advertising/spam category |
| `enableOther` | `boolean` | `true` | Enable other general sensitive category |

## Development

```bash
pnpm install
pnpm --filter "./packages/moderations/keyword" run test
pnpm --filter "./packages/moderations/keyword" run type-check
pnpm --filter "./packages/moderations/keyword" run build
pnpm --filter "./packages/moderations/keyword" run check
pnpm --filter "./packages/moderations/keyword" run pack
```
