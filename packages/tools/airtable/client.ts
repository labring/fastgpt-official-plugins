const AIRTABLE_API_ORIGIN = "https://api.airtable.com";
const AIRTABLE_API_BASE = `${AIRTABLE_API_ORIGIN}/v0`;
const DEFAULT_LIST_LIMIT = 100;
const MAX_LIST_LIMIT = 100;
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;
const MAX_FIELD_COUNT = 100;
const MAX_FIELDS_JSON_BYTES = 64 * 1024;
const MAX_SORT_RULES = 5;
const TOKEN_PAT_PATTERN = /pat[a-zA-Z0-9._-]+/g;
const BEARER_PATTERN = /(Bearer\s+)[^\s"']+/gi;

export type AirtableFields = Record<string, unknown>;

export type AirtableSortRule = {
  field: string;
  direction?: "asc" | "desc" | null | undefined;
};

export type AirtableRecord = {
  id: string;
  createdTime?: string | undefined;
  fields: AirtableFields;
};

export type AirtableErrorBody = {
  error?:
    | string
    | {
        type?: string;
        message?: string;
      };
};

export type AirtableClientConfig = {
  token: string;
  fetchImpl?: typeof fetch | undefined;
};

export class AirtableClient {
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;

  constructor({ token, fetchImpl = fetch }: AirtableClientConfig) {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new Error("Airtable token is required");
    }

    this.token = normalizedToken;
    this.fetchImpl = fetchImpl;
  }

  async request<T>({
    method,
    baseId,
    tableIdOrName,
    searchParams,
    body,
  }: {
    method: "GET" | "POST" | "PATCH";
    baseId: string;
    tableIdOrName: string;
    searchParams?: URLSearchParams;
    body?: unknown;
  }): Promise<T> {
    const url = buildAirtableUrl({
      baseId,
      tableIdOrName,
      ...(searchParams ? { searchParams } : {}),
    });
    const requestInit: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    };

    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    const response = await this.fetchImpl(url, requestInit);

    if (!response.ok) {
      throw await createAirtableError(response);
    }

    return (await response.json()) as T;
  }
}

export function createAirtableClient(
  token: string,
  fetchImpl?: typeof fetch,
): AirtableClient {
  return new AirtableClient({
    token,
    ...(fetchImpl ? { fetchImpl } : {}),
  });
}

export function buildAirtableUrl({
  baseId,
  tableIdOrName,
  searchParams,
}: {
  baseId: string;
  tableIdOrName: string;
  searchParams?: URLSearchParams;
}): string {
  const url = new URL(
    `${AIRTABLE_API_BASE}/${encodeURIComponent(requireIdentifier(baseId, "baseId"))}/${encodeURIComponent(requireIdentifier(tableIdOrName, "tableIdOrName"))}`,
  );

  if (searchParams) {
    url.search = searchParams.toString();
  }

  if (url.origin !== AIRTABLE_API_ORIGIN) {
    throw new Error("Airtable API host is invalid");
  }

  return url.toString();
}

export async function listRecords({
  client,
  baseId,
  tableIdOrName,
  maxRecords,
  pageSize,
  filterByFormula,
  view,
  sort,
}: {
  client: AirtableClient;
  baseId: string;
  tableIdOrName: string;
  maxRecords?: number | null | undefined;
  pageSize?: number | null | undefined;
  filterByFormula?: string | null | undefined;
  view?: string | null | undefined;
  sort?: AirtableSortRule[] | string | null | undefined;
}) {
  const limit = normalizePositiveInteger(
    maxRecords,
    "maxRecords",
    DEFAULT_LIST_LIMIT,
    MAX_LIST_LIMIT,
  );
  const normalizedPageSize = normalizePositiveInteger(
    pageSize,
    "pageSize",
    Math.min(DEFAULT_PAGE_SIZE, limit),
    Math.min(MAX_PAGE_SIZE, limit),
  );
  const searchParams = new URLSearchParams();
  const trimmedFormula = filterByFormula?.trim();
  const trimmedView = view?.trim();

  searchParams.set("maxRecords", String(limit));
  searchParams.set("pageSize", String(normalizedPageSize));

  if (trimmedFormula) {
    searchParams.set("filterByFormula", trimmedFormula);
  }

  if (trimmedView) {
    searchParams.set("view", trimmedView);
  }

  normalizeSortRules(sort).forEach((rule, index) => {
    searchParams.set(`sort[${index}][field]`, rule.field);
    searchParams.set(`sort[${index}][direction]`, rule.direction ?? "asc");
  });

  const response = await client.request<{
    records?: AirtableRecord[];
    offset?: string;
  }>({
    method: "GET",
    baseId,
    tableIdOrName,
    searchParams,
  });

  const records = (response.records ?? []).slice(0, limit).map(normalizeRecord);

  return {
    records,
    offset: response.offset ?? null,
    count: records.length,
  };
}

export async function createRecord({
  client,
  baseId,
  tableIdOrName,
  fields,
  typecast,
}: {
  client: AirtableClient;
  baseId: string;
  tableIdOrName: string;
  fields: AirtableFields | string;
  typecast?: boolean | null | undefined;
}) {
  const normalizedFields = parseFieldsInput(fields);
  const response = await client.request<{ records?: AirtableRecord[] }>({
    method: "POST",
    baseId,
    tableIdOrName,
    body: {
      records: [{ fields: normalizedFields }],
      typecast: typecast ?? false,
    },
  });
  const record = normalizeRecord(response.records?.[0]);

  return {
    record,
    success: true,
  };
}

export async function updateRecord({
  client,
  baseId,
  tableIdOrName,
  recordId,
  fields,
  typecast,
}: {
  client: AirtableClient;
  baseId: string;
  tableIdOrName: string;
  recordId: string;
  fields: AirtableFields | string;
  typecast?: boolean | null | undefined;
}) {
  const normalizedFields = parseFieldsInput(fields);
  const response = await client.request<{ records?: AirtableRecord[] }>({
    method: "PATCH",
    baseId,
    tableIdOrName,
    body: {
      records: [
        {
          id: requireIdentifier(recordId, "recordId"),
          fields: normalizedFields,
        },
      ],
      typecast: typecast ?? false,
    },
  });
  const record = normalizeRecord(response.records?.[0]);

  return {
    record,
    success: true,
  };
}

export function parseFieldsInput(fields: AirtableFields | string): AirtableFields {
  const value = typeof fields === "string" ? parseJsonObject(fields) : fields;

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("fields must be a JSON object");
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    throw new Error("fields cannot be empty");
  }

  if (entries.length > MAX_FIELD_COUNT) {
    throw new Error(`fields cannot contain more than ${MAX_FIELD_COUNT} keys`);
  }

  const jsonSize = Buffer.byteLength(JSON.stringify(value), "utf8");

  if (jsonSize > MAX_FIELDS_JSON_BYTES) {
    throw new Error(
      `fields JSON size cannot exceed ${MAX_FIELDS_JSON_BYTES} bytes`,
    );
  }

  return value;
}

export function normalizeSortRules(
  sort?: AirtableSortRule[] | string | null,
): AirtableSortRule[] {
  if (sort === undefined || sort === null || sort === "") {
    return [];
  }

  const value = typeof sort === "string" ? parseJsonArray(sort, "sort") : sort;

  if (!Array.isArray(value)) {
    throw new Error("sort must be an array");
  }

  if (value.length > MAX_SORT_RULES) {
    throw new Error(`sort cannot contain more than ${MAX_SORT_RULES} rules`);
  }

  return value.map((rule, index) => {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
      throw new Error(`sort[${index}] must be an object`);
    }

    const field = String((rule as { field?: unknown }).field ?? "").trim();
    const directionValue = (rule as { direction?: unknown }).direction;
    const direction =
      directionValue === undefined || directionValue === null
        ? "asc"
        : String(directionValue).trim().toLowerCase();

    if (!field) {
      throw new Error(`sort[${index}].field is required`);
    }

    if (direction !== "asc" && direction !== "desc") {
      throw new Error(`sort[${index}].direction must be asc or desc`);
    }

    return {
      field,
      direction,
    };
  });
}

export function handleAirtableError(error: unknown): string {
  if (error instanceof Error) {
    return redactAirtableSecrets(error.message);
  }

  if (typeof error === "string") {
    return redactAirtableSecrets(error);
  }

  return "Unknown error occurred while calling Airtable API";
}

export function redactAirtableSecrets(message: string): string {
  return message
    .replace(BEARER_PATTERN, "$1[REDACTED]")
    .replace(TOKEN_PAT_PATTERN, "[REDACTED]");
}

function parseJsonObject(value: string): AirtableFields {
  try {
    const parsed = JSON.parse(value);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as AirtableFields;
    }
  } catch {
    throw new Error("fields must be a valid JSON object string");
  }

  throw new Error("fields must be a JSON object");
}

function parseJsonArray(value: string, fieldName: string): unknown[] {
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    throw new Error(`${fieldName} must be a valid JSON array string`);
  }

  throw new Error(`${fieldName} must be an array`);
}

function requireIdentifier(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${fieldName} is required`);
  }

  if (normalized.length > 200) {
    throw new Error(`${fieldName} is too long`);
  }

  return normalized;
}

function normalizePositiveInteger(
  value: number | null | undefined,
  fieldName: string,
  defaultValue: number,
  maxValue: number,
): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }

  return Math.min(value, maxValue);
}

function normalizeRecord(record: AirtableRecord | undefined): AirtableRecord {
  if (!record?.id) {
    throw new Error("Airtable response did not include a record");
  }

  const normalizedRecord: AirtableRecord = {
    id: String(record.id),
    fields:
      record.fields &&
      typeof record.fields === "object" &&
      !Array.isArray(record.fields)
        ? record.fields
        : {},
  };

  if (record.createdTime !== undefined) {
    normalizedRecord.createdTime = record.createdTime;
  }

  return normalizedRecord;
}

async function createAirtableError(response: Response): Promise<Error> {
  let body: AirtableErrorBody | undefined;

  try {
    body = (await response.json()) as AirtableErrorBody;
  } catch {
    body = undefined;
  }

  const rawError = body?.error;
  const type =
    typeof rawError === "object" && rawError?.type
      ? rawError.type
      : typeof rawError === "string"
        ? rawError
        : "UNKNOWN_ERROR";
  const message =
    typeof rawError === "object" && rawError?.message
      ? rawError.message
      : response.statusText || "Airtable API request failed";

  return new Error(
    redactAirtableSecrets(
      `Airtable API error (${response.status}, ${type}): ${message}`,
    ),
  );
}
