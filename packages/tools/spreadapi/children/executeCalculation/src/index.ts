import { z } from "zod";
import {
  buildExecuteUrl,
  handleSpreadApiError,
  requestSpreadApi,
  withServiceToken,
} from "../../../client";
import type { ExecuteCalculationResponse } from "../../../types";

const objectSchema = z.record(z.string(), z.any());

export const InputType = z.object({
  spreadapiApiKey: z.string().optional().nullable(),
  serviceUrl: z.string().url("serviceUrl must be a valid URL"),
  method: z.enum(["POST", "GET"]).default("POST"),
  inputs: objectSchema.optional().default({}),
  query: objectSchema.optional().default({}),
  timeout: z.number().int().positive().optional().default(30000),
  serviceToken: z.string().optional().nullable(),
  includeTokenMode: z.enum(["none", "query", "body"]).default("none"),
});

export const OutputType = z.object({
  result: z.any(),
  status: z.number(),
  data: z.any(),
});

export async function tool({
  spreadapiApiKey,
  serviceUrl,
  method,
  inputs,
  query,
  timeout,
  serviceToken,
  includeTokenMode,
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  try {
    const requestQuery =
      method === "GET"
        ? withServiceToken(
            { ...query, ...inputs },
            serviceToken,
            includeTokenMode === "query" ? "query" : "none",
          )
        : withServiceToken(
            query,
            serviceToken,
            includeTokenMode === "query" ? "query" : "none",
          );

    const requestBody =
      method === "POST"
        ? {
            inputs,
            ...(includeTokenMode === "body" && serviceToken
              ? { token: serviceToken }
              : {}),
          }
        : undefined;

    const response = await requestSpreadApi({
      apiKey: spreadapiApiKey,
      url: buildExecuteUrl(serviceUrl),
      method,
      query: requestQuery,
      body: requestBody,
      timeout,
    });

    return formatExecuteResponse(response.status, response.data);
  } catch (error) {
    return Promise.reject(handleSpreadApiError(error));
  }
}

function formatExecuteResponse(
  status: number,
  data: any,
): ExecuteCalculationResponse {
  return {
    result: data?.outputs ?? data?.result ?? data,
    status,
    data,
  };
}
