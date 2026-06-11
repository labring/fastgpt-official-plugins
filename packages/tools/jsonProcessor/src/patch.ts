import { z } from "zod";
import {
  cloneJsonValue,
  JsonInputSchema,
  type JsonValue,
  JsonValueSchema,
  parseJsonInput,
  stringifyJson,
} from "./json";

const PatchOperationSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("add"),
    path: z.string(),
    value: JsonValueSchema,
  }),
  z.object({
    op: z.literal("remove"),
    path: z.string(),
  }),
  z.object({
    op: z.literal("replace"),
    path: z.string(),
    value: JsonValueSchema,
  }),
  z.object({
    op: z.literal("move"),
    from: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal("copy"),
    from: z.string(),
    path: z.string(),
  }),
  z.object({
    op: z.literal("test"),
    path: z.string(),
    value: JsonValueSchema,
  }),
]);

export const JsonPatchInputType = z.object({
  json: JsonInputSchema,
  operations: z.union([z.array(PatchOperationSchema), z.string()]),
  pretty: z.boolean().optional().default(true),
});

export const JsonPatchOutputType = z.object({
  result: JsonValueSchema,
  json: z.string(),
  appliedCount: z.number(),
});

type PatchOperation = z.infer<typeof PatchOperationSchema>;
type ObjectContainer = Record<string, JsonValue>;
type ArrayContainer = JsonValue[];
type Container = ObjectContainer | ArrayContainer;

export async function applyJsonPatch(
  input: z.input<typeof JsonPatchInputType>,
): Promise<z.infer<typeof JsonPatchOutputType>> {
  const { json, operations, pretty } =
    await JsonPatchInputType.parseAsync(input);
  let document = cloneJsonValue(parseJsonInput(json));
  const parsedOperations = parseOperations(operations);

  for (const operation of parsedOperations) {
    document = applyOperation(document, operation);
  }

  return {
    result: document,
    json: stringifyJson(document, pretty),
    appliedCount: parsedOperations.length,
  };
}

function parseOperations(value: PatchOperation[] | string): PatchOperation[] {
  if (Array.isArray(value)) {
    return z.array(PatchOperationSchema).parse(value);
  }

  try {
    return z.array(PatchOperationSchema).parse(JSON.parse(value));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JSON Patch 解析失败: ${error.message}`);
    }
    throw new Error("JSON Patch 解析失败");
  }
}

function applyOperation(
  document: JsonValue,
  operation: PatchOperation,
): JsonValue {
  switch (operation.op) {
    case "add":
      return addValue(
        document,
        operation.path,
        cloneJsonValue(operation.value),
      );
    case "remove":
      return removeValue(document, operation.path);
    case "replace":
      assertPathExists(document, operation.path);
      return addValue(
        removeValue(document, operation.path),
        operation.path,
        cloneJsonValue(operation.value),
      );
    case "move": {
      const value = cloneJsonValue(getValue(document, operation.from));
      const withoutSource = removeValue(document, operation.from);
      return addValue(withoutSource, operation.path, value);
    }
    case "copy":
      return addValue(
        document,
        operation.path,
        cloneJsonValue(getValue(document, operation.from)),
      );
    case "test": {
      const actual = getValue(document, operation.path);
      if (JSON.stringify(actual) !== JSON.stringify(operation.value)) {
        throw new Error(`test 操作失败: ${operation.path} 的值不匹配`);
      }
      return document;
    }
  }
}

function addValue(
  document: JsonValue,
  pointer: string,
  value: JsonValue,
): JsonValue {
  if (pointer === "") {
    return value;
  }

  const { parent, key } = getParent(document, pointer);

  if (Array.isArray(parent)) {
    const index =
      key === "-" ? parent.length : parseArrayIndex(key, parent.length, true);
    parent.splice(index, 0, value);
    return document;
  }

  parent[key] = value;
  return document;
}

function removeValue(document: JsonValue, pointer: string): JsonValue {
  if (pointer === "") {
    return null;
  }

  const { parent, key } = getParent(document, pointer);

  if (Array.isArray(parent)) {
    const index = parseArrayIndex(key, parent.length - 1, false);
    parent.splice(index, 1);
    return document;
  }

  if (!Object.hasOwn(parent, key)) {
    throw new Error(`路径不存在: ${pointer}`);
  }

  delete parent[key];
  return document;
}

function assertPathExists(document: JsonValue, pointer: string): void {
  getValue(document, pointer);
}

function getValue(document: JsonValue, pointer: string): JsonValue {
  if (pointer === "") {
    return document;
  }

  const tokens = parsePointer(pointer);
  let current: JsonValue = document;

  for (const token of tokens) {
    if (Array.isArray(current)) {
      const index = parseArrayIndex(token, current.length - 1, false);
      current = current[index] as JsonValue;
    } else if (isJsonObject(current)) {
      if (!Object.hasOwn(current, token)) {
        throw new Error(`路径不存在: ${pointer}`);
      }
      current = current[token] as JsonValue;
    } else {
      throw new Error(`路径不可访问: ${pointer}`);
    }
  }

  return current;
}

function getParent(
  document: JsonValue,
  pointer: string,
): { parent: Container; key: string } {
  const tokens = parsePointer(pointer);
  const key = tokens.pop();

  if (key === undefined) {
    throw new Error("JSON Pointer 无效");
  }

  let current: JsonValue = document;

  for (const token of tokens) {
    if (Array.isArray(current)) {
      current = current[
        parseArrayIndex(token, current.length - 1, false)
      ] as JsonValue;
    } else if (isJsonObject(current)) {
      if (!Object.hasOwn(current, token)) {
        throw new Error(`路径不存在: ${pointer}`);
      }
      current = current[token] as JsonValue;
    } else {
      throw new Error(`路径不可访问: ${pointer}`);
    }
  }

  if (!Array.isArray(current) && !isJsonObject(current)) {
    throw new Error(`父路径不可写: ${pointer}`);
  }

  return { parent: current, key };
}

function parsePointer(pointer: string): string[] {
  if (!pointer.startsWith("/")) {
    throw new Error(`JSON Pointer 必须以 / 开头: ${pointer}`);
  }

  return pointer
    .slice(1)
    .split("/")
    .map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
}

function parseArrayIndex(
  token: string,
  maxIndex: number,
  _allowAppend: boolean,
): number {
  if (!/^(0|[1-9]\d*)$/.test(token)) {
    throw new Error(`数组索引无效: ${token}`);
  }

  const index = Number(token);
  if (index < 0 || index > maxIndex) {
    throw new Error(`数组索引越界: ${token}`);
  }

  return index;
}

function isJsonObject(value: JsonValue): value is ObjectContainer {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
