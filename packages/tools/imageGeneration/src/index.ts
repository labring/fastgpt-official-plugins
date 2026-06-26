import { z } from "zod";
import type { UploadContext } from "../utils/uploadFile";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com";
const DEFAULT_ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const DEFAULT_WANX_BASE_URL = "https://dashscope.aliyuncs.com/api/v1";
const DEFAULT_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1";

const providerSchema = z.enum(["openai", "seedream", "wanx", "nanobanana"]);

export const InputType = z.object({
  provider: providerSchema,
  apiKey: z.string().min(1),
  model: z.string().min(1),
  prompt: z.string().min(1),
  baseUrl: z.string().url().optional(),
  size: z.string().optional(),
  aspectRatio: z.string().optional(),
  quality: z.string().optional(),
  background: z.string().optional(),
  moderation: z.string().optional(),
  seed: z.number().int().optional(),
  promptUpsampling: z.boolean().optional(),
  safetyTolerance: z.number().int().min(0).max(6).optional(),
  outputFormat: z.enum(["png", "jpeg", "webp"]).optional(),
  style: z.string().optional(),
  negativePrompt: z.string().optional(),
  imageCount: z.number().int().min(1).max(4).optional(),
  pollIntervalMs: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export const OutputType = z.object({
  imageUrl: z.string(),
  imageUrls: z.array(z.string()),
  provider: providerSchema,
  model: z.string(),
  taskId: z.string().optional(),
  status: z.string().optional(),
});

type ImageGenerationInput = z.infer<typeof InputType>;
type ImageGenerationOutput = z.infer<typeof OutputType>;
type ProviderResult = Omit<ImageGenerationOutput, "provider">;
type WanxProtocol = "legacy" | "generation";
type WanxTaskResponse = {
  output?: {
    task_id?: string;
    task_status?: string;
    results?: Array<{ url?: string; code?: string; message?: string }>;
    choices?: Array<{
      message?: {
        content?: Array<{ image?: string }>;
      };
    }>;
  };
};

type RequestOptions = {
  provider: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
};

export async function tool(
  input: ImageGenerationInput,
  ctx?: UploadContext,
): Promise<ImageGenerationOutput> {
  const adapter = adapters[input.provider];
  const result = await adapter(input, ctx);

  return {
    ...result,
    provider: input.provider,
  };
}

const adapters: Record<
  ImageGenerationInput["provider"],
  (input: ImageGenerationInput, ctx?: UploadContext) => Promise<ProviderResult>
> = {
  openai: generateWithOpenAI,
  seedream: generateWithSeedream,
  wanx: generateWithWanx,
  nanobanana: generateWithNanoBanana,
};

async function generateWithOpenAI(
  input: ImageGenerationInput,
): Promise<ProviderResult> {
  const model = input.model;
  const data = await requestJson<{
    data?: Array<{ b64_json?: string; url?: string }>;
  }>(`${normalizeOpenAIBaseUrl(input.baseUrl)}/images/generations`, {
    provider: "OpenAI",
    method: "POST",
    timeoutMs: input.timeoutMs ?? 180_000,
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: dropUndefined({
      model,
      prompt: input.prompt,
      size: input.size ?? "1024x1024",
      quality: normalizeOpenAIQuality(input.quality),
      background: input.background,
      moderation: input.moderation,
      output_format: input.outputFormat,
      n: input.imageCount,
    }),
  });

  const imageUrls = normalizeImageItems(data.data);

  return {
    imageUrl: firstImageUrl(imageUrls),
    imageUrls,
    model,
    status: "succeeded",
  };
}

async function generateWithSeedream(
  input: ImageGenerationInput,
): Promise<ProviderResult> {
  const model = input.model;
  const data = await requestJson<{
    data?: Array<{ url?: string }>;
  }>(
    `${trimTrailingSlash(input.baseUrl ?? DEFAULT_ARK_BASE_URL)}/images/generations`,
    {
      provider: "Seedream",
      method: "POST",
      timeoutMs: input.timeoutMs ?? 180_000,
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: dropUndefined({
        model,
        prompt: input.prompt,
        size: input.size,
        seed: input.seed,
      }),
    },
  );

  const imageUrls = normalizeUrlItems(data.data);

  return {
    imageUrl: firstImageUrl(imageUrls),
    imageUrls,
    model,
    status: "succeeded",
  };
}

async function generateWithWanx(
  input: ImageGenerationInput,
): Promise<ProviderResult> {
  const model = input.model;
  const protocol = resolveWanxProtocol(model);
  const baseUrl = trimTrailingSlash(input.baseUrl ?? DEFAULT_WANX_BASE_URL);
  const createTask = await requestJson<WanxTaskResponse>(
    `${baseUrl}${getWanxTaskPath(protocol)}`,
    {
      provider: "Wanx",
      method: "POST",
      timeoutMs: input.timeoutMs ?? 60_000,
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: buildWanxTaskBody(input, protocol),
    },
  );

  const taskId = createTask.output?.task_id;
  if (!taskId) {
    throw new Error("Wanx did not return task_id.");
  }

  const result = await poll({
    timeoutMs: input.timeoutMs ?? 180_000,
    intervalMs: input.pollIntervalMs ?? 2_000,
    query: () =>
      requestJson<WanxTaskResponse>(
        `${baseUrl}/tasks/${encodeURIComponent(taskId)}`,
        {
          provider: "Wanx",
          method: "GET",
          timeoutMs: 30_000,
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
          },
        },
      ),
    isDone: (task) => task.output?.task_status === "SUCCEEDED",
    isFailed: (task) =>
      ["FAILED", "CANCELED", "UNKNOWN"].includes(
        task.output?.task_status ?? "",
      ),
    getError: formatWanxTaskError,
  });

  const imageUrls = getWanxResultUrls(result);

  return {
    imageUrl: firstImageUrl(imageUrls),
    imageUrls,
    model,
    taskId,
    status: result.output?.task_status,
  };
}

function resolveWanxProtocol(model: string): WanxProtocol {
  if (model.startsWith("wan2.6") || model.startsWith("wan2.7")) {
    return "generation";
  }
  return "legacy";
}

function getWanxTaskPath(protocol: WanxProtocol) {
  if (protocol === "generation") {
    return "/services/aigc/image-generation/generation";
  }
  return "/services/aigc/text2image/image-synthesis";
}

function buildWanxTaskBody(
  input: ImageGenerationInput,
  protocol: WanxProtocol,
) {
  const parameters = dropUndefined({
    size: input.size,
    n: input.imageCount,
    seed: input.seed,
    style: protocol === "legacy" ? input.style : undefined,
    negative_prompt: shouldSendWanxNegativePrompt(input.model, protocol)
      ? input.negativePrompt
      : undefined,
  });

  if (protocol === "generation") {
    return {
      model: input.model,
      input: {
        messages: [
          {
            role: "user",
            content: [{ text: input.prompt }],
          },
        ],
      },
      parameters,
    };
  }

  return {
    model: input.model,
    input: {
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
    },
    parameters,
  };
}

function shouldSendWanxNegativePrompt(model: string, protocol: WanxProtocol) {
  return protocol === "generation" && !model.startsWith("wan2.7");
}

function getWanxResultUrls(task: WanxTaskResponse) {
  const legacyUrls =
    task.output?.results?.map((item) => item.url).filter(isNonEmptyString) ??
    [];
  const generationItems =
    task.output?.choices?.flatMap(
      (choice) =>
        choice.message?.content
          ?.map((content) => content.image)
          .filter(isNonEmptyString) ?? [],
    ) ?? [];

  const urls = [...legacyUrls, ...generationItems];
  if (urls.length === 0) {
    throw new Error("No image URL returned by Wanx.");
  }
  return urls;
}

function formatWanxTaskError(task: WanxTaskResponse) {
  const failedItem = task.output?.results?.find(
    (item) => item.code || item.message,
  );
  return (
    [failedItem?.code, failedItem?.message].filter(Boolean).join(" ") ||
    `Wanx task ended with status ${task.output?.task_status ?? "unknown"}.`
  );
}

async function generateWithNanoBanana(
  input: ImageGenerationInput,
): Promise<ProviderResult> {
  const model = input.model;
  const generationConfig = dropUndefined({
    responseModalities: ["TEXT", "IMAGE"],
    responseFormat: input.aspectRatio
      ? {
          image: {
            aspectRatio: input.aspectRatio,
          },
        }
      : undefined,
  });
  const data = await requestJson<{
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { mimeType?: string; data?: string };
          inline_data?: { mime_type?: string; data?: string };
        }>;
      };
    }>;
  }>(
    `${normalizeGeminiBaseUrl(input.baseUrl)}/models/${encodeURIComponent(model)}:generateContent`,
    {
      provider: "Nano Banana",
      method: "POST",
      timeoutMs: input.timeoutMs ?? 180_000,
      headers: {
        "x-goog-api-key": input.apiKey,
        "Content-Type": "application/json",
      },
      body: {
        contents: [
          {
            parts: [{ text: input.prompt }],
          },
        ],
        generationConfig,
      },
    },
  );

  const imageUrls = normalizeGeminiImageItems(data.candidates);

  return {
    imageUrl: firstImageUrl(imageUrls),
    imageUrls,
    model,
    status: "succeeded",
  };
}

async function requestJson<T>(
  url: string,
  options: RequestOptions,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 60_000,
  );

  try {
    const init: RequestInit = {
      method: options.method,
      signal: controller.signal,
    };

    if (options.headers) {
      init.headers = options.headers;
    }

    if (options.body !== undefined) {
      init.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, init);
    const data = await readResponse(response);
    if (!response.ok) {
      throw new Error(
        formatUpstreamError({
          provider: options.provider,
          status: response.status,
          url,
          data,
        }),
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `${options.provider} request timed out after ${options.timeoutMs}ms: ${url}`,
      );
    }
    if (error instanceof TypeError) {
      throw new Error(
        `${options.provider} fetch failed: ${url}. ${formatFetchError(error)}`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function poll<T>({
  timeoutMs,
  intervalMs,
  query,
  isDone,
  isFailed,
  getError,
}: {
  timeoutMs: number;
  intervalMs: number;
  query: () => Promise<T>;
  isDone: (value: T) => boolean;
  isFailed: (value: T) => boolean;
  getError: (value: T) => string;
}) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const value = await query();
    if (isDone(value)) {
      return value;
    }
    if (isFailed(value)) {
      throw new Error(getError(value));
    }
    await delay(intervalMs);
  }

  throw new Error(`Image generation timed out after ${timeoutMs}ms.`);
}

function normalizeUrlItems(items: Array<{ url?: string }> | undefined) {
  const urls = items?.map((item) => item.url).filter(isNonEmptyString) ?? [];
  if (urls.length === 0) {
    throw new Error("No image URL returned by provider.");
  }
  return urls;
}

function normalizeImageItems(
  items?: Array<{ b64_json?: string; url?: string }>,
) {
  if (!items || items.length === 0) {
    throw new Error("No image data returned by provider.");
  }

  const urls = [];
  for (const item of items) {
    if (item.url) {
      urls.push(item.url);
      continue;
    }
    if (item.b64_json) {
      urls.push(toDataUrl(item.b64_json, "image/png"));
    }
  }

  if (urls.length === 0) {
    throw new Error("No image URL returned by provider.");
  }

  return urls;
}

function firstImageUrl(imageUrls: string[]) {
  const imageUrl = imageUrls[0];
  if (!imageUrl) {
    throw new Error("No image URL returned by provider.");
  }
  return imageUrl;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeOpenAIBaseUrl(baseUrl?: string) {
  const normalized = trimTrailingSlash(baseUrl ?? DEFAULT_OPENAI_BASE_URL);
  return normalized.endsWith("/v1") ? normalized : `${normalized}/v1`;
}

function normalizeGeminiBaseUrl(baseUrl?: string) {
  const normalized = trimTrailingSlash(baseUrl ?? DEFAULT_GEMINI_BASE_URL);
  return normalized.endsWith("/v1") ? normalized : `${normalized}/v1`;
}

function normalizeOpenAIQuality(quality?: string) {
  if (quality === "hd") {
    return "high";
  }
  if (quality === "standard") {
    return "medium";
  }
  return quality;
}

function normalizeGeminiImageItems(
  candidates:
    | Array<{
        content?: {
          parts?: Array<{
            inlineData?: { mimeType?: string; data?: string };
            inline_data?: { mime_type?: string; data?: string };
          }>;
        };
      }>
    | undefined,
) {
  const urls = [];

  for (const candidate of candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inlineData = part.inlineData ?? part.inline_data;
      const imageData = inlineData?.data;
      if (!imageData) {
        continue;
      }
      const contentType =
        part.inlineData?.mimeType ?? part.inline_data?.mime_type ?? "image/png";
      urls.push(toDataUrl(imageData, contentType));
    }
  }

  if (urls.length === 0) {
    throw new Error("No image data returned by Nano Banana.");
  }

  return urls;
}

function toDataUrl(base64: string, contentType: string) {
  if (base64.startsWith("data:")) {
    return base64;
  }
  return `data:${contentType};base64,${base64}`;
}

function dropUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatFetchError(error: TypeError) {
  const cause = error.cause;
  if (cause instanceof Error) {
    return [error.message, cause.message].filter(Boolean).join(" ");
  }
  return error.message;
}

function formatUpstreamError({
  provider,
  status,
  url,
  data,
}: {
  provider: string;
  status: number;
  url: string;
  data: unknown;
}) {
  const prefix = `${provider} request failed with status ${status}: ${url}.`;
  if (typeof data === "object" && data !== null) {
    const error = "error" in data ? data.error : data;
    if (typeof error === "object" && error !== null) {
      const code =
        "code" in error && typeof error.code === "string"
          ? error.code
          : undefined;
      const message =
        "message" in error && typeof error.message === "string"
          ? error.message
          : undefined;
      return [prefix, code, message].filter(Boolean).join(" ");
    }
  }

  if (typeof data === "string" && data.length > 0) {
    return `${prefix} ${data}`;
  }

  return prefix;
}
