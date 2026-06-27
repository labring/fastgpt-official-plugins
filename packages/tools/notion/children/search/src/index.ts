import { z } from "zod";
import {
  compactObject,
  type NotionListResponse,
  notionApiRequest,
} from "../../../client";

const NotionSearchItemSchema = z.object({
  object: z.enum(["page", "database", "data_source"]),
  id: z.string(),
  url: z.string().optional(),
  archived: z.boolean().optional(),
  in_trash: z.boolean().optional(),
  created_time: z.string().optional(),
  last_edited_time: z.string().optional(),
});

export const InputType = z.object({
  integrationToken: z.string().min(1, "Notion integration token is required"),
  query: z.string().optional(),
  objectType: z.enum(["page", "database", "data_source"]).optional(),
  pageSize: z.number().int().min(1).max(100).default(10),
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
    }),
  ),
  has_more: z.boolean(),
  next_cursor: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { integrationToken, query, objectType, pageSize, cursor } =
    await InputType.parseAsync(input);

  const body = compactObject({
    query,
    page_size: pageSize,
    start_cursor: cursor,
    filter:
      objectType === undefined
        ? undefined
        : {
            property: "object",
            value: objectType,
          },
  });

  const response = await notionApiRequest<NotionListResponse<unknown>>(
    integrationToken,
    "search",
    {
      method: "POST",
      body,
    },
  );

  const results = (response.results ?? []).map((item) => {
    const parsed = NotionSearchItemSchema.parse(item);

    return {
      object: parsed.object,
      id: parsed.id,
      title: extractTitle(item),
      url: parsed.url ?? "",
      archived: parsed.archived ?? false,
      in_trash: parsed.in_trash ?? false,
      created_time: parsed.created_time ?? "",
      last_edited_time: parsed.last_edited_time ?? "",
    };
  });

  return OutputType.parse({
    results,
    has_more: response.has_more ?? false,
    next_cursor: response.next_cursor ?? "",
  });
}

function extractTitle(item: unknown): string {
  if (!isRecord(item)) {
    return "";
  }

  if (isRecord(item.properties)) {
    for (const property of Object.values(item.properties)) {
      if (!isRecord(property)) {
        continue;
      }
      const title = extractTextArrayTitle(property.title);
      if (title !== "") {
        return title;
      }
    }
  }

  const directTitle = extractTextArrayTitle(item.title);
  if (directTitle !== "") {
    return directTitle;
  }

  return "";
}

function extractTextArrayTitle(value: unknown): string {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
