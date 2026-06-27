const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const MAX_JSON_INPUT_LENGTH = 30_000;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface NotionListResponse<T> {
  object: "list";
  results?: T[];
  next_cursor?: string | null;
  has_more?: boolean;
  type?: string;
  [key: string]: unknown;
}

export interface NotionRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  query?: Record<string, string | number | boolean | undefined>;
  body?: JsonObject;
}

export async function notionApiRequest<T>(
  integrationToken: string,
  endpoint: string,
  options: NotionRequestOptions = {},
): Promise<T> {
  validateIntegrationToken(integrationToken);
  validateEndpoint(endpoint);

  const url = new URL(`${NOTION_API_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const requestInit: RequestInit = {
    method: options.method ?? "GET",
    headers: buildHeaders(integrationToken, options.body !== undefined),
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), requestInit);
  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(
      `Notion API error ${response.status}: ${extractNotionError(data, response.statusText)}`,
    );
  }
  if (data === null) {
    throw new Error("Notion API returned an invalid JSON response");
  }

  return data as T;
}

export function parseJsonObjectInput(
  value: string | undefined,
  fieldName: string,
): JsonObject | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  if (value.length > MAX_JSON_INPUT_LENGTH) {
    throw new Error(`${fieldName} JSON is too large`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${fieldName} must be valid JSON`);
  }

  if (!isJsonObject(parsed)) {
    throw new Error(`${fieldName} must be a JSON object`);
  }

  return parsed;
}

export function parseJsonArrayInput(
  value: string | undefined,
  fieldName: string,
): JsonValue[] | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  if (value.length > MAX_JSON_INPUT_LENGTH) {
    throw new Error(`${fieldName} JSON is too large`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${fieldName} must be valid JSON`);
  }

  if (!Array.isArray(parsed) || !parsed.every(isJsonValue)) {
    throw new Error(`${fieldName} must be a JSON array`);
  }

  return parsed;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function compactObject(
  value: Record<string, JsonValue | undefined>,
): JsonObject {
  const entries = Object.entries(value).filter(([, entryValue]) => {
    return entryValue !== undefined;
  });
  return Object.fromEntries(entries) as JsonObject;
}

function validateIntegrationToken(integrationToken: string): void {
  if (!integrationToken || !integrationToken.startsWith("ntn_")) {
    throw new Error(
      'Notion integration token is required and should start with "ntn_"',
    );
  }
}

function validateEndpoint(endpoint: string): void {
  const allowedStaticEndpoints = new Set(["search", "pages"]);
  if (allowedStaticEndpoints.has(endpoint)) {
    return;
  }

  const allowedDynamicEndpointPatterns = [
    /^pages\/[A-Za-z0-9_-]+$/,
    /^blocks\/[A-Za-z0-9_-]+\/children$/,
    /^data_sources\/[A-Za-z0-9_-]+\/query$/,
  ];

  if (
    allowedDynamicEndpointPatterns.some((pattern) => pattern.test(endpoint))
  ) {
    return;
  }

  throw new Error(`Unsupported Notion endpoint: ${endpoint}`);
}

function buildHeaders(
  integrationToken: string,
  hasJsonBody: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${integrationToken}`,
    Accept: "application/json",
    "Notion-Version": NOTION_VERSION,
  };

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  return headers;
}

function extractNotionError(data: unknown, fallback: string): string {
  if (isRecord(data) && typeof data.message === "string") {
    return data.message;
  }
  return fallback || "unknown_error";
}

function isJsonObject(value: unknown): value is JsonObject {
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  return isJsonObject(value);
}
