import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

interface UploadResult {
  file: string;
  status: number;
  ok: boolean;
  body: unknown;
}

function getEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }

  return value;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function formatPath(filePath: string): string {
  return path.relative(root, filePath) || filePath;
}

function collectPkgFiles(inputPath: string): string[] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Path does not exist: ${inputPath}`);
  }

  const stat = fs.statSync(inputPath);

  if (stat.isFile()) {
    if (!inputPath.endsWith(".pkg")) {
      throw new Error(`Input file must end with .pkg: ${inputPath}`);
    }

    return [inputPath];
  }

  if (!stat.isDirectory()) {
    throw new Error(
      `Input path must be a directory or .pkg file: ${inputPath}`,
    );
  }

  return fs
    .readdirSync(inputPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".pkg"))
    .map((entry) => path.join(inputPath, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return "";

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function uploadPkg(
  filePath: string,
  uploadUrl: string,
  auth: string,
): Promise<UploadResult> {
  const fileBuffer = await fs.promises.readFile(filePath);
  const formData = new FormData();

  formData.append(
    "file",
    new Blob([fileBuffer], { type: "application/octet-stream" }),
    path.basename(filePath),
  );

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: auth,
    },
    body: formData,
  });

  return {
    file: filePath,
    status: response.status,
    ok: response.ok,
    body: await readResponseBody(response),
  };
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    throw new Error(
      "Usage: pnpm exec tsx scripts/publish-to-marketplace.ts <pkg-directory-or-file>",
    );
  }

  const baseUrl = normalizeBaseUrl(getEnv("MARKETPLACE_BASE_URL"));
  const auth = getEnv("MARKETPLACE_AUTH");
  const uploadUrl = `${baseUrl}/api/admin/pkg/upload`;
  const inputPath = path.resolve(root, input);
  const pkgFiles = collectPkgFiles(inputPath);

  if (pkgFiles.length === 0) {
    throw new Error(`No .pkg files found in: ${inputPath}`);
  }

  console.log(`Upload URL: ${uploadUrl}`);
  console.log(
    `Found ${pkgFiles.length} .pkg file${pkgFiles.length === 1 ? "" : "s"}:`,
  );
  for (const file of pkgFiles) {
    console.log("  -", formatPath(file));
  }

  for (const file of pkgFiles) {
    console.log(`\nUploading ${formatPath(file)}...`);

    const result = await uploadPkg(file, uploadUrl, auth);

    console.log(
      JSON.stringify(
        {
          file: formatPath(result.file),
          status: result.status,
          ok: result.ok,
          body: result.body,
        },
        null,
        2,
      ),
    );

    if (!result.ok) {
      throw new Error(`Upload failed: ${formatPath(file)} (${result.status})`);
    }
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
