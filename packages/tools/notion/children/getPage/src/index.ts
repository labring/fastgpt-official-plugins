import { z } from "zod";
import { notionApiRequest } from "../../../client";

const NotionPageSchema = z.object({
  object: z.literal("page"),
  id: z.string(),
  url: z.string().default(""),
  archived: z.boolean().default(false),
  in_trash: z.boolean().default(false),
  created_time: z.string().default(""),
  last_edited_time: z.string().default(""),
  properties: z.record(z.string(), z.unknown()).default({}),
});

export const InputType = z.object({
  integrationToken: z.string().min(1, "Notion integration token is required"),
  pageId: z.string().min(1, "Page ID is required"),
});

export const OutputType = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  archived: z.boolean(),
  in_trash: z.boolean(),
  created_time: z.string(),
  last_edited_time: z.string(),
  properties_json: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { integrationToken, pageId } = await InputType.parseAsync(input);
  const page = await notionApiRequest<unknown>(
    integrationToken,
    `pages/${pageId}`,
  );
  const parsed = NotionPageSchema.parse(page);

  return OutputType.parse({
    id: parsed.id,
    title: extractTitleFromProperties(parsed.properties),
    url: parsed.url,
    archived: parsed.archived,
    in_trash: parsed.in_trash,
    created_time: parsed.created_time,
    last_edited_time: parsed.last_edited_time,
    properties_json: JSON.stringify(parsed.properties),
  });
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
