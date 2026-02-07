import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { z } from "zod";
import type { Input, Output } from "./schemas";
import { InputSchema } from "./schemas";

const FluxStatus = z.enum(["Pending", "Ready", "Error", "Failed"]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// API schemas
const GenerationRequestSchema = z.object({
  id: z.string(),
  polling_url: z.string().url(),
});

const FluxResultSchema = z.object({
  status: FluxStatus,
  result: z
    .object({
      sample: z.string().url(),
    })
    .nullable()
    .optional(),
  error: z.string().optional(),
});

export async function handler(
  params: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    const requestBodySchema = InputSchema.omit({ apiKey: true });
    const requestBody = requestBodySchema.parse(params);

    const response = await fetch("https://api.bfl.ai/v1/flux-kontext-pro", {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-key": params.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return Promise.reject({
        error: `HTTP error! status: ${response.status}`,
      });
    }

    const { polling_url } = GenerationRequestSchema.parse(
      await response.json(),
    );

    // polling result
    for (let attempts = 0; attempts < 120; attempts++) {
      await delay(500);

      const pollResponse = await fetch(polling_url, {
        headers: {
          accept: "application/json",
          "x-key": params.apiKey,
        },
      });

      if (!pollResponse.ok) {
        return Promise.reject({
          error: `Polling failed: ${pollResponse.status}`,
        });
      }

      const result = FluxResultSchema.parse(await pollResponse.json());

      // check status using Zod enum
      switch (result.status) {
        case FluxStatus.enum.Ready:
          if (result.result?.sample) {
            return {
              image_url: result.result.sample,
            };
          }
          break;
        case FluxStatus.enum.Error:
        case FluxStatus.enum.Failed:
          return Promise.reject({
            error: result.error || "Image generation failed",
          });
        case FluxStatus.enum.Pending:
          // continue polling
          break;
      }
    }

    return Promise.reject({
      error: "Image generation timeout, please try again later",
    });
  } catch (error: any) {
    return Promise.reject({
      error,
    });
  }
}
