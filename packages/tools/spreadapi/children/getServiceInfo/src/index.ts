import { z } from "zod";
import {
  buildInfoUrl,
  handleSpreadApiError,
  requestSpreadApi,
  withServiceToken,
} from "../../../client";
import type { GetServiceInfoResponse } from "../../../types";

const objectSchema = z.record(z.string(), z.any());

export const InputType = z.object({
  spreadapiApiKey: z.string().optional().nullable(),
  serviceUrl: z.string().url("serviceUrl must be a valid URL"),
  infoPath: z.string().optional().default(""),
  query: objectSchema.optional().default({}),
  timeout: z.number().int().positive().optional().default(30000),
  serviceToken: z.string().optional().nullable(),
  includeTokenMode: z.enum(["none", "query"]).default("none"),
});

export const OutputType = z.object({
  info: z.any(),
  status: z.number(),
  data: z.any(),
});

export async function tool({
  spreadapiApiKey,
  serviceUrl,
  infoPath,
  query,
  timeout,
  serviceToken,
  includeTokenMode,
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const url = buildInfoUrl(serviceUrl, infoPath);
    const requestQuery = withServiceToken(
      query,
      serviceToken,
      includeTokenMode,
    );
    const response = await requestSpreadApi({
      apiKey: spreadapiApiKey,
      url,
      method: "GET",
      query: requestQuery,
      timeout,
    });

    return formatServiceInfoResponse(response.status, response.data);
  } catch (error) {
    return Promise.reject(handleSpreadApiError(error));
  }
}

function formatServiceInfoResponse(
  status: number,
  data: any,
): GetServiceInfoResponse {
  return {
    info: data,
    status,
    data,
  };
}
