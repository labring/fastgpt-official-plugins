import type { ToolHandlerContext } from "@fastgpt-plugin/sdk-factory";

type UploadInput = {
  url?: string;
  buffer?: Buffer | Uint8Array;
  base64?: string;
  defaultFilename?: string;
  filename?: string;
  contentType?: string;
};

export type UploadContext = Pick<ToolHandlerContext<undefined>, "invoke">;
type UploadFileInput = Parameters<UploadContext["invoke"]["uploadFile"]>[0];

export async function uploadFile(input: UploadInput, ctx?: UploadContext) {
  const file = await normalizeInput(input);
  if (ctx?.invoke?.uploadFile) {
    const [result, error] = await ctx.invoke.uploadFile({
      file: file.data,
      fileName: file.fileName,
      contentType: file.contentType as UploadFileInput["contentType"],
    });

    if (error) throw error;
    if (!result) throw new Error("Failed to upload file");

    const accessUrl = result.accessURL;
    return { ...result, accessUrl, accessURL: accessUrl };
  }

  const dataUrl = `data:${file.contentType};base64,${Buffer.from(file.data).toString("base64")}`;
  return {
    accessUrl: dataUrl,
    accessURL: dataUrl,
    fileName: file.fileName,
    contentType: file.contentType,
  };
}

async function normalizeInput(input: UploadInput) {
  const fileName = input.filename ?? input.defaultFilename ?? "file.bin";
  if (input.buffer) {
    return {
      data: Buffer.from(input.buffer),
      fileName,
      contentType: input.contentType ?? guessContentType(fileName),
    };
  }
  if (input.base64) {
    const match = input.base64.match(/^data:([^;]+);base64,(.+)$/);
    const contentType =
      input.contentType ?? match?.[1] ?? guessContentType(fileName);
    const raw = match?.[2] ?? input.base64;
    return { data: Buffer.from(raw, "base64"), fileName, contentType };
  }
  if (input.url) {
    const response = await fetch(input.url);
    if (!response.ok)
      throw new Error(`Failed to download file: ${response.status}`);
    return {
      data: Buffer.from(await response.arrayBuffer()),
      fileName,
      contentType:
        input.contentType ??
        response.headers.get("content-type") ??
        guessContentType(fileName),
    };
  }
  throw new Error("uploadFile requires url, buffer, or base64");
}

function guessContentType(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "wav") return "audio/wav";
  if (ext === "pdf") return "application/pdf";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "xlsx")
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === "pptx")
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
}
