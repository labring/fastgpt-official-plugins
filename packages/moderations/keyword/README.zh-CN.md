# 本地关键词内容安全审查

语言：[简体中文](./README.zh-CN.md) | [English](./README.en.md)

这是一个独立的 **FastGPT 官方 `moderation` 插件**，位于 `packages/moderations/keyword`。

基于 **Aho-Corasick 多模式匹配自动机** 和主流开源敏感词库（[konsheng/Sensitive-lexicon](https://github.com/konsheng/Sensitive-lexicon)）构建，提供**完全本地运行、零外部网络依赖、0.2ms 极致响应延迟**的内容安全审查能力，特别适用于政企专网、数据隐私敏感及对流式打字机延迟极度敏感的场景。

## 核心特性

- **极致性能**：基于 AC 自动机实现，多模式匹配时间复杂度为 $O(N + M)$，扫描性能与词库大小解耦，7,000 字长文本可在 1~2ms 内完成审查。
- **开箱即用分级开源词库**：对开源词库做去噪清洗并拆分为 `block`（高危拦截）与 `suspected`（疑似风险）两档，覆盖六大分类（默认启用除 `ad` 外的五大分类）：
  - `politics`（涉政/反动/敏感人物与历史事件）
  - `violence`（暴恐/涉枪涉爆）
  - `porn`（色情低俗）
  - `contraband`（违禁品/毒品/黑产交易）
  - `ad`（高风险广告/引流/非法博彩诈骗网址，默认关闭以避免误杀正常商业信息）
  - `other`（贪腐/违纪违规等其他综合敏感词）
- **灵活自定义配置**：支持在 FastGPT 插件配置界面动态配置自定义黑名单、自定义疑似词、业务白名单豁免词（支持长专有名词豁免内部敏感子串）及各分类独立开关。

## 配置项 (`secretSchema`)

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `customBlockedKeywords` | `string` | - | 自定义拦截词库（逗号/分号/换行分隔，命中立即判定为 `block`，支持 `词` 或 `词:分类`） |
| `customSuspiciousKeywords` | `string` | - | 自定义疑似词库（命中标记为 `suspected`） |
| `whiteList` | `string` | - | 白名单豁免词库（防止业务专有名词被误拦截，支持豁免长词内部的敏感子词） |
| `enableDefaultDict` | `boolean` | `true` | 是否启用内置开源词库 |
| `enablePolitics` | `boolean` | `true` | 是否启用涉政敏感词分类 |
| `enableViolence` | `boolean` | `true` | 是否启用暴恐违规词分类 |
| `enablePorn` | `boolean` | `true` | 是否启用色情低俗词分类 |
| `enableContraband` | `boolean` | `true` | 是否启用违禁品/毒品词分类 |
| `enableAd` | `boolean` | `false` | 是否启用广告引流词分类 |
| `enableOther` | `boolean` | `true` | 是否启用其他综合敏感词分类 |

## 本地开发与构建

```bash
pnpm install
pnpm --filter "./packages/moderations/keyword" run test
pnpm --filter "./packages/moderations/keyword" run type-check
pnpm --filter "./packages/moderations/keyword" run build
pnpm --filter "./packages/moderations/keyword" run check
pnpm --filter "./packages/moderations/keyword" run pack
```
