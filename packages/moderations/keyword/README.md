# 本地高性能敏感词内容审核插件 (Local Keyword Moderation)

这是一个独立的 **FastGPT 官方 moderation 插件**，位于 `packages/moderations/keyword`。

基于 **Aho-Corasick 多模式匹配自动机** 和主流开源敏感词库（[konsheng/Sensitive-lexicon](https://github.com/konsheng/Sensitive-lexicon)）构建，提供**完全本地运行、零外部网络依赖、0.2ms 极致响应延迟**的内容安全审查能力，特别适用于政企专网、数据隐私敏感及对流式打字机延迟极度敏感的场景。

## 核心特性

- **极致性能**：基于 AC 自动机实现，多模式匹配时间复杂度为 $O(N + M)$，扫描性能与词库大小解耦，7,000 字长文本可在 1~2ms 内完成审查。
- **开箱即用全量开源词库**：完整收录开源词库并经过去噪脱敏清洗的六大分类词库（共 50,000+ 词）：
  - `politics`（涉政/反动/敏感人物与历史事件，约 24,000+ 词）
  - `violence`（暴恐/涉枪涉爆，约 1,300+ 词）
  - `porn`（色情低俗，约 1,700+ 词）
  - `contraband`（违禁品/毒品/黑产交易，约 500+ 词）
  - `ad`（高风险广告/引流/非法博彩诈骗网址，约 20,000+ 词）
  - `other`（贪腐/违纪违规等其他敏感词，约 1,600+ 词）
- **灵活自定义配置**：支持在 FastGPT 插件配置界面动态配置自定义黑名单、自定义疑似词及业务白名单豁免词。

## 配置项 (Secrets)

| 字段 | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| `customBlockedKeywords` | string | 自定义拦截词库（逗号/分号/换行分隔，命中立即判定为 `block`，支持 `词` 或 `词:分类`） | `违禁词,竞品A:competitor` |
| `customSuspiciousKeywords` | string | 自定义疑似词库（命中标记为 `suspected`） | `人工复核,待定词` |
| `whiteList` | string | 白名单豁免词库（防止业务专有名词被误拦截） | `安全测试,弹药库管理系统` |
| `enableDefaultDict` | boolean | 是否启用内置开源词库，默认 `true` | `true` |

## 构建与打包

在仓库根目录运行：

```bash
pnpm install
pnpm --filter "./packages/moderations/keyword" run test
pnpm --filter "./packages/moderations/keyword" run type-check
pnpm --filter "./packages/moderations/keyword" run check
pnpm --filter "./packages/moderations/keyword" run pack:moderation
```

打包后在此目录生成 `keyword.pkg`。
