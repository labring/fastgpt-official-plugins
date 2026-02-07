import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import crypto from "crypto";
import type { Input, Output } from "./schemas";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryFn<T>(
  fn: () => Promise<T>,
  maxRetries: number,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function getErrText(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "error" in err) {
    return String((err as { error: unknown }).error);
  }
  return String(err);
}

function generateUrlSignature(urlPath: string, secretKey: string) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString("hex");
  const originalText = `${urlPath}&${timestamp}&${nonce}`;

  const hmac = crypto.createHmac("sha1", secretKey);
  hmac.update(originalText, "utf-8");
  const cipherTextBytes = hmac.digest();

  const base64Encoded = cipherTextBytes.toString("base64");
  const urlSafeSignature = base64Encoded
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return {
    signature: urlSafeSignature,
    timestamp: timestamp,
    signature_nonce: nonce,
  };
}

function buildRequestUrl(
  accessKey: string,
  secretKey: string,
  apiPath: string,
) {
  const BASE_URL = "https://openapi.liblibai.cloud";
  const signatureData = generateUrlSignature(apiPath, secretKey);

  const params = new URLSearchParams({
    AccessKey: accessKey,
    Signature: signatureData.signature,
    Timestamp: signatureData.timestamp.toString(),
    SignatureNonce: signatureData.signature_nonce,
  });

  return `${BASE_URL}${apiPath}?${params.toString()}`;
}

async function submitDrawingTask(
  accessKey: string,
  secretKey: string,
  prompt: string,
  size: string,
) {
  const apiPath = "/api/generate/webui/text2img/ultra";
  const url = buildRequestUrl(accessKey, secretKey, apiPath);

  const requestBody = {
    templateUuid: "5d7e67009b344550bc1aa6ccbfa1d7f4",
    generateParams: {
      prompt: prompt,
      imageSize: {
        width: Number(size.split("*")[0]),
        height: Number(size.split("*")[1]),
      },
      imgCount: 1,
      steps: 30,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`提交绘画任务失败: HTTP ${response.status}`);
  }

  return await response.json();
}

async function queryTaskStatus(
  accessKey: string,
  secretKey: string,
  generateUuid: string,
) {
  const apiPath = "/api/generate/webui/status";
  const url = buildRequestUrl(accessKey, secretKey, apiPath);

  const requestBody = {
    generateUuid: generateUuid,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`查询任务状态失败: HTTP ${response.status}`);
  }

  return await response.json();
}

async function waitForTaskCompletion(
  accessKey: string,
  secretKey: string,
  generateUuid: string,
) {
  return await retryFn(async () => {
    const statusResult = await queryTaskStatus(
      accessKey,
      secretKey,
      generateUuid,
    );
    const generateStatus = statusResult.data?.generateStatus;

    if (generateStatus === 5) {
      const images = statusResult.data?.images || [];

      if (images.length === 0) {
        throw new Error("任务完成但图片列表为空，可能图片未通过审核");
      }

      const validImage = images.find(
        (img: { imageUrl?: string }) =>
          img.imageUrl && img.imageUrl.trim() !== "",
      );

      if (!validImage?.imageUrl) {
        throw new Error("任务完成但未找到有效的图片链接");
      }

      return {
        link: validImage.imageUrl,
      };
    }

    if (generateStatus === 4) {
      throw new Error(statusResult.data?.generateMsg || "图片生成任务失败");
    }
    await delay(2000);
    throw new Error("Task still in progress");
  }, 30);
}

export async function handler(
  { accessKey, secretKey, prompt, size }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    const upload = await submitDrawingTask(accessKey, secretKey, prompt, size);

    if (!upload.data?.generateUuid) {
      return {
        link: "",
        msg: "提交任务失败，未获取到任务ID",
      };
    }

    const result = await waitForTaskCompletion(
      accessKey,
      secretKey,
      upload.data.generateUuid,
    );
    if (result) {
      return result;
    }
    throw new Error("任务超时，请稍后重试");
  } catch (error) {
    throw new Error(getErrText(error));
  }
}
