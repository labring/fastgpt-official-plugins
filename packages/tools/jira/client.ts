const JIRA_API_PREFIX = "/rest/api/3";
const MAX_JSON_INPUT_LENGTH = 30_000;
const DEFAULT_FIELDS = [
  "summary",
  "status",
  "assignee",
  "reporter",
  "created",
  "updated",
  "issuetype",
  "project",
  "priority",
];

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface JiraAuth {
  siteUrl: string;
  email: string;
  apiToken: string;
}

export interface JiraRequestOptions {
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined>;
  body?: JsonObject;
}

export interface NormalizedJiraIssue {
  id: string;
  key: string;
  url: string;
  summary: string;
  status: string;
  issue_type: string;
  project_key: string;
  assignee: string;
  reporter: string;
  priority: string;
  created: string;
  updated: string;
  fields_json: string;
}

export async function jiraApiRequest<T>(
  auth: JiraAuth,
  endpoint: string,
  options: JiraRequestOptions = {},
): Promise<T> {
  const site = normalizeSiteUrl(auth.siteUrl);
  validateAuth(auth);
  validateEndpoint(endpoint, options.method ?? "GET");

  const url = new URL(`${site}${JIRA_API_PREFIX}/${endpoint}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const requestInit: RequestInit = {
    method: options.method ?? "GET",
    headers: buildHeaders(auth, options.body !== undefined),
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), requestInit);
  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(
      `Jira API error ${response.status}: ${redactSensitiveText(
        extractJiraError(data, response.statusText),
        auth,
      )}`,
    );
  }
  if (data === null) {
    throw new Error("Jira API returned an invalid JSON response");
  }

  return data as T;
}

export function normalizeSiteUrl(siteUrl: string): string {
  const trimmed = siteUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      "Jira site URL must be a valid https://*.atlassian.net URL",
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Jira site URL must use https");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname.endsWith(".atlassian.net")) {
    throw new Error(
      "Jira site URL must be an Atlassian Cloud *.atlassian.net host",
    );
  }

  if ((parsed.pathname !== "" && parsed.pathname !== "/") || parsed.search) {
    throw new Error("Jira site URL must not include a path or query string");
  }

  return `https://${hostname}`;
}

export function compactObject(
  value: Record<string, JsonValue | undefined>,
): JsonObject {
  const entries = Object.entries(value).filter(([, entryValue]) => {
    return entryValue !== undefined;
  });
  return Object.fromEntries(entries) as JsonObject;
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

export function parseFieldsInput(value: string | undefined): string[] {
  if (value === undefined || value.trim() === "") {
    return DEFAULT_FIELDS;
  }

  const fields = value
    .split(",")
    .map((field) => field.trim())
    .filter((field) => field !== "");

  if (fields.length === 0) {
    return DEFAULT_FIELDS;
  }
  if (fields.length > 30) {
    throw new Error("fields can include at most 30 field names");
  }
  for (const field of fields) {
    if (!/^[A-Za-z0-9_.-]+$/.test(field)) {
      throw new Error(`Unsupported Jira field name: ${field}`);
    }
  }

  return fields;
}

export function validateIssueKeyOrId(value: string, fieldName: string): string {
  const trimmed = value.trim();
  if (!/^(?:[A-Za-z][A-Za-z0-9_]*-\d+|\d+)$/.test(trimmed)) {
    throw new Error(
      `${fieldName} must be a Jira issue key like PROJ-123 or a numeric issue ID`,
    );
  }
  return trimmed;
}

export function validateProjectKey(value: string): string {
  const trimmed = value.trim();
  if (!/^[A-Za-z][A-Za-z0-9_]{1,20}$/.test(trimmed)) {
    throw new Error("projectKey must be a Jira project key");
  }
  return trimmed.toUpperCase();
}

export function plainTextToAdf(text: string): JsonObject {
  const paragraphs = text.split(/\r?\n/).map((line) => {
    const paragraph: JsonObject = {
      type: "paragraph",
      content:
        line === ""
          ? []
          : [
              {
                type: "text",
                text: line,
              },
            ],
    };
    return paragraph;
  });

  return {
    type: "doc",
    version: 1,
    content: paragraphs,
  };
}

export function extractTextFromAdf(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(extractTextFromAdf).filter(Boolean).join("\n");
  }
  if (!isRecord(value)) {
    return "";
  }
  if (typeof value.text === "string") {
    return value.text;
  }
  if (Array.isArray(value.content)) {
    return value.content.map(extractTextFromAdf).filter(Boolean).join("\n");
  }
  return "";
}

export function normalizeJiraIssue(
  issue: unknown,
  siteUrl: string,
): NormalizedJiraIssue {
  if (!isRecord(issue)) {
    throw new Error("Jira issue response must be an object");
  }

  const fields = isRecord(issue.fields) ? issue.fields : {};
  const key = typeof issue.key === "string" ? issue.key : "";

  return {
    id: typeof issue.id === "string" ? issue.id : "",
    key,
    url: key === "" ? "" : `${normalizeSiteUrl(siteUrl)}/browse/${key}`,
    summary: getString(fields.summary),
    status: getNestedName(fields.status),
    issue_type: getNestedName(fields.issuetype),
    project_key: getNestedString(fields.project, "key"),
    assignee: getNestedDisplayName(fields.assignee),
    reporter: getNestedDisplayName(fields.reporter),
    priority: getNestedName(fields.priority),
    created: getString(fields.created),
    updated: getString(fields.updated),
    fields_json: JSON.stringify(fields),
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateAuth(auth: JiraAuth): void {
  if (auth.email.trim() === "" || !auth.email.includes("@")) {
    throw new Error("Jira account email is required");
  }
  if (auth.apiToken.trim().length < 8) {
    throw new Error("Jira API token is required");
  }
}

function validateEndpoint(endpoint: string, method: "GET" | "POST"): void {
  if (endpoint === "search/jql" && method === "POST") {
    return;
  }
  if (endpoint === "issue" && method === "POST") {
    return;
  }
  if (
    /^issue\/(?:[A-Za-z][A-Za-z0-9_]*-\d+|\d+)$/.test(endpoint) &&
    method === "GET"
  ) {
    return;
  }
  if (
    /^issue\/(?:[A-Za-z][A-Za-z0-9_]*-\d+|\d+)\/comment$/.test(endpoint) &&
    method === "POST"
  ) {
    return;
  }

  throw new Error(`Unsupported Jira endpoint: ${endpoint}`);
}

function buildHeaders(
  auth: JiraAuth,
  hasJsonBody: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Basic ${btoa(`${auth.email}:${auth.apiToken}`)}`,
    Accept: "application/json",
  };

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  return headers;
}

function extractJiraError(data: unknown, fallback: string): string {
  if (isRecord(data)) {
    if (Array.isArray(data.errorMessages) && data.errorMessages.length > 0) {
      return data.errorMessages
        .filter((entry): entry is string => typeof entry === "string")
        .join("; ");
    }
    if (isRecord(data.errors)) {
      const entries = Object.entries(data.errors)
        .map(([field, message]) => `${field}: ${String(message)}`)
        .join("; ");
      if (entries !== "") {
        return entries;
      }
    }
    if (typeof data.message === "string") {
      return data.message;
    }
  }
  return fallback || "unknown_error";
}

function redactSensitiveText(text: string, auth: JiraAuth): string {
  const basicToken = btoa(`${auth.email}:${auth.apiToken}`);
  return [auth.apiToken, basicToken].reduce((result, secret) => {
    return secret === "" ? result : result.split(secret).join("[REDACTED]");
  }, text);
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getNestedName(value: unknown): string {
  return getNestedString(value, "name");
}

function getNestedDisplayName(value: unknown): string {
  return getNestedString(value, "displayName");
}

function getNestedString(value: unknown, key: string): string {
  if (!isRecord(value)) {
    return "";
  }
  const nested = value[key];
  return typeof nested === "string" ? nested : "";
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
