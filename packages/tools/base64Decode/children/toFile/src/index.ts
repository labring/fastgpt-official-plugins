import type { ToolHandlerContext } from "@fastgpt-plugin/sdk-factory";
import { z } from "zod";

type UploadContext = Pick<ToolHandlerContext<any>, "invoke">;
type UploadFileInput = Parameters<UploadContext["invoke"]["uploadFile"]>[0];

/**
 * Detect image MIME type from base64 binary data by checking file signatures
 * Supports pdf, docx, xlsx, pptx, zip, wav, avi formats
 */
function detectFileType(base64Data: string) {
  try {
    // Remove data URL prefix if exists and decode base64
    const base64Content = base64Data.replace(/^data:[^;]+;base64,/, "");
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // PDF: 25 50 44 46
    if (
      bytes.length >= 4 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return "application/pdf";
    }

    // zip: 50 4B 03 04
    // .docx, .xlsx, .pptx are special zip files
    if (
      bytes.length >= 4 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      bytes[2] === 0x03 &&
      bytes[3] === 0x4
    ) {
      // detect specific file paths inside the ZIP to identify the specific Office type
      // check the first 10000 bytes to see if it contains specific file paths
      const text = binaryString.substring(0, 10000);

      if (text.includes("word/")) {
        return "application/docx";
      } else if (text.includes("xl/")) {
        return "application/xlsx";
      } else if (text.includes("ppt/")) {
        return "application/pptx";
      } else {
        return "application/zip";
      }
    }

    // csv: check if it contains comma separated structure
    if (/^[^\n]*,[^\n]*$/.test(binaryString.substring(0, 1000))) {
      return "text/csv";
    }

    // html: check if it includes <html> or <!doctype html>
    if (
      binaryString.substring(0, 100).toLowerCase().includes("<html") ||
      binaryString.substring(0, 100).toLowerCase().includes("<!doctype html")
    ) {
      return "text/html";
    }

    // txt: check if it is pure ASCII text
    if (/^[\x20-\x7E\s]*$/.test(binaryString.substring(0, 1000))) {
      return "text/txt";
    }

    return null;
  } catch {
    return null;
  }
}

function toBuffer(base64Data: string) {
  const match = base64Data.match(/^data:[^;]+;base64,(.+)$/);
  return Buffer.from(match?.[1] ?? base64Data, "base64");
}

function getUploadErrorMessage(error: unknown) {
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

function toUploadContentType(mime: string): UploadFileInput["contentType"] {
  if (mime === "application/pdf") return "application/pdf";
  if (mime === "application/zip") return "application/zip";
  if (mime === "text/csv") return "text/csv";
  if (mime === "text/html") return "text/html";
  if (mime === "text/txt") return "text/plain";
  if (mime === "application/docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (mime === "application/xlsx")
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (mime === "application/pptx")
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
}

export const InputType = z.object({
  base64: z.string().nonempty(),
});

export const OutputType = z.object({
  url: z.string(),
});

export async function tool(
  {
    base64,
  }: z.infer<typeof InputType>,
  ctx: UploadContext
): Promise<z.infer<typeof OutputType>> {
  const mime = (() => {
    const match = base64.match(/^data:([^;]+);base64,/);
    if (match?.[1]) {
      return match[1];
    }
    const detectedType = detectFileType(base64);

    if (!detectedType) {
      throw new Error(
        "File Type unknown, current supported file types: pdf, docx, xlsx, pptx, zip, csv, html, txt",
      );
    }
    return detectedType;
  })();

  const ext = (() => {
    const m = mime.split("/")[1];
    // octet-stream: unknown binary data
    return m && m.length > 0 ? m : "octet-stream";
  })();

  const filename = `file.${ext}`;

  const uploadInput: UploadFileInput = {
    file: toBuffer(base64),
    fileName: filename,
    contentType: toUploadContentType(mime),
  };
  const [meta, error] = await ctx.invoke.uploadFile(uploadInput);

  if (error || !meta) {
    throw new Error(getUploadErrorMessage(error));
  }

  return {
    url: meta.accessURL,
  };
}
