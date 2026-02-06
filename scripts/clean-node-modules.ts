import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function findNodeModulesDirs(dir: string, found: string[] = []): string[] {
  if (!fs.existsSync(dir)) return found;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") {
        found.push(fullPath);
      } else {
        // 不进入 node_modules 内部遍历，避免无意义扫描
        findNodeModulesDirs(fullPath, found);
      }
    }
  }

  return found;
}

function main() {
  const dirs = findNodeModulesDirs(root);

  if (dirs.length === 0) {
    console.log("No node_modules directories found.");
    return;
  }

  console.log(
    `Found ${dirs.length} node_modules director${dirs.length === 1 ? "y" : "ies"}:`,
  );
  for (const d of dirs) {
    console.log("  -", path.relative(root, d));
  }

  for (const dir of dirs) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("Removed:", path.relative(root, dir));
  }

  console.log("Done.");
}

main();
