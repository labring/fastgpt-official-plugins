# GitHub Actions 配置说明

本文档说明当前仓库 marketplace 发布 workflow 需要的 GitHub 侧配置。

## Workflow

- `Extract Updated Tools`：`packages/**` 变化合入 `main` 后，提取发生变化的 `packages/tools/<tool>` 列表，并触发 marketplace 发布 workflow。
- `Publish Tools to Marketplace`：接收工具列表，等待人工 approval，通过后 build、pack 并调用 `pnpm run upload packages/tools/<tool>` 发布到 marketplace。
- `Publish All Tools to Marketplace`：手动触发，扫描 `packages/tools/*` 下所有插件，全部 build、pack，通过人工 approval 后上传到 marketplace。
- `Build Full Plugin Package`：`packages/tools/**` 变化合入 `main` 后，重新打包全部 `packages/tools/*` 插件，生成固定名 `fastgpt-official-plugins.zip`（扁平 `.pkg` 结构，不含 `packages/test/tools/*`），并更新滚动 release `pkg-latest` 的资产。无需人工 approval。

## Environments

在 GitHub 仓库中进入 `Settings` -> `Environments`，创建以下 environments。

### `MarketplacePublish`

用于 marketplace 发布审批。必须开启 `Required reviewers`，只有 reviewer 点击 approve 后，增量发布和全量发布中的 marketplace upload job 才会继续执行。

建议配置：

- `Required reviewers`：选择负责 marketplace 发布的成员或团队。
- `Deployment branches`：限制为 `main`。
- `Environment secrets`：把 `MARKETPLACE_BASE_URL` 和 `MARKETPLACE_AUTH` 放在该 environment 下，审批通过后发布 job 才能读取。

## Repository Secrets

在 `Settings` -> `Secrets and variables` -> `Actions` -> `Secrets` 配置。发布相关密钥建议配置为 `MarketplacePublish` 的 environment secrets。

| Name | 必填 | 用途 |
| --- | --- | --- |
| `MARKETPLACE_BASE_URL` | 是 | marketplace 服务地址，例如 `https://marketplace.example.com`。 |
| `MARKETPLACE_AUTH` | 是 | 调用 `/api/admin/pkg/upload` 的 `Authorization` header。 |
| `NPM_TOKEN` | 私有 npm 包或未公开版本时必填 | 安装 `@fastgpt-plugin/*` 等依赖时写入 `~/.npmrc`。 |
| `RELEASE_TOKEN` | 组织策略钳制 `GITHUB_TOKEN` 时必填 | 对目标仓库具备 `contents: write` 的 PAT，供 `Build Full Plugin Package` 创建和更新 `pkg-latest` release；未配置时回退到 `GITHUB_TOKEN`。 |

## Actions 权限

进入 `Settings` -> `Actions` -> `General`：

- `Workflow permissions` 需要允许 workflow 获取 `contents: read`。
- `Extract Updated Tools` 需要 `actions: write` 来触发 `Publish Tools to Marketplace`。
- `Build Full Plugin Package` 使用 workflow 内的 `contents: write` 权限创建和更新 release；若仓库或组织把 `GITHUB_TOKEN` 限制为只读，需配置 `RELEASE_TOKEN`。

如果组织限制了默认 token 权限，需要允许仓库 workflow 使用上述权限。

## 发布流程

### 增量发布

1. 合并包含 `packages/**` 变化的 PR 到 `main`。
2. `Extract Updated Tools` 自动运行，生成更新工具列表并触发 `Publish Tools to Marketplace`。
3. `Publish Tools to Marketplace` 先运行 `Prepare Tool List`，在 run summary 中展示来源 commit、提取 workflow run 和待发布工具。
4. `Build, Pack and Publish Tools` job 进入 `MarketplacePublish` environment 等待人工 approval。
5. reviewer 确认后，workflow 会对每个工具执行：
   - `pnpm --filter "./packages/tools/<tool>" run build`
   - `pnpm --filter "./packages/tools/<tool>" run pack`
   - `pnpm run upload "packages/tools/<tool>"`

### 全量发布

1. 手动运行 `Publish All Tools to Marketplace`，可选输入 `ref` 指定要发布的 branch、tag 或 commit。
2. `Prepare All Tool List` 扫描 `packages/tools/*/package.json`，生成全量工具列表并展示在 run summary。
3. `Build and Pack All Tools` 对每个工具执行：
   - `pnpm --filter "./packages/tools/<tool>" run build`
   - `pnpm --filter "./packages/tools/<tool>" run pack`
4. build/pack 产物作为 artifact 保存。
5. `Publish All Tools` job 进入 `MarketplacePublish` environment 等待人工 approval。
6. reviewer 确认后，workflow 下载 `.pkg` artifact，并对每个 `.pkg` 文件执行 `pnpm run upload "<pkg-file>"`。

### 全量包发布（批量重装用 zip）

1. 合并包含 `packages/tools/**`、`scripts/build-full-package.ts`、`package.json` 或 workflow 自身变化的 PR 到 `main`，`Build Full Plugin Package` 自动运行；也可手动 `workflow_dispatch` 并指定 `ref`（非 `main` 只产出 artifact，不更新 release）。
2. workflow 执行 `pnpm run pack:tools` 打包全部 `packages/tools/*`，再执行 `pnpm exec tsx scripts/build-full-package.ts --out dist/fastgpt-official-plugins.zip` 生成扁平 zip。
3. zip 作为 `fastgpt-official-plugins` artifact 保存，同时用 `gh release` 上传到滚动 release `pkg-latest`（`--clobber` 覆盖同名资产，notes 记录本次 source commit）。
4. 用户下载地址固定为 `https://github.com/labring/fastgpt-official-plugins/releases/download/pkg-latest/fastgpt-official-plugins.zip`，在 FastGPT 后台 `添加插件` -> `导入/更新插件` 上传即可批量重装。

## 首次上线检查

- `MarketplacePublish` 已配置 required reviewers。
- `MARKETPLACE_BASE_URL` 和 `MARKETPLACE_AUTH` 已配置。
- 如需在组织策略下发布 release，配置 `RELEASE_TOKEN`（`contents: write`）。
- `pnpm-workspace.yaml` 中的 catalog 版本可被 GitHub runner 安装；如依赖在私有 registry 中，配置 `NPM_TOKEN`。
