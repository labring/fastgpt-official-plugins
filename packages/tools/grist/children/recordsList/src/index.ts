import { z } from "zod";
import {
  buildRecordsPath,
  createGristClient,
  handleGristError,
  parseGristObjectInput,
} from "../../../client";
import type { GristRecordsResponse } from "../../../types";

const objectInputSchema = z
  .union([z.record(z.string(), z.unknown()), z.string()])
  .optional()
  .nullable();

export const InputType = z.object({
  gristApiKey: z.string().min(1, "Grist API key is required"),
  docId: z.string().min(1, "Document ID is required"),
  tableId: z.string().min(1, "Table ID is required"),
  gristBaseUrl: z.string().optional().nullable(),
  limit: z.number().int().positive().optional().nullable(),
  sort: z.string().optional().nullable(),
  filter: objectInputSchema,
  viewSection: z.number().int().positive().optional().nullable(),
});

export const OutputType = z.object({
  records: z.array(
    z.object({
      id: z.number(),
      fields: z.record(z.string(), z.unknown()),
    }),
  ),
  success: z.boolean(),
});

export async function tool({
  gristApiKey,
  docId,
  tableId,
  gristBaseUrl,
  limit,
  sort,
  filter,
  viewSection,
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const client = createGristClient(gristApiKey, gristBaseUrl);
    const params: Record<string, string | number> = {};

    if (limit) {
      params.limit = limit;
    }

    if (sort?.trim()) {
      params.sort = sort.trim();
    }

    const filterObject = parseGristObjectInput(filter, "filter");
    if (filterObject) {
      params.filter = JSON.stringify(filterObject);
    }

    if (viewSection) {
      params.viewSection = viewSection;
    }

    const response = await client.get<GristRecordsResponse>(
      buildRecordsPath(docId, tableId),
      {
        params,
      },
    );

    return {
      records: response.data.records || [],
      success: true,
    };
  } catch (error) {
    return Promise.reject(handleGristError(error));
  }
}
