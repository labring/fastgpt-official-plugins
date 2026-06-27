import { z } from "zod";
import {
  compactObject,
  type JsonObject,
  notionApiRequest,
  parseJsonArrayInput,
  parseJsonObjectInput,
} from "../../../client";

const NotionCreatedPageSchema = z.object({
  object: z.literal("page"),
  id: z.string(),
  url: z.string().default(""),
  archived: z.boolean().default(false),
  in_trash: z.boolean().default(false),
  created_time: z.string().default(""),
  last_edited_time: z.string().default(""),
});

export const InputType = z.object({
  integrationToken: z.string().min(1, "Notion integration token is required"),
  parentType: z.enum(["page_id", "data_source_id"]),
  parentId: z.string().min(1, "Parent ID is required"),
  propertiesJson: z.string().min(1, "propertiesJson is required"),
  childrenJson: z.string().optional(),
});

export const OutputType = z.object({
  id: z.string(),
  url: z.string(),
  archived: z.boolean(),
  in_trash: z.boolean(),
  created_time: z.string(),
  last_edited_time: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const {
    integrationToken,
    parentType,
    parentId,
    propertiesJson,
    childrenJson,
  } = await InputType.parseAsync(input);

  const properties = parseJsonObjectInput(propertiesJson, "propertiesJson");
  if (properties === undefined) {
    throw new Error("propertiesJson is required");
  }

  const children = parseJsonArrayInput(childrenJson, "childrenJson");
  const parent: JsonObject = { [parentType]: parentId };
  const response = await notionApiRequest<unknown>(integrationToken, "pages", {
    method: "POST",
    body: compactObject({
      parent,
      properties,
      children,
    }),
  });
  const parsed = NotionCreatedPageSchema.parse(response);

  return OutputType.parse({
    id: parsed.id,
    url: parsed.url,
    archived: parsed.archived,
    in_trash: parsed.in_trash,
    created_time: parsed.created_time,
    last_edited_time: parsed.last_edited_time,
  });
}
