import { z } from "zod";
import { createGristClient, handleGristError } from "../../../client";

type UploadResult = {
  accessUrl?: string;
  accessURL?: string;
  fileName?: string;
  contentType?: string;
  [key: string]: unknown;
};

type UploadContext = {
  invoke?: {
    uploadFile(input: {
      file: Uint8Array;
      fileName: string;
      contentType: string;
    }): Promise<[UploadResult | null, unknown]>;
  };
};

const exportFormatSchema = z.enum(["grist", "xlsx", "csv", "tsv", "dsv"]);
type ExportFormat = z.infer<typeof exportFormatSchema>;

export const InputType = z.object({
  gristApiKey: z.string().min(1, "Grist API key is required"),
  gristBaseUrl: z.string().optional().nullable(),
  docId: z.string().min(1, "docId is required"),
  format: exportFormatSchema.optional().default("grist"),
  tableId: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  nohistory: z.boolean().optional().nullable(),
  template: z.boolean().optional().nullable(),
  header: z.enum(["colId", "label"]).optional().nullable(),
});

export const OutputType = z.object({
  fileUrl: z.string(),
  fileName: z.string(),
  contentType: z.string(),
  raw: z.any(),
  success: z.boolean(),
});

function getUploadErrorMessage(error: unknown): string {
  if (!error) return "Failed to upload file";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "reason" in error) {
    const reason = (error as { reason?: { "zh-CN"?: string; en?: string } })
      .reason;
    return reason?.["zh-CN"] ?? reason?.en ?? "Failed to upload file";
  }
  return "Failed to upload file";
}

async function uploadOutputFile(
  file: Uint8Array,
  fileName: string,
  contentType: string,
  ctx?: UploadContext,
): Promise<UploadResult & { accessUrl: string; accessURL: string }> {
  if (ctx?.invoke?.uploadFile) {
    const [result, error] = await ctx.invoke.uploadFile({
      file,
      fileName,
      contentType,
    });

    if (error || !result) {
      throw new Error(getUploadErrorMessage(error));
    }

    const accessUrl = result.accessUrl ?? result.accessURL;
    if (!accessUrl) {
      throw new Error("Uploaded file result does not include accessUrl");
    }

    return { ...result, accessUrl, accessURL: accessUrl };
  }

  const base64 = encodeBase64(file);
  const accessUrl = `data:${contentType};base64,${base64}`;
  return { accessUrl, accessURL: accessUrl, fileName, contentType };
}

function encodeBase64(file: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < file.length; index += 0x8000) {
    binary += String.fromCharCode(...file.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function normalizeFileName(
  docId: string,
  format: ExportFormat,
  fileName?: string | null,
): string {
  const trimmed = fileName?.trim();
  if (trimmed) {
    const normalized = trimmed.replace(/[\\/]/g, "_");
    return normalized.toLowerCase().endsWith(`.${format}`)
      ? normalized
      : `${normalized}.${format}`;
  }

  return `${docId}.${format}`;
}

function buildDownloadPath(
  docId: string,
  format: ExportFormat,
  tableId?: string | null,
): string {
  const encodedDocId = encodeURIComponent(docId);

  if (format === "grist") {
    return `/api/docs/${encodedDocId}/download`;
  }

  if (format === "xlsx") {
    return `/api/docs/${encodedDocId}/download/xlsx`;
  }

  const trimmedTableId = tableId?.trim();
  if (!trimmedTableId) {
    throw new Error(`tableId is required when exporting ${format}`);
  }

  return `/api/docs/${encodedDocId}/download/${format}`;
}

export async function tool(
  {
    gristApiKey,
    gristBaseUrl,
    docId,
    format = "grist",
    tableId,
    fileName,
    nohistory,
    template,
    header,
  }: z.infer<typeof InputType>,
  ctx?: UploadContext,
): Promise<z.infer<typeof OutputType>> {
  try {
    const client = createGristClient(gristApiKey, gristBaseUrl);
    const outputFormat = format ?? "grist";
    const response = await client.get<ArrayBuffer>(
      buildDownloadPath(docId, outputFormat, tableId),
      {
        params: {
          tableId:
            outputFormat === "xlsx" ||
            outputFormat === "csv" ||
            outputFormat === "tsv" ||
            outputFormat === "dsv"
              ? tableId?.trim() || undefined
              : undefined,
          header:
            outputFormat === "xlsx" ||
            outputFormat === "csv" ||
            outputFormat === "tsv" ||
            outputFormat === "dsv"
              ? header || undefined
              : undefined,
          nohistory:
            outputFormat === "grist" ? nohistory || undefined : undefined,
          template:
            outputFormat === "grist" ? template || undefined : undefined,
        },
        responseType: "arraybuffer",
      },
    );
    const outputFileName = normalizeFileName(docId, outputFormat, fileName);
    const contentType =
      response.headers["content-type"] || "application/octet-stream";
    const uploaded = await uploadOutputFile(
      new Uint8Array(response.data),
      outputFileName,
      contentType,
      ctx,
    );

    return {
      fileUrl: uploaded.accessUrl,
      fileName: uploaded.fileName || outputFileName,
      contentType: uploaded.contentType || contentType,
      raw: uploaded,
      success: true,
    };
  } catch (error) {
    return Promise.reject(handleGristError(error));
  }
}
