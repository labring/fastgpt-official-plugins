import { z } from "zod";
import {
  buildRecordsPath,
  createGristClient,
  handleGristError,
  parseGristObjectInput,
} from "../../../client";
import type {
  GristRecordIdsResponse,
  GristRecordsCreateRequest,
} from "../../../types";

const fieldsInputSchema = z.union([
  z.record(z.string(), z.unknown()),
  z.string(),
]);

export const InputType = z.object({
  gristApiKey: z.string().min(1, "Grist API key is required"),
  docId: z.string().min(1, "Document ID is required"),
  tableId: z.string().min(1, "Table ID is required"),
  fields: fieldsInputSchema,
  gristBaseUrl: z.string().optional().nullable(),
});

export const OutputType = z.object({
  result: z.any(),
  success: z.boolean(),
});

export async function tool({
  gristApiKey,
  docId,
  tableId,
  fields,
  gristBaseUrl,
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const client = createGristClient(gristApiKey, gristBaseUrl);
    const fieldsObject = parseGristObjectInput(fields, "fields");

    if (!fieldsObject) {
      throw new Error("fields is required");
    }

    const body: GristRecordsCreateRequest = {
      records: [{ fields: fieldsObject }],
    };

    const response = await client.post<GristRecordIdsResponse>(
      buildRecordsPath(docId, tableId),
      body,
    );

    return {
      result: response.data,
      success: true,
    };
  } catch (error) {
    return Promise.reject(handleGristError(error));
  }
}
