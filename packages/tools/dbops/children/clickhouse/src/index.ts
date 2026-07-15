import clickhouse from "@clickhouse/client";
import type { ClickHouseInputType, SQLDbOutputType } from "../../../types";

export async function main({
  url,
  username,
  password,
  database,
  sql: _sql,
  maxConnections,
  connectionTimeout,
  ssl,
}: ClickHouseInputType): Promise<SQLDbOutputType> {
  try {
    const sql = clickhouse.createClient({
      url: getClickHouseUrl(url, ssl),
      username: username,
      password: password,
      database: database,
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

function getClickHouseUrl(url: string, ssl: boolean): string {
  return ssl ? url.replace(/^http:/i, "https:") : url;
}
