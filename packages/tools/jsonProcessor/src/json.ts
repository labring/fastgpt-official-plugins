import { z } from "zod";

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const JsonInputSchema = z.union([JsonValueSchema, z.string()]);

export function parseJsonInput(
  value: z.infer<typeof JsonInputSchema>,
): JsonValue {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("JSON 内容不能为空");
  }

  try {
    return JSON.parse(trimmed) as JsonValue;
  } catch (error) {
    throw new Error(`JSON 解析失败: ${getErrorMessage(error)}`);
  }
}

export function cloneJsonValue(value: JsonValue): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

export function stringifyJson(value: JsonValue, pretty = true): string {
  return JSON.stringify(value, null, pretty ? 2 : 0);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error";
}
