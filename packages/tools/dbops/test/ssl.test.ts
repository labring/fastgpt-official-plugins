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
import dbopsToolSet from "../index";
import { BaseSQLDbInputSchema } from "../types";

describe("dbops connection configuration", () => {
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

  it("builds the Oracle connect string from shared connection fields", async () => {
    const handler = dbopsToolSet.getToolHandler("oracle");

    expect(handler).toBeDefined();
    await handler?.handler(
      { sql: "SELECT 1" },
      {
        secrets: {
          database: "ORCLPDB1",
          host: "10.0.0.8",
          port: 1521,
          username: "user",
          password: "password",
          ssl: false,
          maxConnections: "10",
          connectionTimeout: "30000",
        },
        systemVar: {} as never,
        invoke: {} as never,
        streamResponse: vi.fn(),
      },
    );

    expect(mocks.oracle.createPool).toHaveBeenCalledWith(
      expect.objectContaining({
        connectString: "10.0.0.8:1521/ORCLPDB1",
      }),
    );
  });

  it.each([
    {
      host: "clickhouse.example.com",
      ssl: false,
      expectedUrl: "http://clickhouse.example.com:8123",
    },
    {
      host: "clickhouse.example.com",
      ssl: true,
      expectedUrl: "https://clickhouse.example.com:8123",
    },
    {
      host: "clickhouse.example.com",
      ssl: undefined,
      expectedUrl: "http://clickhouse.example.com:8123",
    },
    { host: "::1", ssl: false, expectedUrl: "http://[::1]:8123" },
  ])("builds the ClickHouse URL from saved connection fields ($host, ssl: $ssl)", async ({
    host,
    ssl,
    expectedUrl,
  }) => {
    const handler = dbopsToolSet.getToolHandler("clickhouse");

    expect(handler).toBeDefined();
    const output = await handler?.handler(
      { sql: "SELECT 1 AS test" },
      {
        secrets: {
          host,
          port: 8123,
          database: "test_db",
          username: "test_user",
          password: "test_password",
          ...(ssl === undefined ? {} : { ssl }),
        },
        systemVar: {} as never,
        invoke: {} as never,
        streamResponse: vi.fn(),
      },
    );

    expect(mocks.clickhouse.createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expectedUrl,
        username: "test_user",
        password: "test_password",
      }),
    );
    expect(mocks.clickhouse.query).toHaveBeenCalledWith({
      query: "SELECT 1 AS test",
      format: "JSON",
    });
    expect(output).toEqual({ result: [] });
  });

  it.each([
    "host",
    "port",
  ])("rejects ClickHouse connection settings without %s", async (field) => {
    const handler = dbopsToolSet.getToolHandler("clickhouse");

    expect(handler).toBeDefined();
    await expect(
      handler?.handler(
        { sql: "SELECT 1 AS test" },
        {
          secrets: {
            host: "clickhouse.example.com",
            port: 8123,
            database: "test_db",
            username: "test_user",
            password: "test_password",
            [field]: undefined,
          },
          systemVar: {} as never,
          invoke: {} as never,
          streamResponse: vi.fn(),
        },
      ),
    ).rejects.toMatchObject({
      issues: [expect.objectContaining({ path: [field] })],
    });
    expect(mocks.clickhouse.createClient).not.toHaveBeenCalled();
  });

  it("keeps an existing ClickHouse URL from saved secrets", async () => {
    const handler = dbopsToolSet.getToolHandler("clickhouse");

    expect(handler).toBeDefined();
    await handler?.handler(
      { sql: "SELECT 1 AS test" },
      {
        secrets: {
          url: "http://legacy.example.com:8123",
          database: "test_db",
          username: "test_user",
          password: "test_password",
          ssl: false,
        },
        systemVar: {} as never,
        invoke: {} as never,
        streamResponse: vi.fn(),
      },
    );

    expect(mocks.clickhouse.createClient).toHaveBeenCalledWith(
      expect.objectContaining({ url: "http://legacy.example.com:8123" }),
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
