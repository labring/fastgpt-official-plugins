import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mysql: {
    createConnection: vi.fn(),
    execute: vi.fn(),
    end: vi.fn(),
  },
  postgres: vi.fn(),
  oracle: {
    NUMBER: 1,
    DATE: 2,
    OUT_FORMAT_OBJECT: 3,
    fetchAsString: [] as unknown[],
    outFormat: 0,
    createPool: vi.fn(),
  },
  clickhouse: {
    createClient: vi.fn(),
    query: vi.fn(),
    json: vi.fn(),
    close: vi.fn(),
  },
}));

vi.mock("mysql2/promise", () => ({
  default: mocks.mysql,
}));

vi.mock("postgres", () => ({
  default: mocks.postgres,
}));

vi.mock("oracledb", () => ({
  default: mocks.oracle,
}));

vi.mock("@clickhouse/client", () => ({
  default: mocks.clickhouse,
}));

import { main as clickhouseMain } from "../children/clickhouse/src";
import { main as mysqlMain } from "../children/mysql/src";
import { main as oracleMain } from "../children/oracle/src";
import { main as postgresqlMain } from "../children/postgresql/src";
import { getSqlServerOptions } from "../children/sqlserver/src";
import { BaseSQLDbInputSchema } from "../types";

describe("dbops SSL configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mysql.createConnection.mockResolvedValue({
      execute: mocks.mysql.execute,
      end: mocks.mysql.end,
    });
    mocks.mysql.execute.mockResolvedValue([[]]);
    mocks.mysql.end.mockResolvedValue(undefined);

    mocks.postgres.mockReturnValue({
      unsafe: vi.fn().mockResolvedValue([]),
      end: vi.fn().mockResolvedValue(undefined),
    });

    mocks.oracle.createPool.mockResolvedValue({
      getConnection: vi.fn().mockResolvedValue({
        execute: vi.fn().mockResolvedValue({ rows: [], metaData: [] }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    });

    mocks.clickhouse.createClient.mockReturnValue({
      query: mocks.clickhouse.query,
      close: mocks.clickhouse.close,
    });
    mocks.clickhouse.query.mockResolvedValue({
      json: mocks.clickhouse.json,
    });
    mocks.clickhouse.json.mockResolvedValue([]);
    mocks.clickhouse.close.mockResolvedValue(undefined);
  });

  it("defaults SSL to false for existing configurations", () => {
    const result = BaseSQLDbInputSchema.parse({
      sql: "SELECT 1",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "password",
    });

    expect(result.ssl).toBe(false);
  });

  it("enables TLS in MySQL", async () => {
    await mysqlMain({
      ...baseInput(),
      charset: "utf8mb4",
      timezone: "+00:00",
    });

    expect(mocks.mysql.createConnection).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: {} }),
    );
  });

  it("enables SSL in PostgreSQL", async () => {
    await postgresqlMain(baseInput());

    expect(mocks.postgres).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: true }),
    );
  });

  it("enables encryption in SQL Server", () => {
    expect(getSqlServerOptions(undefined, true)).toEqual({
      trustServerCertificate: true,
      encrypt: true,
    });
  });

  it("enables certificate matching in Oracle", async () => {
    await oracleMain({
      sql: "SELECT 1",
      connectString: "db.example.com:1521/service",
      username: "user",
      password: "password",
      maxConnections: 10,
      connectionTimeout: 30000,
      ssl: true,
    });

    expect(mocks.oracle.createPool).toHaveBeenCalledWith(
      expect.objectContaining({ sslServerDNMatch: true }),
    );
  });

  it("uses HTTPS for ClickHouse when SSL is enabled", async () => {
    await clickhouseMain({
      ...baseInput(),
      url: "http://clickhouse.example.com:8123",
    });

    expect(mocks.clickhouse.createClient).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://clickhouse.example.com:8123" }),
    );
  });
});

function baseInput() {
  return {
    sql: "SELECT 1",
    host: "db.example.com",
    port: 5432,
    database: "app",
    username: "user",
    password: "password",
    maxConnections: 10,
    connectionTimeout: 30000,
    ssl: true,
  };
}
