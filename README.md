<div align="center">
<a href="https://tryfastgpt.ai/"><img src="https://github.com/labring/FastGPT/raw/main/.github/imgs/logo.svg" width="120" height="120" alt="fastgpt logo"></a>

# FastGPT Official Plugins

<p align="center">
  <a href="./README_zh_CN.md">简体中文</a> |
  <a href="./README.md">English</a>
</p>

[FastGPT](https://github.com/labring/FastGPT) official plugins repository, maintaining tool plugins that can be published directly to FastGPT Marketplace.

This repository is the official tool collection for the FastGPT plugin ecosystem, covering search, web crawling, document parsing, image generation, databases, collaboration platforms, message notifications, data transformation, and more.
</div>

## Repository Scope

- Provide officially maintained FastGPT tool plugin implementations.
- Serve as the development, testing, packaging, and publishing entry point for new official plugins.
- Reuse plugin specifications from `@fastgpt-plugin/cli` and `@fastgpt-plugin/sdk-factory`.
- Build `.pkg` artifacts and publish them to Marketplace through GitHub Actions.

## Directory Structure

```text
.
├── docs/                         # Publishing and repository operations docs
├── packages/
│   ├── tools/                    # Official production plugins
│   └── test/tools/               # Test and validation plugins
├── scripts/                      # Cleanup, change extraction, and Marketplace upload scripts
├── package.json                  # Root scripts and toolchain versions
├── pnpm-workspace.yaml           # Workspace and catalog dependency versions
└── turbo.json                    # Monorepo task orchestration
```

Each official plugin usually lives in `packages/tools/<tool-name>` and includes:

- `package.json`: package name, scripts, and dependencies.
- `index.ts`: plugin entry point.
- `src/` or `children/`: implementation files. Tool-suite plugins contain multiple child tools.
- `README.md`: plugin usage, parameters, credential setup, and use cases.
- `test/`: Vitest test cases.
- `logo.svg`: Marketplace display icon.

## Requirements

- Node.js `>=22`
- pnpm `>=10`
- Recommended pinned version: `pnpm@10.28.2`

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
pnpm install
```

## Common Commands

```bash
# Build all plugins
pnpm build

# Pack all plugins as .pkg artifacts
pnpm pack

# Type check
pnpm type-check

# Biome check
pnpm biome-check

# Build and collect the full release package
pnpm build:full-package
```

Run commands for a single plugin with workspace filters:

```bash
pnpm --filter "./packages/tools/<tool-name>" test
pnpm --filter "./packages/tools/<tool-name>" run build
pnpm --filter "./packages/tools/<tool-name>" run pack
```

## Create a Plugin

Create an official tool plugin under `packages/tools`:

```bash
pnpm fastgpt-plugin create <tool-name> --type tool --cwd packages/tools --description "<description>"
```

Create a tool-suite plugin:

```bash
pnpm fastgpt-plugin create <tool-name> --type tool-suite --cwd packages/tools --description "<description>"
```

Before implementing a new plugin, inspect nearby examples:

- Search and web content: `packages/tools/tavily`, `packages/tools/searchApi`, `packages/tools/fetchUrl`
- Document parsing and transformation: `packages/tools/Doc2X`, `packages/tools/markdownTransform`, `packages/tools/mineru`
- Image generation and editing: `packages/tools/gptImage`, `packages/tools/aliModelStudio`, `packages/tools/blackForestLab`
- Databases, storage, and remote connections: `packages/tools/dbops`, `packages/tools/databaseConnection`, `packages/tools/redis`, `packages/tools/sshConnection`
- Collaboration and notifications: `packages/tools/feishuBitable`, `packages/tools/wechatOfficialAccount`, `packages/tools/WeWorkWebhook`

When creating or updating plugins, keep these conventions:

- Use TypeScript ESM.
- Reuse `@fastgpt-plugin/sdk-factory` for entries and schemas.
- Use `fastgpt-tools-<tool-name>` as the package name.
- Declare external credentials as plugin secrets or input parameters, and keep them out of source code.
- Reuse local helper functions from nearby plugins for network requests, file uploads, and error handling.
- Add tests for the main success path and important error paths.

## Verify a Single Plugin

Run these checks from the plugin directory or with `--filter`:

```bash
pnpm --filter "./packages/tools/<tool-name>" test
pnpm --filter "./packages/tools/<tool-name>" run build
pnpm --filter "./packages/tools/<tool-name>" run pack
npx @fastgpt-plugin/cli check --entry packages/tools/<tool-name> --output packages/tools/<tool-name>/dist
```

For changes that affect shared configuration, dependencies, or scripts, run root-level checks:

```bash
pnpm type-check
pnpm biome-check
```

## Marketplace Publishing

The repository includes three publishing workflows:

- `Extract Updated Tools`: extracts changed `packages/tools/<tool>` directories after `packages/**` changes land on `main`.
- `Publish Tools to Marketplace`: builds, packs, and uploads selected tools after manual approval.
- `Publish All Tools to Marketplace`: manually triggers full build, pack, and publishing.

GitHub Actions requires the `MarketplacePublish` environment and secrets such as `MARKETPLACE_BASE_URL` and `MARKETPLACE_AUTH`. See [docs/github-actions-config.md](./docs/github-actions-config.md) for details.

## Related Repositories

- [FastGPT](https://github.com/labring/FastGPT): the main FastGPT repository.
- [fastgpt-plugin](https://github.com/labring/fastgpt-plugin): FastGPT plugin system, CLI, and SDK infrastructure.
- [fastgpt-community-plugins](https://github.com/labring/fastgpt-community-plugins): community plugin ecosystem repository.

## License

[Apache-2.0](./LICENSE)
