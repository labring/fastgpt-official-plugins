import { z } from "zod";
import {
  compactObject,
  type JsonObject,
  type NotionListResponse,
  notionApiRequest,
  parseJsonObjectInput,
} from "../../../client";

const NotionPageResultSchema = z.object({
  object: z.string(),
  id: z.string(),
  url: z.string().optional(),
  archived: z.boolean().optional(),
  in_trash: z.boolean().optional(),
  created_time: z.string().optional(),
  last_edited_time: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export const InputType = z.object({
  integrationToken: z.string().min(1, "Notion integration token is required"),
  dataSourceId: z.string().min(1, "Data source ID is required"),
  filterJson: z.string().optional(),
  sortsJson: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

export const OutputType = z.object({
  results: z.array(
    z.object({
      object: z.string(),
      id: z.string(),
      title: z.string(),
      url: z.string(),
      archived: z.boolean(),
      in_trash: z.boolean(),
      created_time: z.string(),
      last_edited_time: z.string(),
      properties_json: z.string(),
    }),
  ),
  has_more: z.boolean(),
  next_cursor: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const {
    integrationToken,
    dataSourceId,
    filterJson,
    sortsJson,
    pageSize,
    cursor,
  } = await InputType.parseAsync(input);

  const filter = parseJsonObjectInput(filterJson, "filterJson");
  const sortsWrapper = parseJsonObjectInput(sortsJson, "sortsJson");
  const body = compactObject({
    filter,
    sorts: extractSortsArray(sortsWrapper),
    page_size: pageSize,
    start_cursor: cursor,
  });

  const response = await notionApiRequest<NotionListResponse<unknown>>(
    integrationToken,
    `data_sources/${dataSourceId}/query`,
    {
      method: "POST",
      body,
    },
  );

  const results = (response.results ?? []).map((item) => {
    const parsed = NotionPageResultSchema.parse(item);
    const properties = parsed.properties ?? {};

    return {
      object: parsed.object,
      id: parsed.id,
      title: extractTitleFromProperties(properties),
      url: parsed.url ?? "",
      archived: parsed.archived ?? false,
      in_trash: parsed.in_trash ?? false,
      created_time: parsed.created_time ?? "",
      last_edited_time: parsed.last_edited_time ?? "",
      properties_json: JSON.stringify(properties),
    };
  });

  return OutputType.parse({
    results,
    has_more: response.has_more ?? false,
    next_cursor: response.next_cursor ?? "",
  });
}

function extractSortsArray(
  sortsWrapper: JsonObject | undefined,
): JsonObject[] | undefined {
  if (sortsWrapper === undefined) {
    return undefined;
  }

  const sorts = sortsWrapper.sorts;
  if (!Array.isArray(sorts) || !sorts.every(isJsonObject)) {
    throw new Error('sortsJson must be a JSON object with a "sorts" array');
  }

  return sorts;
}

function extractTitleFromProperties(
  properties: Record<string, unknown>,
): string {
  for (const property of Object.values(properties)) {
    if (!isRecord(property) || property.type !== "title") {
      continue;
    }
    const title = extractRichText(property.title);
    if (title !== "") {
      return title;
    }
  }

  return "";
}

function extractRichText(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return "";
      }
      if (typeof entry.plain_text === "string") {
        return entry.plain_text;
      }
      return "";
    })
    .join("");
}

function isJsonObject(value: unknown): value is JsonObject {
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function isJsonValue(value: unknown): boolean {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
