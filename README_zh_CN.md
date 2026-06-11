<div align="center">
<a href="https://tryfastgpt.ai/"><img src="https://github.com/labring/FastGPT/raw/main/.github/imgs/logo.svg" width="120" height="120" alt="fastgpt logo"></a>

# FastGPT Official Plugins

<p align="center">
  <a href="./README_zh_CN.md">简体中文</a> |
  <a href="./README.md">English</a>
</p>

[FastGPT](https://github.com/labring/FastGPT) 官方插件仓库，集中维护可直接发布到 FastGPT Marketplace 的工具插件。

本仓库面向 FastGPT 插件生态的官方工具集合，包含搜索、网页抓取、文档解析、图片生成、数据库、协作平台、消息通知、数据转换等插件。
</div>

## 仓库定位

- 提供 FastGPT 官方维护的工具插件实现。
- 作为新增官方插件的开发、测试、打包和发布入口。
- 复用 `@fastgpt-plugin/cli` 和 `@fastgpt-plugin/sdk-factory` 的插件规范。
- 通过 GitHub Actions 构建 `.pkg` 产物并发布到 Marketplace。

## 目录结构

```text
.
├── docs/                         # 发布和仓库运维文档
├── packages/
│   ├── tools/                    # 正式官方插件
│   └── test/tools/               # 测试和验证插件
├── scripts/                      # 清理、提取变更、Marketplace 上传脚本
├── package.json                  # 根工程脚本和工具链版本
├── pnpm-workspace.yaml           # workspace 与 catalog 依赖版本
└── turbo.json                    # monorepo 任务编排
```

每个正式插件通常位于 `packages/tools/<tool-name>`，并包含：

- `package.json`：插件包名、脚本和依赖。
- `index.ts`：插件入口。
- `src/` 或 `children/`：具体实现，工具集插件会包含多个子工具。
- `README.md`：插件说明、参数、密钥获取和使用场景。
- `test/`：Vitest 测试用例。
- `logo.svg`：Marketplace 展示图标。

## 环境要求

- Node.js `>=22`
- pnpm `>=10`
- 推荐使用仓库固定版本 `pnpm@10.28.2`

```bash
corepack enable
corepack prepare pnpm@10.28.2 --activate
pnpm install
```

## 常用命令

```bash
# 构建所有插件
pnpm build

# 打包所有插件为 .pkg
pnpm pack

# 类型检查
pnpm type-check

# Biome 检查
pnpm biome-check

# 构建并汇总完整发布包
pnpm build:full-package
```

单个插件可以通过 workspace filter 执行：

```bash
pnpm --filter "./packages/tools/<tool-name>" test
pnpm --filter "./packages/tools/<tool-name>" run build
pnpm --filter "./packages/tools/<tool-name>" run pack
```

## 新增插件

默认在 `packages/tools` 下创建官方工具插件：

```bash
pnpm fastgpt-plugin create <tool-name> --type tool --cwd packages/tools --description "<description>"
```

工具集插件使用：

```bash
pnpm fastgpt-plugin create <tool-name> --type tool-suite --cwd packages/tools --description "<description>"
```

实现前建议先参考相近插件：

- 搜索和网页内容：`packages/tools/tavily`、`packages/tools/searchApi`、`packages/tools/fetchUrl`
- 文档解析和转换：`packages/tools/Doc2X`、`packages/tools/markdownTransform`、`packages/tools/mineru`
- 图片生成和编辑：`packages/tools/gptImage`、`packages/tools/aliModelStudio`、`packages/tools/blackForestLab`
- 数据库和存储：`packages/tools/dbops`、`packages/tools/databaseConnection`、`packages/tools/redis`
- 协作和通知：`packages/tools/feishuBitable`、`packages/tools/wechatOfficialAccount`、`packages/tools/WeWorkWebhook`

新增或修改插件时，优先保持以下约定：

- 使用 TypeScript ESM。
- 入口和 schema 复用 `@fastgpt-plugin/sdk-factory`。
- 插件包名使用 `fastgpt-tools-<tool-name>`。
- 外部密钥通过插件 secret 或输入参数声明，避免写入源码。
- 网络请求、文件上传、错误处理复用相近插件的本地工具函数。
- 为主要成功路径和关键错误路径补充测试。

## 验证单个插件

在插件目录或通过 `--filter` 执行以下检查：

```bash
pnpm --filter "./packages/tools/<tool-name>" test
pnpm --filter "./packages/tools/<tool-name>" run build
pnpm --filter "./packages/tools/<tool-name>" run pack
npx @fastgpt-plugin/cli check --entry packages/tools/<tool-name> --output packages/tools/<tool-name>/dist
```

涉及共享配置、依赖或脚本时，再运行根目录检查：

```bash
pnpm type-check
pnpm biome-check
```

## Marketplace 发布

仓库包含三类发布相关 workflow：

- `Extract Updated Tools`：`main` 分支合入 `packages/**` 变更后，提取变化的 `packages/tools/<tool>` 列表。
- `Publish Tools to Marketplace`：对指定工具 build、pack，并在人工审批后上传。
- `Publish All Tools to Marketplace`：手动触发全量 build、pack 和发布。

GitHub Actions 需要配置 `MarketplacePublish` environment，以及 `MARKETPLACE_BASE_URL`、`MARKETPLACE_AUTH` 等密钥。详细配置见 [docs/github-actions-config.md](./docs/github-actions-config.md)。

## 相关仓库

- [FastGPT](https://github.com/labring/FastGPT)：FastGPT 主仓库。
- [fastgpt-plugin](https://github.com/labring/fastgpt-plugin)：FastGPT 插件系统、CLI 和 SDK 基础设施。
- [fastgpt-community-plugins](https://github.com/labring/fastgpt-community-plugins)：社区插件生态仓库。

## License

[Apache-2.0](./LICENSE)
