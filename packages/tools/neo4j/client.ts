import neo4j from "neo4j-driver";
import { z } from "zod";

const MUTATING_CLAUSE_PATTERNS = [
  /(?:^|[\s;{])CREATE\b/i,
  /(?:^|[\s;{])MERGE\b/i,
  /(?:^|[\s;{])SET\b/i,
  /(?:^|[\s;{])(?:DETACH\s+)?DELETE\b/i,
  /(?:^|[\s;{])REMOVE\b/i,
  /(?:^|[\s;{])DROP\b/i,
  /(?:^|[\s;{])LOAD\s+CSV\b/i,
  /(?:^|[\s;{])FOREACH\b/i,
] as const;

const WRITE_PROCEDURE_PATTERN =
  /\bCALL\s+(?:apoc\.(?:create|merge|refactor|periodic|schema|trigger)|db\.(?:create|drop)|dbms\.)/i;

function emptyToUndefined(value: unknown): unknown {
  return value === "" || value === null ? undefined : value;
}

function parseParameters(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (typeof value !== "string") {
    return value;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Parameters must be a valid JSON object string");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Parameters must be a JSON object");
  }

  return parsed;
}

export const BaseNeo4jInputSchema = z.object({
  uri: z
    .string()
    .trim()
    .min(1, "Neo4j URI is required")
    .refine(
      (value) => /^(neo4j|bolt)(\+s|\+ssc)?:\/\//i.test(value),
      "Neo4j URI must start with neo4j://, neo4j+s://, neo4j+ssc://, bolt://, bolt+s:// or bolt+ssc://",
    ),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  cypher: z
    .string()
    .trim()
    .min(1, "Cypher is required")
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.endsWith(";") ? trimmed.slice(0, -1).trim() : trimmed;
    }),
  parameters: z.preprocess(
    parseParameters,
    z.record(z.string(), z.unknown()).default({}),
  ),
  connectionTimeout: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(10000),
  ),
  maxTransactionRetryTime: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().nonnegative().default(30000),
  ),
});

export const CypherOutputSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())),
  summary: z.record(z.string(), z.unknown()),
});

export type Neo4jInputType = z.infer<typeof BaseNeo4jInputSchema>;
export type CypherOutputType = z.infer<typeof CypherOutputSchema>;
export type CypherAccessMode = "read" | "write";

type Neo4jResult = {
  records: Array<{
    keys: string[];
    get: (key: string) => unknown;
  }>;
  summary: Record<string, unknown>;
};

export function stripCypherCommentsAndLiterals(cypher: string): string {
  let output = "";
  let state:
    | "normal"
    | "single"
    | "double"
    | "backtick"
    | "lineComment"
    | "blockComment" = "normal";

  for (let index = 0; index < cypher.length; index++) {
    const char = cypher[index];
    const next = cypher[index + 1];

    if (state === "lineComment") {
      if (char === "\n") {
        state = "normal";
        output += "\n";
      } else {
        output += " ";
      }
      continue;
    }

    if (state === "blockComment") {
      if (char === "*" && next === "/") {
        state = "normal";
        output += "  ";
        index++;
      } else {
        output += " ";
      }
      continue;
    }

    if (state === "single" || state === "double" || state === "backtick") {
      const endChar = state === "single" ? "'" : state === "double" ? '"' : "`";

      if (char === "\\" && state !== "backtick") {
        output += " ";
        if (next !== undefined) {
          output += " ";
          index++;
        }
        continue;
      }

      output += " ";
      if (char === endChar) {
        state = "normal";
      }
      continue;
    }

    if (char === "/" && next === "/") {
      state = "lineComment";
      output += "  ";
      index++;
      continue;
    }

    if (char === "/" && next === "*") {
      state = "blockComment";
      output += "  ";
      index++;
      continue;
    }

    if (char === "'") {
      state = "single";
      output += " ";
      continue;
    }

    if (char === '"') {
      state = "double";
      output += " ";
      continue;
    }

    if (char === "`") {
      state = "backtick";
      output += " ";
      continue;
    }

    output += char;
  }

  return output;
}

export function assertReadOnlyCypher(cypher: string): void {
  const normalized = stripCypherCommentsAndLiterals(cypher);
  const hasMutatingClause = MUTATING_CLAUSE_PATTERNS.some((pattern) =>
    pattern.test(normalized),
  );

  if (hasMutatingClause || WRITE_PROCEDURE_PATTERN.test(normalized)) {
    throw new Error(
      "Read Cypher cannot contain mutating operations. Use the Write Cypher tool for data changes.",
    );
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function serializeNeo4jValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (neo4j.isInt(value)) {
    return value.inSafeRange() ? value.toNumber() : value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeNeo4jValue(item));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  if ("identity" in value && "labels" in value && "properties" in value) {
    return {
      identity: serializeNeo4jValue(value.identity),
      labels: serializeNeo4jValue(value.labels),
      properties: serializeNeo4jValue(value.properties),
    };
  }

  if (
    "identity" in value &&
    "type" in value &&
    "start" in value &&
    "end" in value
  ) {
    return {
      identity: serializeNeo4jValue(value.identity),
      type: serializeNeo4jValue(value.type),
      start: serializeNeo4jValue(value.start),
      end: serializeNeo4jValue(value.end),
      properties: serializeNeo4jValue(value.properties),
    };
  }

  if ("segments" in value && "start" in value && "end" in value) {
    return {
      start: serializeNeo4jValue(value.start),
      end: serializeNeo4jValue(value.end),
      segments: serializeNeo4jValue(value.segments),
    };
  }

  const serialized: Record<string, unknown> = {};
  for (const [key, childValue] of Object.entries(value)) {
    if (typeof childValue !== "function") {
      serialized[key] = serializeNeo4jValue(childValue);
    }
  }

  return serialized;
}

function serializeSummary(
  summary: Record<string, unknown>,
): Record<string, unknown> {
  const counters = summary.counters as
    | {
        updates?: () => Record<string, unknown>;
        containsUpdates?: () => boolean;
        containsSystemUpdates?: () => boolean;
      }
    | undefined;
  const database = summary.database as { name?: string } | undefined;

  return {
    queryType: serializeNeo4jValue(summary.queryType),
    counters: {
      ...(counters?.updates?.() ?? {}),
      containsUpdates: counters?.containsUpdates?.() ?? false,
      containsSystemUpdates: counters?.containsSystemUpdates?.() ?? false,
    },
    database: database?.name,
    resultAvailableAfter: serializeNeo4jValue(summary.resultAvailableAfter),
    resultConsumedAfter: serializeNeo4jValue(summary.resultConsumedAfter),
  };
}

function toRows(result: Neo4jResult): Record<string, unknown>[] {
  return result.records.map((record) => {
    const row: Record<string, unknown> = {};
    for (const key of record.keys) {
      row[key] = serializeNeo4jValue(record.get(key));
    }
    return row;
  });
}

function handleNeo4jError(error: unknown): Error {
  if (error instanceof Error) {
    return new Error(`Neo4j Cypher execution error: ${error.message}`);
  }

  if (typeof error === "string") {
    return new Error(`Neo4j Cypher execution error: ${error}`);
  }

  return new Error("Neo4j Cypher execution error: An unknown error occurred");
}

export async function executeCypher(
  {
    uri,
    username,
    password,
    database,
    cypher,
    parameters,
    connectionTimeout,
    maxTransactionRetryTime,
  }: Neo4jInputType,
  mode: CypherAccessMode,
): Promise<CypherOutputType> {
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    connectionTimeout,
    maxTransactionRetryTime,
  });
  const session = driver.session({
    ...(database ? { database } : {}),
    defaultAccessMode:
      mode === "read" ? neo4j.session.READ : neo4j.session.WRITE,
  });

  try {
    await driver.verifyConnectivity();
    const result = (mode === "read"
      ? await session.executeRead((transaction) =>
          transaction.run(cypher, parameters),
        )
      : await session.executeWrite((transaction) =>
          transaction.run(cypher, parameters),
        )) as unknown as Neo4jResult;

    return {
      rows: toRows(result),
      summary: serializeSummary(result.summary),
    };
  } catch (error) {
    return Promise.reject(handleNeo4jError(error));
  } finally {
    await session.close();
    await driver.close();
  }
}
