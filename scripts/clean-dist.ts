import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packagesDir = path.join(root, "packages");

interface CleanStats {
  distDirs: string[];
  pkgFiles: string[];
}

function cleanPackage(packageDir: string): CleanStats {
  const stats: CleanStats = {
    distDirs: [],
    pkgFiles: [],
  };

  if (!fs.existsSync(packageDir)) return stats;

  const entries = fs.readdirSync(packageDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(packageDir, entry.name);

    if (entry.isDirectory() && entry.name === "dist") {
      stats.distDirs.push(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".pkg")) {
      stats.pkgFiles.push(fullPath);
    }
  }

  return stats;
}

function main() {
  if (!fs.existsSync(packagesDir)) {
    console.log("No packages directory found.");
    return;
  }

  const packages = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  if (packages.length === 0) {
    console.log("No packages found.");
    return;
  }

  const allStats: CleanStats = {
    distDirs: [],
    pkgFiles: [],
  };

  // 收集所有需要清理的文件和目录
  for (const pkg of packages) {
    const packagePath = path.join(packagesDir, pkg);
    const stats = cleanPackage(packagePath);
    allStats.distDirs.push(...stats.distDirs);
    allStats.pkgFiles.push(...stats.pkgFiles);
  }

  const totalItems = allStats.distDirs.length + allStats.pkgFiles.length;

  if (totalItems === 0) {
    console.log("No build artifacts found to clean.");
    return;
  }

  console.log(
    `Found ${totalItems} item${totalItems === 1 ? "" : "s"} to clean:`,
  );

  if (allStats.distDirs.length > 0) {
    console.log(
      `\n  ${allStats.distDirs.length} dist director${allStats.distDirs.length === 1 ? "y" : "ies"}:`,
    );
    for (const dir of allStats.distDirs) {
      console.log("    -", path.relative(root, dir));
    }
  }

  if (allStats.pkgFiles.length > 0) {
    console.log(
      `\n  ${allStats.pkgFiles.length} .pkg file${allStats.pkgFiles.length === 1 ? "" : "s"}:`,
    );
    for (const file of allStats.pkgFiles) {
      console.log("    -", path.relative(root, file));
    }
  }

  console.log("\nCleaning...");

  // 删除 dist 目录
  for (const dir of allStats.distDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("Removed:", path.relative(root, dir));
  }

  // 删除 .pkg 文件
  for (const file of allStats.pkgFiles) {
    fs.rmSync(file, { force: true });
    console.log("Removed:", path.relative(root, file));
  }

  console.log("\nDone.");
}

main();
