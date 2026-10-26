# 关键词内容审核测试插件

这是一个独立的 **FastGPT moderation 插件**，位于 `packages/test/moderations/moderationTest`。它与 `packages/tools` 中的工具插件属于不同插件类型，通过 moderation provider 对同步文本进行本地关键词审查，不调用外部服务。

> 仅用于开发和测试。简单的子串匹配不能替代生产级内容安全审核。

## 审核规则

- `blockedKeywords` 中任意词命中时返回 `block`。
- 没有拦截词命中时，若 `suspiciousKeywords` 中任意词命中则返回 `suspected`。
- 两类词都未命中时返回 `pass`。
- 匹配忽略大小写，词表使用英文逗号分隔，空项忽略；拦截优先。
- `hits` 保存逐项命中信息，不包含 `verdict`；顶层 `verdict` 是唯一裁决。
- 不生成 `score`：本地关键词匹配没有 provider 原生置信度。

## Secrets

在 moderation 插件配置中设置以下字段；两者均可留空：

| 字段 | 用途 | 示例 |
| --- | --- | --- |
| `blockedKeywords` | 命中即拦截 | `blocked phrase,deny` |
| `suspiciousKeywords` | 命中即标记为疑似 | `review,maybe` |

## 输入与输出

输入是同步文本 `{ "content": "..." }`。SDK 将 provider 的 `{ verdict, hits }` 归一化为 moderation 标准结果，并补充命中词并集与 provider 标识。此插件只覆盖同步文本，不带 `status` 信封，不支持异步任务或其他模态。

## 本地验证

在仓库根目录运行：

```bash
pnpm install
pnpm --filter "./packages/test/moderations/moderationTest" run test
pnpm --filter "./packages/test/moderations/moderationTest" run type-check
pnpm --filter "./packages/test/moderations/moderationTest" run debug:run
pnpm --filter "./packages/test/moderations/moderationTest" run build:moderation
pnpm --filter "./packages/test/moderations/moderationTest" run check
pnpm --filter "./packages/test/moderations/moderationTest" run pack:moderation
```

`pnpm pack` 是包管理器内置命令；此插件的 moderation 包请运行 `pnpm run pack:moderation`。

## 测试产物与发布边界

打包后在此目录生成 `moderationTest.pkg`。该产物仅用于本地验证，不会自动提交、上传或发布。正式 Marketplace 发布 workflow 只扫描 `packages/tools`；`packages/test/moderations` 是 workspace 中的测试类别，不是正式发布目录。

## SDK / runtime 依赖

该插件使用 `defineModeration()` 和 `defineModerationManifest()`（SDK 2.x）。当前官方插件仓库的 CLI/SDK catalog 仍是旧版，尚未包含 moderation 支持；完整构建需要 moderation 功能合入、更新 CLI/SDK 依赖，并使用支持 moderation 的 FastGPT Plugin Server runtime。
