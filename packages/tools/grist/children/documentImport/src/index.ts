import { z } from "zod";
import { createGristClient, handleGristError } from "../../../client";

export const InputType = z.object({
  gristApiKey: z.string().min(1, "Grist API key is required"),
  gristBaseUrl: z.string().optional().nullable(),
  workspaceId: z.number().int().positive("workspaceId is required"),
  fileUrl: z.string().url("fileUrl must be a valid URL"),
  fileName: z.string().optional().nullable(),
  documentName: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
});

export const OutputType = z.object({
  docId: z.string(),
  raw: z.any(),
  success: z.boolean(),
});

function getFileName(fileUrl: string, fileName?: string | null): string {
  const trimmed = fileName?.trim();
  if (trimmed) {
    return trimmed.replace(/[\\/]/g, "_");
  }

  try {
    const url = new URL(fileUrl);
    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    if (lastSegment) {
      return decodeURIComponent(lastSegment).replace(/[\\/]/g, "_");
    }
  } catch {}

  return "document.grist";
}

async function downloadFile(fileUrl: string): Promise<{
  data: ArrayBuffer;
  contentType: string;
}> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  return {
    data: await response.arrayBuffer(),
    contentType:
      response.headers.get("content-type") || "application/octet-stream",
  };
}

function appendOptionalString(
  form: FormData,
  key: string,
  value?: string | null,
): void {
  const trimmed = value?.trim();
  if (trimmed) {
    form.append(key, trimmed);
  }
}

export async function tool({
  gristApiKey,
  gristBaseUrl,
  workspaceId,
  fileUrl,
  fileName,
  documentName,
  timezone,
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const file = await downloadFile(fileUrl);
    const uploadName = getFileName(fileUrl, fileName);
    const form = new FormData();
    form.append("workspaceId", String(workspaceId));
    appendOptionalString(form, "documentName", documentName);
    appendOptionalString(form, "timezone", timezone);
    form.append(
      "upload",
      new Blob([file.data], { type: file.contentType }),
      uploadName,
    );

    const client = createGristClient(gristApiKey, gristBaseUrl);
    const response = await client.post<
      string | { id?: string; docId?: string }
    >("/api/docs", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const raw = response.data;
    const docId =
      typeof raw === "string"
        ? raw
        : raw.docId || raw.id || JSON.stringify(raw);

    return {
      docId,
      raw,
      success: true,
    };
  } catch (error) {
    return Promise.reject(handleGristError(error));
  }
}
