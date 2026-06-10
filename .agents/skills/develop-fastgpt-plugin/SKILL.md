---
name: develop-fastgpt-plugin
description: 指导 Codex 或开发者从零准备环境并开发 FastGPT 官方插件。Use when the user asks to set up, fork, clone, install dependencies, create, scaffold, implement, test, build, check, or package a FastGPT plugin/tool/tool-suite in labring/fastgpt-official-plugins, especially under packages/tools, and when an agent may only have this raw SKILL.md text as onboarding context.
---

# Develop FastGPT Plugin

Use this skill to turn a plugin idea into a working FastGPT official plugin. Treat this file as self-contained onboarding text: first make sure the developer has the repository, tools, and dependencies, then scaffold and implement the plugin.

## Bootstrap From Raw Text

Start here whenever the current machine may not already have this repo ready.

1. Check whether you are inside this repository:

   ```bash
   git rev-parse --show-toplevel
   git remote -v
   test -f package.json && node -p "require('./package.json').name"
   ```

   The expected package name is `@fastgpt/official-plugins`. The expected upstream repository is `labring/fastgpt-official-plugins`.

2. Install or verify required tools:

   ```bash
   git --version
   gh --version
   node --version
   corepack --version
   pnpm --version
   ```

   Required versions from the root `package.json`:

   - Node.js `>=22`
   - pnpm `>=10`, preferably the pinned `pnpm@10.28.2`

   If `gh` is missing, guide the developer to install GitHub CLI from the official instructions at `https://github.com/cli/cli#installation`.
   Common installation choices:

   ```bash
   # macOS with Homebrew
   brew install gh

   # Windows with WinGet
   winget install --id GitHub.cli
   ```

   For Linux, follow the official distro-specific instructions in the GitHub CLI README. After installation, run:

   ```bash
   gh auth login
   gh auth status
   ```

3. Fork and clone the official repository with partial clone and sparse checkout.

   Pick the target plugin path first. The default is:

   ```bash
   PLUGIN_DIR=packages/tools/<plugin-name>
   ```

   Then create the fork and clone only the top-level files plus the target tool directory:

   ```bash
   gh repo fork labring/fastgpt-official-plugins --clone --default-branch-only -- --filter=blob:none --sparse
   cd fastgpt-official-plugins
   git remote get-url upstream || git remote add upstream https://github.com/labring/fastgpt-official-plugins.git
   git remote set-url upstream https://github.com/labring/fastgpt-official-plugins.git
   git fetch --filter=blob:none upstream
   git sparse-checkout set --cone --sparse-index --skip-checks "$PLUGIN_DIR"
   mkdir -p packages/tools
   git remote -v
   ```

   `--filter=blob:none` avoids downloading file contents until needed. `sparse-checkout` keeps the working tree focused on root config files and the requested plugin directory. `--skip-checks` allows a brand-new plugin directory that does not exist in the remote tree yet.

   If the repo is already cloned, make sure remotes are useful and narrow the checkout to the current plugin:

   ```bash
   PLUGIN_DIR=packages/tools/<plugin-name>
   git remote -v
   git remote get-url upstream || git remote add upstream https://github.com/labring/fastgpt-official-plugins.git
   git remote set-url upstream https://github.com/labring/fastgpt-official-plugins.git
   git fetch --filter=blob:none upstream
   git sparse-checkout init --cone --sparse-index
   git sparse-checkout set --cone --sparse-index --skip-checks "$PLUGIN_DIR"
   mkdir -p packages/tools
   ```

   To inspect nearby examples without pulling every tool, list tool names from the tree and add only the relevant reference directories:

   ```bash
   git ls-tree -d --name-only HEAD:packages/tools
   git sparse-checkout add --skip-checks packages/tools/<reference-plugin>
   ```

4. Install dependencies:

   ```bash
   corepack enable
   corepack prepare pnpm@10.28.2 --activate
   pnpm install
   ```

   If installation needs network or sandbox approval, request approval for the install/fetch command and continue after it succeeds.

5. Create a working branch:

   ```bash
   git checkout -b codex/<plugin-name>
   ```

## Plugin Workflow

1. Collect just enough requirements:
   - plugin name and target directory
   - plugin type: `tool` or `tool-suite`
   - Chinese and English name/description
   - inputs, outputs, secrets, and external APIs
   - expected behavior, errors, and 1-3 test examples

2. If core requirements are missing, ask at most three focused questions. If defaults are obvious, proceed and state the assumptions.

3. Read the CLI skill before scaffolding when dependencies are installed:

   ```bash
   sed -n '1,240p' node_modules/@fastgpt-plugin/cli/skills/cli-usage/SKILL.md
   ```

   Prefer its documented commands and flags. If behavior is unclear, run:

   ```bash
   pnpm fastgpt-plugin <command> --help
   ```

4. Create the initial skeleton with `@fastgpt-plugin/cli`.

   Default for this repo:

   ```bash
   pnpm fastgpt-plugin create <plugin-name> --type tool --cwd packages/tools --description "<description>"
   ```

   For a tool suite:

   ```bash
   pnpm fastgpt-plugin create <plugin-name> --type tool-suite --cwd packages/tools --description "<description>"
   ```

5. Resolve and read the SDK-shipped development skills from the generated plugin directory. These SDK skills are the source of truth for plugin implementation rules.

   ```bash
   cd packages/tools/<plugin-name>
   SDK_FACTORY_ROOT=$(
     node --input-type=module -e '
       import fs from "node:fs";
       import path from "node:path";
       import { fileURLToPath } from "node:url";

       const pkg = "@fastgpt-plugin/sdk-factory";
       let dir = path.dirname(fileURLToPath(await import.meta.resolve(pkg)));
       while (dir !== path.dirname(dir)) {
         const file = path.join(dir, "package.json");
         if (fs.existsSync(file) && JSON.parse(fs.readFileSync(file, "utf8")).name === pkg) {
           console.log(dir);
           process.exit(0);
         }
         dir = path.dirname(dir);
       }
       throw new Error(`Cannot find package root for ${pkg}`);
     '
   )
   sed -n '1,220p' "$SDK_FACTORY_ROOT/skills/fastgpt-plugin-development/SKILL.md"
   sed -n '1,320p' "$SDK_FACTORY_ROOT/skills/fastgpt-system-tool-development/SKILL.md"
   sed -n '1,320p' "$SDK_FACTORY_ROOT/skills/fastgpt-sdk-factory/SKILL.md"
   cd -
   ```

   If the generated plugin cannot resolve `@fastgpt-plugin/sdk-factory` yet, run `pnpm install` from the repository root to link the new workspace package, then retry this step.

   Use the SDK-shipped skills for `defineTool()`, `defineToolSet()`, `createToolHandler()`, Zod schemas, secrets, host invocation, streaming, required files, avatar naming, and build/check/pack expectations. If this repository skill conflicts with SDK-shipped skills, follow the SDK-shipped skills for implementation details and this skill for repository setup and workflow.

6. Inspect generated files before editing. Match existing project patterns from nearby plugins and the SDK-shipped skills.

   In sparse checkouts, add only 1-3 nearby reference plugins when needed:

   ```bash
   git sparse-checkout add --skip-checks packages/tools/fetchUrl packages/tools/searchApi
   ```

7. Implement the plugin according to the SDK-shipped skills, the generated template, and nearby project patterns. Preserve existing package scripts and monorepo conventions.

8. Add tests from the user's examples. Include success cases and the main validation/error case when practical.

9. Verify from the plugin directory:

   ```bash
   pnpm test
   pnpm build
   npx @fastgpt-plugin/cli check --entry . --output ./dist
   pnpm pack
   ```

   If package scripts differ, read `package.json` and use the local scripts. For repo-wide confidence after a shared change, run root-level `pnpm type-check` or `pnpm biome-check`.

## Development Notes

- Default location is `packages/tools/<plugin-name>` unless the user specifies another path.
- Use `pnpm` in this repo; Node.js and pnpm must satisfy the root `package.json` engines.
- Keep `origin` pointing to the developer's fork and `upstream` pointing to `https://github.com/labring/fastgpt-official-plugins.git`.
- Use partial clone plus sparse checkout for new environments. Keep the sparse set to the target plugin directory and a small number of reference plugins; avoid checking out all `packages/tools/*` unless the task explicitly needs a repo-wide change.
- Prefer branch names like `codex/<plugin-name>` or `feat/<plugin-name>`.
- Treat `@fastgpt-plugin/sdk-factory` package skills as the implementation standard. This repository skill should not duplicate detailed SDK/plugin rules.
- Reuse utilities already present in nearby plugins before adding dependencies.
- Keep generated `dist/` and `.pkg` behavior consistent with existing plugins.
- If CLI creation fails because dependencies are missing or network access is needed, request approval for the install/fetch step and keep the partially generated files intact for diagnosis.
- Before final delivery, report changed files, validation commands, remaining assumptions, and any unverified external API behavior.
