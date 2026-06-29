import { z } from "zod";
import {
  createAirtableClient,
  handleAirtableError,
  listRecords,
} from "../../../client";

const sortSchema = z.union([
  z.array(
    z.object({
      field: z.string().min(1),
      direction: z.enum(["asc", "desc"]).optional().nullable(),
    }),
  ),
  z.string(),
]);

export const InputType = z.object({
  token: z.string().min(1, "Airtable token is required"),
  baseId: z.string().min(1, "baseId is required"),
  tableIdOrName: z.string().min(1, "tableIdOrName is required"),
  maxRecords: z.number().int().positive().max(100).optional().nullable(),
  pageSize: z.number().int().positive().max(100).optional().nullable(),
  filterByFormula: z.string().optional().nullable(),
  view: z.string().optional().nullable(),
  sort: sortSchema.optional().nullable(),
});

export const OutputType = z.object({
  records: z.array(
    z.object({
      id: z.string(),
      createdTime: z.string().optional(),
      fields: z.record(z.string(), z.unknown()),
    }),
  ),
  offset: z.string().nullable(),
  count: z.number(),
});

export async function tool({
  token,
  baseId,
  tableIdOrName,
  maxRecords,
  pageSize,
  filterByFormula,
  view,
  sort,
}: z.infer<typeof InputType>, _ctx?: unknown): Promise<
  z.infer<typeof OutputType>
> {
  try {
    const client = createAirtableClient(token);

    return await listRecords({
      client,
      baseId,
      tableIdOrName,
      maxRecords,
      pageSize,
      filterByFormula,
      view,
      sort,
    });
  } catch (error) {
    return Promise.reject(handleAirtableError(error));
  }
}
