import mssql from "mssql";
import type { SQLDbOutputType, SQLServerInputType } from "../../../types";

export async function main({
  host,
  port,
  username,
  password,
  database,
  sql: _sql,
  maxConnections,
  connectionTimeout,
  domain,
  instanceName,
  ssl,
}: SQLServerInputType): Promise<SQLDbOutputType> {
  try {
    const sql = await mssql.connect({
      port,
      domain,
      server: host,
      user: username,
      password: password,
      database: database,
      connectionTimeout: connectionTimeout,
      options: getSqlServerOptions(instanceName, ssl),
      pool: {
        max: maxConnections,
      },
    });
    const result = await sql.query(_sql);
    await sql.close();
    return { result };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return Promise.reject(
        new Error(`Microsoft SQL Server SQL execution error: ${error.message}`),
      );
    }
    return Promise.reject(
      new Error(
        "Microsoft SQL Server SQL execution error: An unknown error occurred",
      ),
    );
  }
}

export function getSqlServerOptions(
  instanceName: string | undefined,
  ssl: boolean,
) {
  return {
    ...(instanceName === undefined ? {} : { instanceName }),
    trustServerCertificate: true,
    encrypt: ssl,
  };
}
