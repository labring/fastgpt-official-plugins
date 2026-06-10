import { Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import { z } from "zod";
import { uploadFile } from "../utils/uploadFile";
import { applyWorkbookOperations } from "./excel";
import { runWorkbookScript } from "./scriptRunner";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const InputType = z.object({
  file: z.string().min(1),
  script: z.string().min(1).max(50000),
  filename: z.string().optional(),
  timeoutMs: z.number().int().min(100).max(5000).optional().default(1000),
});

export const OutputType = z.object({
  url: z.string(),
});

export async function tool(
  input: z.infer<typeof InputType>,
  ctx?: Parameters<typeof uploadFile>[1],
): Promise<z.infer<typeof OutputType>> {
  const fileBuffer = await downloadExcelFile(input.file);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as unknown as ExcelJS.Buffer);

  const { operations } = runWorkbookScript(input.script, input.timeoutMs);
  await applyWorkbookOperations(workbook, operations);

  const outputBuffer = Buffer.from(
    (await workbook.xlsx.writeBuffer()) as ArrayBuffer,
  );
  const result = await uploadFile(
    {
      buffer: outputBuffer,
      defaultFilename: normalizeOutputFilename(input.filename),
      contentType: XLSX_CONTENT_TYPE,
    },
    ctx,
  );

  if (!result.accessUrl) {
    throw new Error("Failed to upload Excel file");
  }

  return { url: result.accessUrl };
}

async function downloadExcelFile(file: string): Promise<Buffer> {
  if (file.startsWith("data:")) {
    const match = file.match(/^data:[^;]+;base64,(.+)$/);
    if (!match?.[1]) throw new Error("Invalid data URL file input");
    const buffer = Buffer.from(match[1], "base64");
    assertFileSize(buffer.byteLength);
    return buffer;
  }

  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(
      `Failed to download Excel file: ${response.status} ${response.statusText}`,
    );
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > 0) {
    assertFileSize(contentLength);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  assertFileSize(buffer.byteLength);
  return buffer;
}

function assertFileSize(size: number) {
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Excel file is too large. Max size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
    );
  }
}

function normalizeOutputFilename(filename?: string) {
  const baseName = (filename ?? "excel-operation-result")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/^\.+$/, "");
  const safeName = baseName || "excel-operation-result";
  return safeName.toLowerCase().endsWith(".xlsx")
    ? safeName
    : `${safeName}.xlsx`;
}
