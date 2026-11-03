import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const toolsRoot = path.join(root, "packages", "tools");
const defaultOutput = path.join("dist", "fastgpt-official-plugins.zip");

function resolveOutputPath(): string {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const flagIndex = args.indexOf("--out");

  if (flagIndex === -1) {
    return path.resolve(root, defaultOutput);
  }

  const value = args[flagIndex + 1];

  if (!value) {
    throw new Error("--out requires a path value.");
  }

  return path.resolve(root, value);
}

function listOfficialTools(): string[] {
  if (!fs.existsSync(toolsRoot)) {
    throw new Error("packages/tools does not exist.");
  }

  return fs
    .readdirSync(toolsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((tool) => fs.existsSync(path.join(toolsRoot, tool, "package.json")))
    .sort((a, b) => a.localeCompare(b));
}

function collectToolPkgFiles(tool: string): string[] {
  const toolDir = path.join(toolsRoot, tool);

  return fs
    .readdirSync(toolDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".pkg"))
    .map((entry) => path.join(toolDir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function main(): void {
  const outputPath = resolveOutputPath();
  const tools = listOfficialTools();

  if (tools.length === 0) {
    throw new Error("No tools found under packages/tools.");
  }

  const pkgFiles: string[] = [];
  const missingPkgTools: string[] = [];

  for (const tool of tools) {
    const toolPkgFiles = collectToolPkgFiles(tool);

    if (toolPkgFiles.length === 0) {
      missingPkgTools.push(tool);
      continue;
    }

    pkgFiles.push(...toolPkgFiles);
  }

  if (missingPkgTools.length > 0) {
    throw new Error(
      `Missing .pkg for ${missingPkgTools.length} tool(s): ${missingPkgTools.join(", ")}. Run \`pnpm run pack:tools\` first.`,
    );
  }

  const zipProbe = spawnSync("zip", ["-v"], { stdio: "ignore" });

  if (zipProbe.error || zipProbe.status !== 0) {
    throw new Error("`zip` CLI is required but was not found in PATH.");
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.rmSync(outputPath, { force: true });

  const zipResult = spawnSync(
    "zip",
    ["-j", "-X", "-q", outputPath, ...pkgFiles],
    {
      stdio: "inherit",
    },
  );

  if (zipResult.status !== 0) {
    throw new Error(`zip exited with code ${String(zipResult.status)}.`);
  }

  const zipBuffer = fs.readFileSync(outputPath);
  const lines = [
    `output=${path.relative(root, outputPath)}`,
    `tools=${tools.length}`,
    `pkgs=${pkgFiles.length}`,
    `bytes=${zipBuffer.byteLength}`,
    `sha256=${createHash("sha256").update(zipBuffer).digest("hex")}`,
  ];

  console.log(lines.join("\n"));

  const githubOutput = process.env.GITHUB_OUTPUT;

  if (githubOutput) {
    fs.appendFileSync(githubOutput, `${lines.join("\n")}\n`);
  }
}

main();
