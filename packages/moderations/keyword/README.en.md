# Local Keyword Moderation

Language: [English](./README.en.md) | [简体中文](./README.zh-CN.md)

An official FastGPT `moderation` plugin (`packages/moderations/keyword`) powered by an **Aho-Corasick multi-pattern automaton** and a sanitized, tiered open-source sensitive lexicon ([konsheng/Sensitive-lexicon](https://github.com/konsheng/Sensitive-lexicon)).

It runs **100% locally with zero external network calls** and sub-millisecond latency (~0.2 ms), making it ideal for private networks, privacy-sensitive deployments, and low-latency streaming output checks.

## Key Features

- **High Performance**: $O(N + M)$ Aho-Corasick automaton scanning decouples latency from dictionary size; 7,000-character texts are reviewed in 1–2 ms.
- **Built-in Tiered Lexicon**: Built directly from `konsheng/Sensitive-lexicon` (`反动词库.txt`, `政治类型.txt`, `色情词库.txt`) with high-frequency false-positive terms removed, separated into `block` (high-risk) and `suspected` (review) tiers across two categories (both always enabled out of the box):
  - `politics`: political and reactionary lexicon
  - `porn`: pornography and vulgarity lexicon

## Configuration

No configuration or API credentials are required. Both `politics` and `porn` lexicons are enabled automatically.

## Development

```bash
pnpm install
pnpm --filter "./packages/moderations/keyword" run test
pnpm --filter "./packages/moderations/keyword" run type-check
pnpm --filter "./packages/moderations/keyword" run build
pnpm --filter "./packages/moderations/keyword" run check
pnpm --filter "./packages/moderations/keyword" run pack
```
