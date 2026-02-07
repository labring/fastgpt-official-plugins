import clickhouse from "@clickhouse/client";
import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    url,
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
    const sql = clickhouse.createClient({
      url: url,
      username: username,
      password: password,
      ...(database && { database: database }),
      max_open_connections: maxConnections,
      request_timeout: connectionTimeout,
    });
    const result = await sql
      .query({
        query: _sql,
        format: "JSON",
      })
      .then((res) => res.json());
    await sql.close();
    return { result };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Promise.reject(
        Error(`ClickHouse SQL execution error: ${error.message}`),
      );
    }
    return Promise.reject(
      Error("ClickHouse SQL execution error: An unknown error occurred"),
    );
  }
}
