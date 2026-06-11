import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import type { IncludeTokenMode, JsonObject, SpreadApiMethod } from "./types";

const DEFAULT_TIMEOUT = 30000;
const SPREADAPI_SERVICE_PATH = "/api/v1/services";

export function createSpreadApiHeaders(
  apiKey?: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey && apiKey.trim().length > 0) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

export function validateApiKey(apiKey: string): void {
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new Error("SpreadAPI API key is required");
  }
}

export function validateServiceUrl(serviceUrl: string): void {
  if (!serviceUrl || typeof serviceUrl !== "string") {
    throw new Error("serviceUrl is required");
  }

  try {
    const url = new URL(serviceUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("serviceUrl must use http or https");
    }
  } catch {
    throw new Error("serviceUrl must be a valid URL");
  }
}

export function normalizeTimeout(timeout?: number): number {
  if (!timeout || timeout <= 0) {
    return DEFAULT_TIMEOUT;
  }

  return timeout;
}

export function buildExecuteUrl(serviceUrl: string): string {
  const normalized = normalizeSpreadApiServiceUrl(serviceUrl);

  if (!normalized) {
    validateServiceUrl(serviceUrl);
    return serviceUrl;
  }

  normalized.url.pathname = `${SPREADAPI_SERVICE_PATH}/${normalized.serviceId}/execute`;
  return normalized.url.toString();
}

export function buildInfoUrl(serviceUrl: string, infoPath?: string): string {
  validateServiceUrl(serviceUrl);

  const normalizedInfoPath = infoPath === undefined ? "" : infoPath.trim();
  if (/^https?:\/\//i.test(normalizedInfoPath)) {
    return normalizedInfoPath;
  }

  const normalized = normalizeSpreadApiServiceUrl(serviceUrl);

  if (normalized) {
    const url = normalized.url;
    const basePath = `${SPREADAPI_SERVICE_PATH}/${normalized.serviceId}`;

    if (!normalizedInfoPath) {
      url.pathname = basePath;
      return url.toString();
    }

    url.pathname = `${basePath}/${normalizedInfoPath.replace(/^\/+/, "")}`;
    return url.toString();
  }

  if (!normalizedInfoPath) {
    return serviceUrl;
  }

  const url = new URL(serviceUrl);
  const basePath = url.pathname.endsWith("/")
    ? url.pathname
    : `${url.pathname}/`;
  url.pathname = `${basePath}${normalizedInfoPath.replace(/^\/+/, "")}`;

  return url.toString();
}

export function withServiceToken<T extends JsonObject | undefined>(
  value: T,
  serviceToken?: string | null,
  includeTokenMode: IncludeTokenMode = "none",
): T | JsonObject {
  if (!serviceToken || includeTokenMode === "none") {
    return value ?? {};
  }

  if (includeTokenMode === "query" || includeTokenMode === "body") {
    return {
      ...(value ?? {}),
      token: serviceToken,
    };
  }

  return value ?? {};
}

export async function requestSpreadApi<T = any>({
  apiKey,
  url,
  method,
  query,
  body,
  timeout,
}: {
  apiKey?: string | null;
  url: string;
  method: SpreadApiMethod;
  query?: JsonObject;
  body?: JsonObject;
  timeout?: number;
}): Promise<{ status: number; data: T }> {
  validateServiceUrl(url);

  const config: AxiosRequestConfig = {
    url,
    method,
    headers: createSpreadApiHeaders(apiKey),
    params: query,
    timeout: normalizeTimeout(timeout),
  };

  if (method === "POST") {
    config.data = body ?? {};
  }

  const response = await axios.request<T>(config);

  return {
    status: response.status,
    data: response.data,
  };
}

export function handleSpreadApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;
      const message = data?.message || data?.error || axiosError.message;

      return `SpreadAPI API error (${status}): ${message}`;
    }

    if (axiosError.code === "ECONNABORTED") {
      return "SpreadAPI request timeout";
    }

    return `SpreadAPI network error: ${axiosError.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error occurred while calling SpreadAPI";
}

function normalizeSpreadApiServiceUrl(
  serviceUrl: string,
): { url: URL; serviceId: string } | null {
  validateServiceUrl(serviceUrl);

  const url = new URL(serviceUrl);
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments[0] === "d" && segments[1]) {
    return {
      url,
      serviceId: segments[1],
    };
  }

  if (
    segments[0] === "api" &&
    segments[1] === "v1" &&
    segments[2] === "services" &&
    segments[3]
  ) {
    return {
      url,
      serviceId: segments[3],
    };
  }

  return null;
}
