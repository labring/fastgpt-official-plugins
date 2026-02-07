import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import mssql from "mssql"; // SQL Server 客户端
import mysql from "mysql2/promise"; // MySQL 客户端
import { Client as PgClient } from "pg"; // PostgreSQL 客户端
import type { Input, Output } from "./schemas";

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { databaseName, databaseType, host, password, port, sql, user } = input;

  let result: unknown;
  try {
    if (databaseType === "PostgreSQL") {
      const client = new PgClient({
        host,
        port,
        database: databaseName,
        user,
        password,
        connectionTimeoutMillis: 30000,
      });

      await client.connect();
      const res = await client.query(sql);
      result = res.rows;
      await client.end();
    } else if (databaseType === "MySQL") {
      const connection = await mysql.createConnection({
        host,
        port,
        database: databaseName,
        user,
        password,
        connectTimeout: 30000,
      });

      const [rows] = await connection.execute(sql);
      result = rows;
      await connection.end();
    } else if (databaseType === "Microsoft SQL Server") {
      const pool = await mssql.connect({
        server: host,
        port,
        database: databaseName,
        user,
        password,
        options: {
          trustServerCertificate: true,
        },
      });

      result = await pool.query(sql);
      await pool.close();
    }
    return {
      result,
    };
  } catch (error: unknown) {
    // 使用类型断言来处理错误
    if (error instanceof Error) {
      console.error("Database query error:", error.message);
      return Promise.reject(error.message);
    }
    console.error("Database query error:", error);
    return Promise.reject("An unknown error occurred");
  }
}
