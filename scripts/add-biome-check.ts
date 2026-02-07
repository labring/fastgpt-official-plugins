import fs from "node:fs";
import path from "node:path";

function main() {
  const root = process.cwd();
  const packagesDir = path.join(root, "packages");

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

  let addedCount = 0;
  let skippedCount = 0;

  for (const pkg of packages) {
    const packageJsonPath = path.join(packagesDir, pkg, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      console.log(`⚠ Skipped ${pkg} (no package.json found)`);
      continue;
    }

    try {
      const content = fs.readFileSync(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);

      // Add biome-check script if it doesn't exist
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      if (!packageJson.scripts["biome-check"]) {
        packageJson.scripts["biome-check"] = "biome check . --write";

        // Write back with proper formatting
        fs.writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2) + "\n"
        );
        console.log(`✓ Added biome-check to ${pkg}`);
        addedCount++;
      } else {
        console.log(`- Skipped ${pkg} (already has biome-check)`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${pkg}:`, error);
    }
  }

  console.log(
    `\nDone! Added: ${addedCount}, Skipped: ${skippedCount}, Total: ${packages.length}`
  );
}

main();
