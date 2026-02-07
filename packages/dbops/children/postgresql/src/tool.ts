import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import postgres from "postgres";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    host,
    port,
    username,
    password,
    database,
    sql: _sql,
    maxConnections,
    connectionTimeout,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    const sql = postgres({
      host,
      port,
      db: database,
      user: username,
      pass: password,
      max: maxConnections,
      connect_timeout: connectionTimeout,
    });
    const result = await sql.unsafe(_sql);
    await sql.end();
    return { result };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Promise.reject(
        Error(`PostgreSQL SQL execution error: ${error.message}`),
      );
    }
    return Promise.reject(
      Error("PostgreSQL SQL execution error: An unknown error occurred"),
    );
  }
}
