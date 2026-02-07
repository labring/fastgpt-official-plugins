import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { z } from "zod";
import type { Input, Output } from "./schemas";
import { InputSchema } from "./schemas";

const FluxStatus = z.enum(["Pending", "Ready", "Error", "Failed"]);

// Helper function to convert image to base64
async function imageToBase64(input: string): Promise<string> {
  // If it's already base64 (doesn't start with http/https), return as is
  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    return input;
  }

  // If it's a URL, fetch and convert to base64
  try {
    const response = await fetch(input);
    if (!response.ok) {
      return Promise.reject(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert to base64
    let binary = "";
    uint8Array.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  } catch (error) {
    return Promise.reject(
      `Failed to process image URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

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
    // Convert input_image to base64 if needed
    const base64Image = await imageToBase64(params.input_image);

    const requestBodySchema = InputSchema.omit({ apiKey: true });
    const requestBody = requestBodySchema.parse({
      ...params,
      input_image: base64Image,
    });

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
      return Promise.reject(`HTTP error! status: ${response.status}`);
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
        return Promise.reject(`Polling failed: ${pollResponse.status}`);
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
            error: result.error || "Image editing failed",
          });
        case FluxStatus.enum.Pending:
          // continue polling
          break;
      }
    }

    return Promise.reject({
      error: "Image editing timeout, please try again later",
    });
  } catch (error: unknown) {
    return Promise.reject({
      error,
    });
  }
}
