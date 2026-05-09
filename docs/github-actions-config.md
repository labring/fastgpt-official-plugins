# GitHub Actions 配置说明

本文档说明当前仓库四个 workflow 需要的 GitHub 侧配置。

## Workflow

- `Build Production Image`：push 到 `main` 时构建并推送 build server 生产镜像。
- `Build Preview Image`：PR 时构建 preview image；来自 fork 的 PR 只构建，不推送镜像。
- `Extract Updated Tools`：`packages/**` 变化合入 `main` 后，提取发生变化的 `packages/tools/<tool>` 列表，并触发 marketplace 发布 workflow。
- `Publish Tools to Marketplace`：接收工具列表，等待人工 approval，通过后 build、pack 并调用 `pnpm run upload -- packages/tools/<tool>` 发布到 marketplace。

## Environments

在 GitHub 仓库中进入 `Settings` -> `Environments`，创建以下 environments。

### `ProductionBuild`

用于生产 build server image 构建。当前 workflow 没有从该 environment 读取 secret，可按团队策略决定是否配置 required reviewers。

### `PreviewBuild`

用于 PR preview image 构建。当前 workflow 没有从该 environment 读取 secret，可按团队策略决定是否配置 required reviewers。

### `MarketplacePublish`

用于 marketplace 发布审批。必须开启 `Required reviewers`，只有 reviewer 点击 approve 后，`Publish Tools to Marketplace` 中的发布 job 才会继续执行。

建议配置：

- `Required reviewers`：选择负责 marketplace 发布的成员或团队。
- `Deployment branches`：限制为 `main`。

## Repository Variables

在 `Settings` -> `Secrets and variables` -> `Actions` -> `Variables` 配置。

| Name | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `IMAGE_REGISTRY` | 否 | `ghcr.io` | 镜像仓库地址。 |
| `BUILD_SERVER_IMAGE` | 否 | `<owner>/<repo>/build-server` | build server image 名称，不包含 registry。 |
| `IMAGE_PLATFORMS` | 否 | `linux/amd64` | Docker buildx 平台，例如 `linux/amd64,linux/arm64`。 |

`Dockerfile` 路径已固定为仓库根目录的 `Dockerfile`，无需配置 `BUILD_SERVER_DOCKERFILE`。

## Repository Secrets

在 `Settings` -> `Secrets and variables` -> `Actions` -> `Secrets` 配置。

| Name | 必填 | 用途 |
| --- | --- | --- |
| `MARKETPLACE_BASE_URL` | 是 | marketplace 服务地址，例如 `https://marketplace.example.com`。 |
| `MARKETPLACE_AUTH` | 是 | 调用 `/api/admin/pkg/upload` 的 `Authorization` header。 |
| `NPM_TOKEN` | 私有 npm 包或未公开版本时必填 | 安装 `@fastgpt-plugin/*` 等依赖时写入 `~/.npmrc`。 |
| `REGISTRY_USERNAME` | 使用自定义 registry 时必填 | 登录自定义镜像仓库。 |
| `REGISTRY_PASSWORD` | 使用自定义 registry 时必填 | 登录自定义镜像仓库。 |

使用默认 `ghcr.io` 时，workflow 使用 GitHub 自动注入的 `GITHUB_TOKEN` 推送镜像，无需额外 registry secret。

## Actions 权限

进入 `Settings` -> `Actions` -> `General`：

- `Workflow permissions` 需要允许 workflow 获取 `contents: read`。
- `Extract Updated Tools` 需要 `actions: write` 来触发 `Publish Tools to Marketplace`。
- 镜像构建 workflow 需要 `packages: write` 来推送 GHCR 镜像。

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

## 镜像发布规则

生产镜像 tags：

- `latest`
- `main`
- `prod-<sha>`

Preview 镜像 tags：

- `pr-<number>`
- `preview-<sha>`

默认镜像地址为：

```text
ghcr.io/<owner>/<repo>/build-server
```

## 首次上线检查

- 仓库根目录存在 `Dockerfile`。
- `MarketplacePublish` 已配置 required reviewers。
- `MARKETPLACE_BASE_URL` 和 `MARKETPLACE_AUTH` 已配置。
- `pnpm-workspace.yaml` 中的 catalog 版本可被 GitHub runner 安装；如依赖在私有 registry 中，配置 `NPM_TOKEN`。
- 使用 GHCR 时，确认仓库 Actions 有 `packages: write` 权限。
- 使用自定义 registry 时，确认 `IMAGE_REGISTRY`、`BUILD_SERVER_IMAGE`、`REGISTRY_USERNAME`、`REGISTRY_PASSWORD` 已配置。
