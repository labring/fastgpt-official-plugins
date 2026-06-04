# GitHub Actions 配置说明

本文档说明当前仓库两个 marketplace 发布 workflow 需要的 GitHub 侧配置。

## Workflow

- `Extract Updated Tools`：`packages/**` 变化合入 `main` 后，提取发生变化的 `packages/tools/<tool>` 列表，并触发 marketplace 发布 workflow。
- `Publish Tools to Marketplace`：接收工具列表，等待人工 approval，通过后 build、pack 并调用 `pnpm run upload -- packages/tools/<tool>` 发布到 marketplace。

## Environments

在 GitHub 仓库中进入 `Settings` -> `Environments`，创建以下 environments。

### `MarketplacePublish`

用于 marketplace 发布审批。必须开启 `Required reviewers`，只有 reviewer 点击 approve 后，`Publish Tools to Marketplace` 中的发布 job 才会继续执行。

建议配置：

- `Required reviewers`：选择负责 marketplace 发布的成员或团队。
- `Deployment branches`：限制为 `main`。

## Repository Secrets

在 `Settings` -> `Secrets and variables` -> `Actions` -> `Secrets` 配置。

| Name | 必填 | 用途 |
| --- | --- | --- |
| `MARKETPLACE_BASE_URL` | 是 | marketplace 服务地址，例如 `https://marketplace.example.com`。 |
| `MARKETPLACE_AUTH` | 是 | 调用 `/api/admin/pkg/upload` 的 `Authorization` header。 |
| `NPM_TOKEN` | 私有 npm 包或未公开版本时必填 | 安装 `@fastgpt-plugin/*` 等依赖时写入 `~/.npmrc`。 |

## Actions 权限

进入 `Settings` -> `Actions` -> `General`：

- `Workflow permissions` 需要允许 workflow 获取 `contents: read`。
- `Extract Updated Tools` 需要 `actions: write` 来触发 `Publish Tools to Marketplace`。

如果组织限制了默认 token 权限，需要允许仓库 workflow 使用上述权限。

## 发布流程

1. 合并包含 `packages/**` 变化的 PR 到 `main`。
2. `Extract Updated Tools` 自动运行，生成更新工具列表并触发 `Publish Tools to Marketplace`。
3. `Publish Tools to Marketplace` 先运行 `Prepare Tool List`，在 run summary 中展示待发布工具。
4. `Build, Pack and Publish Tools` job 进入 `MarketplacePublish` environment 等待人工 approval。
5. reviewer 确认后，workflow 会对每个工具执行：
   - `pnpm --filter "./packages/tools/<tool>" run build`
   - `pnpm --filter "./packages/tools/<tool>" run pack`
   - `pnpm run upload -- "packages/tools/<tool>"`

## 首次上线检查

- `MarketplacePublish` 已配置 required reviewers。
- `MARKETPLACE_BASE_URL` 和 `MARKETPLACE_AUTH` 已配置。
- `pnpm-workspace.yaml` 中的 catalog 版本可被 GitHub runner 安装；如依赖在私有 registry 中，配置 `NPM_TOKEN`。
