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

3. Fork and clone the official repository with `gh`:

   ```bash
   gh repo fork labring/fastgpt-official-plugins --clone
   cd fastgpt-official-plugins
   git remote -v
   git remote get-url upstream || git remote add upstream https://github.com/labring/fastgpt-official-plugins.git
   git remote set-url upstream https://github.com/labring/fastgpt-official-plugins.git
   git fetch upstream
   ```

   If the repo is already cloned, make sure remotes are useful:

   ```bash
   git remote -v
   git remote set-url upstream https://github.com/labring/fastgpt-official-plugins.git
   git fetch upstream
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

5. Inspect generated files before editing. Match existing project patterns from nearby plugins, usually:
   - `package.json`
   - `index.ts`
   - `config.ts`
   - `src/index.ts`
   - `test/`
   - `README.md`
   - `logo.svg`

6. Implement the plugin:
   - keep user-facing labels bilingual when the surrounding template does
   - define `zod` input/output schemas in sync with `config.ts`
   - put runtime behavior in `src/index.ts`
   - keep `index.ts` focused on manifest, schemas, and handler wiring
   - add secrets only for real credentials; never hardcode keys or tokens
   - preserve existing package scripts and monorepo conventions

7. Add tests from the user's examples. Include success cases and the main validation/error case when practical.

8. Verify from the plugin directory:

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
- Prefer branch names like `codex/<plugin-name>` or `feat/<plugin-name>`.
- Reuse utilities already present in nearby plugins before adding dependencies.
- Keep generated `dist/` and `.pkg` behavior consistent with existing plugins.
- If CLI creation fails because dependencies are missing or network access is needed, request approval for the install/fetch step and keep the partially generated files intact for diagnosis.
- Before final delivery, report changed files, validation commands, remaining assumptions, and any unverified external API behavior.
