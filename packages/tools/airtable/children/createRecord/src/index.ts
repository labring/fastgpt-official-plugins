import { z } from "zod";
import {
  createAirtableClient,
  createRecord,
  handleAirtableError,
} from "../../../client";

const fieldsInputSchema = z.union([
  z.record(z.string(), z.unknown()),
  z.string(),
]);

export const InputType = z.object({
  token: z.string().min(1, "Airtable token is required"),
  baseId: z.string().min(1, "baseId is required"),
  tableIdOrName: z.string().min(1, "tableIdOrName is required"),
  fields: fieldsInputSchema,
  typecast: z.boolean().optional().nullable(),
});

export const OutputType = z.object({
  record: z.object({
    id: z.string(),
    createdTime: z.string().optional(),
    fields: z.record(z.string(), z.unknown()),
  }),
  success: z.boolean(),
});

export async function tool({
  token,
  baseId,
  tableIdOrName,
  fields,
  typecast,
}: z.infer<typeof InputType>, _ctx?: unknown): Promise<
  z.infer<typeof OutputType>
> {
  try {
    const client = createAirtableClient(token);

    return await createRecord({
      client,
      baseId,
      tableIdOrName,
      fields,
      typecast,
    });
  } catch (error) {
    return Promise.reject(handleAirtableError(error));
  }
}
