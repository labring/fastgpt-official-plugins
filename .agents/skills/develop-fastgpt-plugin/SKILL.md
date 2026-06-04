---
name: develop-fastgpt-plugin
description: 指导 Codex 开发新的 FastGPT 官方插件。Use when the user asks to create, scaffold, implement, test, build, check, or package a new FastGPT plugin/tool/tool-suite in this repository, especially under packages/tools, and when Codex should collect plugin requirements, call @fastgpt-plugin/cli skills/tools to create a template, then complete implementation and verification.
---

# Develop FastGPT Plugin

Use this skill to turn a user's plugin idea into a working FastGPT plugin in this repo.

## Workflow

1. Collect just enough requirements:
   - plugin name and target directory
   - plugin type: `tool` or `tool-suite`
   - Chinese and English name/description
   - inputs, outputs, secrets, and external APIs
   - expected behavior, errors, and 1-3 test examples

2. If core requirements are missing, ask at most three focused questions. If defaults are obvious, proceed and state the assumptions.

3. Read the CLI skill before scaffolding:

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
   pnpm fastgpt-plugin check --entry . --output ./dist
   pnpm pack
   ```

   If package scripts differ, read `package.json` and use the local scripts. For repo-wide confidence after a shared change, run root-level `pnpm type-check` or `pnpm biome-check`.

## Development Notes

- Default location is `packages/tools/<plugin-name>` unless the user specifies another path.
- Use `pnpm` in this repo; Node.js must satisfy the root `package.json` engines.
- Reuse utilities already present in nearby plugins before adding dependencies.
- Keep generated `dist/` and `.pkg` behavior consistent with existing plugins.
- If CLI creation fails because dependencies are missing or network access is needed, request approval for the install/fetch step and keep the partially generated files intact for diagnosis.
- Before final delivery, report changed files, validation commands, remaining assumptions, and any unverified external API behavior.
