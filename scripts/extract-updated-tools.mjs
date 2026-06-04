import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsRootParts = ["packages", "tools"];

function runGit(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function getChangedFiles(baseSha, headSha) {
  const output = runGit([
    "diff",
    "--name-only",
    baseSha,
    headSha,
    "--",
    "packages",
  ]);

  return output
    .split(/\r?\n/)
    .map((filePath) => filePath.trim())
    .filter(Boolean);
}

function collectUpdatedTools(changedFiles) {
  const updatedTools = new Set();

  for (const filePath of changedFiles) {
    const parts = filePath.split("/");
    const isToolPath =
      parts[0] === toolsRootParts[0] &&
      parts[1] === toolsRootParts[1] &&
      Boolean(parts[2]);

    if (!isToolPath) continue;

    const toolName = parts[2];
    const packageJsonPath = path.join(
      root,
      toolsRootParts[0],
      toolsRootParts[1],
      toolName,
      "package.json",
    );

    if (fs.existsSync(packageJsonPath)) {
      updatedTools.add(toolName);
    }
  }

  return [...updatedTools].sort((a, b) => a.localeCompare(b));
}

function appendOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;

  fs.appendFileSync(outputPath, `${name}=${value}\n`);
}

function appendSummary(tools, baseSha, headSha) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const lines = [
    "## Updated tools",
    "",
    `Diff range: \`${baseSha}..${headSha}\``,
    "",
    tools.length === 0
      ? "No updated tools were detected under `packages/tools`."
      : tools.map((tool) => `- ${tool}`).join("\n"),
    "",
  ];

  fs.appendFileSync(summaryPath, lines.join("\n"));
}

function main() {
  const [baseSha, headSha = "HEAD"] = process.argv.slice(2);

  if (!baseSha) {
    throw new Error(
      "Usage: node scripts/extract-updated-tools.mjs <base-sha> [head-sha]",
    );
  }

  const changedFiles = getChangedFiles(baseSha, headSha);
  const updatedTools = collectUpdatedTools(changedFiles);
  const toolsJson = JSON.stringify(updatedTools);

  fs.writeFileSync(path.join(root, "updated-tools.json"), `${toolsJson}\n`);
  appendOutput("has_changes", String(updatedTools.length > 0));
  appendOutput("tools", toolsJson);
  appendSummary(updatedTools, baseSha, headSha);

  console.log(`Diff range: ${baseSha}..${headSha}`);
  console.log(`Changed files: ${changedFiles.length}`);
  console.log(`Updated tools: ${toolsJson}`);
}

main();
