import { z } from "zod";
import { type NotionListResponse, notionApiRequest } from "../../../client";

const NotionBlockSchema = z.object({
  object: z.literal("block"),
  id: z.string(),
  type: z.string(),
  has_children: z.boolean().default(false),
  archived: z.boolean().default(false),
  in_trash: z.boolean().default(false),
});

export const InputType = z.object({
  integrationToken: z.string().min(1, "Notion integration token is required"),
  blockId: z.string().min(1, "Block ID is required"),
  pageSize: z.number().int().min(1).max(100).default(20),
  cursor: z.string().min(1).optional(),
});

export const OutputType = z.object({
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      text: z.string(),
      has_children: z.boolean(),
      archived: z.boolean(),
      in_trash: z.boolean(),
    }),
  ),
  has_more: z.boolean(),
  next_cursor: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { integrationToken, blockId, pageSize, cursor } =
    await InputType.parseAsync(input);

  const response = await notionApiRequest<NotionListResponse<unknown>>(
    integrationToken,
    `blocks/${blockId}/children`,
    {
      query: {
        page_size: pageSize,
        start_cursor: cursor,
      },
    },
  );

  const blocks = (response.results ?? []).map((block) => {
    const parsed = NotionBlockSchema.parse(block);
    return {
      id: parsed.id,
      type: parsed.type,
      text: extractBlockText(block, parsed.type),
      has_children: parsed.has_children,
      archived: parsed.archived,
      in_trash: parsed.in_trash,
    };
  });

  return OutputType.parse({
    blocks,
    has_more: response.has_more ?? false,
    next_cursor: response.next_cursor ?? "",
  });
}

function extractBlockText(block: unknown, type: string): string {
  if (!isRecord(block)) {
    return "";
  }

  const typedBlock = block[type];
  if (!isRecord(typedBlock)) {
    return "";
  }

  const richText = typedBlock.rich_text;
  if (!Array.isArray(richText)) {
    return "";
  }

  return richText
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
