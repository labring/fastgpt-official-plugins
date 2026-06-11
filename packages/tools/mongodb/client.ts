import { type Document, EJSON } from "bson";
import { type Db, MongoClient, type MongoClientOptions } from "mongodb";
import { z } from "zod";

const emptyStringToUndefined = (value: unknown) =>
  value === "" ? undefined : value;

export const optionalStringSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().optional(),
);

export const booleanSchema = (defaultValue = false) =>
  z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") {
        return true;
      }
      if (normalized === "false") {
        return false;
      }
    }
    return value;
  }, z.boolean().default(defaultValue));

export const intSchema = (defaultValue: number, max: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(0).max(max).default(defaultValue),
  );

export const timeoutSchema = (defaultValue: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().positive().max(300000).default(defaultValue),
  );

export const MongoConnectionInputSchema = z.object({
  connectionUri: z.string().min(1, "MongoDB connection URI is required"),
  database: z.string().min(1, "Database is required"),
  connectTimeoutMS: timeoutSchema(10000),
  socketTimeoutMS: timeoutSchema(30000),
});

export type MongoConnectionInputType = z.infer<
  typeof MongoConnectionInputSchema
>;

export const MongoCollectionInputSchema = MongoConnectionInputSchema.extend({
  collection: z.string().min(1, "Collection is required"),
});

export const MongoOutputType = z.object({
  result: z.any(),
});

export type MongoOutputType = z.infer<typeof MongoOutputType>;

export async function withMongo<T>(
  input: MongoConnectionInputType,
  run: (db: Db) => Promise<T>,
): Promise<T> {
  const options: MongoClientOptions = {
    connectTimeoutMS: input.connectTimeoutMS,
    serverSelectionTimeoutMS: input.connectTimeoutMS,
    socketTimeoutMS: input.socketTimeoutMS,
  };
  const client = new MongoClient(input.connectionUri, options);

  try {
    await client.connect();
    return await run(client.db(input.database));
  } finally {
    await client.close();
  }
}

export function parseDocumentJson(value: string, fieldName: string): Document {
  const parsed = parseEjson(value, fieldName);
  if (!isDocument(parsed)) {
    throw new Error(`${fieldName} must be a JSON object`);
  }
  return parsed;
}

export function parseOptionalDocumentJson(
  value: string | undefined,
  fieldName: string,
) {
  if (!value || value.trim() === "") {
    return undefined;
  }
  return parseDocumentJson(value, fieldName);
}

export function parsePipelineJson(value: string): Document[] {
  const parsed = parseEjson(value, "pipeline");
  if (!Array.isArray(parsed) || !parsed.every(isDocument)) {
    throw new Error("pipeline must be a JSON array of objects");
  }
  return parsed;
}

export function parseDocumentsJson(value: string): Document | Document[] {
  const parsed = parseEjson(value, "documents");
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error("documents array cannot be empty");
    }
    if (!parsed.every(isDocument)) {
      throw new Error("documents array must contain JSON objects");
    }
    return parsed;
  }
  if (!isDocument(parsed)) {
    throw new Error("documents must be a JSON object or an array of objects");
  }
  return parsed;
}

export function parseUpdateJson(value: string): Document | Document[] {
  const parsed = parseEjson(value, "update");
  if (Array.isArray(parsed)) {
    if (parsed.length === 0 || !parsed.every(isDocument)) {
      throw new Error(
        "update pipeline must be a non-empty JSON array of objects",
      );
    }
    return parsed;
  }
  if (!isDocument(parsed)) {
    throw new Error("update must be a JSON object or pipeline array");
  }
  if (!Object.keys(parsed).some((key) => key.startsWith("$"))) {
    throw new Error(
      "update must use MongoDB update operators such as $set, $inc or $unset",
    );
  }
  return parsed;
}

export function assertSafeFilter(
  filter: Document,
  allowEmptyFilter: boolean,
  operation: string,
) {
  if (!allowEmptyFilter && Object.keys(filter).length === 0) {
    throw new Error(
      `${operation} requires a non-empty filter or allowEmptyFilter=true`,
    );
  }
}

export function toSerializable(value: unknown): unknown {
  return JSON.parse(EJSON.stringify(value, { relaxed: true }));
}

export function formatMongoError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown MongoDB error";
}

function parseEjson(value: string, fieldName: string): unknown {
  try {
    return EJSON.parse(value, { relaxed: true });
  } catch (error) {
    throw new Error(
      `${fieldName} is not valid JSON: ${formatMongoError(error)}`,
    );
  }
}

function isDocument(value: unknown): value is Document {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
