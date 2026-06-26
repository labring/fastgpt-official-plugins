type UploadInput = {
  url?: string;
  buffer?: Buffer | Uint8Array;
  base64?: string;
  defaultFilename?: string;
  filename?: string;
  contentType?: string;
};

type UploadResult = {
  accessUrl?: string | undefined;
  accessURL?: string | undefined;
  fileName?: string | undefined;
  contentType?: string | undefined;
  [key: string]: unknown;
};

export type UploadContext = {
  invoke?: {
    uploadFile(input: unknown): Promise<[UploadResult | null, unknown]>;
  };
};

export async function uploadFile(input: UploadInput, ctx?: UploadContext) {
  const file = await normalizeInput(input);
  if (ctx?.invoke?.uploadFile) {
    const [result, error] = await ctx.invoke.uploadFile({
      file: file.data,
      fileName: file.fileName,
      contentType: file.contentType,
    });

    if (error || !result) {
      throw new Error(getUploadErrorMessage(error));
    }

    const accessUrl = (result.accessUrl ?? result.accessURL) as
      | string
      | undefined;
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

function getUploadErrorMessage(error: unknown) {
  if (!error) {
    return "Failed to upload file";
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && "reason" in error) {
    const reason = (error as { reason?: { "zh-CN"?: string; en?: string } })
      .reason;
    return reason?.["zh-CN"] ?? reason?.en ?? "Failed to upload file";
  }
  return "Failed to upload file";
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
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
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
  if (ext === "png") {
    return "image/png";
  }
  if (ext === "jpg" || ext === "jpeg") {
    return "image/jpeg";
  }
  if (ext === "webp") {
    return "image/webp";
  }
  return "application/octet-stream";
}
