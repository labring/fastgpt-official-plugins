import axios, { type AxiosError, type AxiosInstance } from "axios";
import type { GristFields } from "./types";

export const DEFAULT_GRIST_BASE_URL = "https://docs.getgrist.com";

export function normalizeGristBaseUrl(baseUrl?: string | null): string {
  const value = baseUrl?.trim() || DEFAULT_GRIST_BASE_URL;
  return value.replace(/\/+$/, "");
}

export function createGristClient(
  apiKey: string,
  baseUrl?: string | null,
): AxiosInstance {
  if (!apiKey?.trim()) {
    throw new Error("Grist API key is required");
  }

  return axios.create({
    baseURL: normalizeGristBaseUrl(baseUrl),
    timeout: 30000,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

export function buildRecordsPath(docId: string, tableId: string): string {
  return `/api/docs/${encodeURIComponent(docId)}/tables/${encodeURIComponent(tableId)}/records`;
}

export function parseGristObjectInput(
  value: Record<string, unknown> | string | null | undefined,
  fieldName: string,
): GristFields | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as GristFields;
      }
    } catch {
      throw new Error(`${fieldName} must be a valid JSON object`);
    }

    throw new Error(`${fieldName} must be a JSON object`);
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value as GristFields;
  }

  throw new Error(`${fieldName} must be an object`);
}

export function handleGristError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.response?.data?.message ||
      axiosError.message;

    if (axiosError.response) {
      return `Grist API error (${axiosError.response.status}): ${errorMessage}`;
    }

    if (axiosError.code === "ECONNABORTED") {
      return "Grist API request timeout";
    }

    return `Grist API network error: ${errorMessage}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error occurred while calling Grist API";
}
