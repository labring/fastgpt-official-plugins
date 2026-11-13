# 本地关键词内容安全审查

语言：[简体中文](./README.zh-CN.md) | [English](./README.en.md)

这是一个独立的 **FastGPT 官方 `moderation` 插件**，位于 `packages/moderations/keyword`。

基于 **Aho-Corasick 多模式匹配自动机** 和主流开源敏感词库（[konsheng/Sensitive-lexicon](https://github.com/konsheng/Sensitive-lexicon)）构建，提供**完全本地运行、零外部网络依赖、0.2ms 极致响应延迟**的内容安全审查能力，特别适用于政企专网、数据隐私敏感及对流式打字机延迟极度敏感的场景。

## 核心特性

- **极致性能**：基于 AC 自动机实现，多模式匹配时间复杂度为 $O(N + M)$，扫描性能与词库大小解耦，7,000 字长文本可在 1~2ms 内完成审查。
- **开箱即用分级开源词库**：基于 `konsheng/Sensitive-lexicon` 词库构建并剔除高频日常误杀词，保留涉政与色情两类词库，拆分为 `block`（高危拦截）与 `suspected`（疑似风险）两档（默认全部开启，无需额外配置）：
  - `politics`（涉政：反动词库 + 政治类型）
  - `porn`（色情：色情词库）

## 配置说明

本插件无需配置密钥或开关参数，安装启用后默认同时开启涉政与色情词库审查。

## 本地开发与构建

```bash
pnpm install
pnpm --filter "./packages/moderations/keyword" run test
pnpm --filter "./packages/moderations/keyword" run type-check
pnpm --filter "./packages/moderations/keyword" run build
pnpm --filter "./packages/moderations/keyword" run check
pnpm --filter "./packages/moderations/keyword" run pack
```
