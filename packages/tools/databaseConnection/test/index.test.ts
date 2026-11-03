import { beforeEach, describe, expect, it, vi } from "vitest";

const mysqlMocks = vi.hoisted(() => ({
  createConnection: vi.fn(),
  execute: vi.fn(),
  end: vi.fn(),
}));

vi.mock("mysql2/promise", () => ({
  default: {
    createConnection: mysqlMocks.createConnection,
  },
}));

vi.mock("pg", () => ({
  Client: vi.fn(),
}));

import toolFactory from "../index";

describe("Database Connection Tool", () => {
  const secrets = {
    databaseType: "MySQL",
    host: "localhost",
    port: "3306",
    databaseName: "test_db",
    user: "test_user",
    password: "test_password",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mysqlMocks.execute.mockResolvedValue([[{ id: 1, name: "FastGPT" }]]);
    mysqlMocks.end.mockResolvedValue(undefined);
    mysqlMocks.createConnection.mockResolvedValue({
      execute: mysqlMocks.execute,
      end: mysqlMocks.end,
    });
  });

  it("should merge secrets for the current handler", async () => {
    const handler = toolFactory.getToolHandler();

    const result = await handler.handler(
      { sql: "select * from users" },
      createContext(secrets),
    );

    expect(result).toEqual({ result: [{ id: 1, name: "FastGPT" }] });
    expect(mysqlMocks.createConnection).toHaveBeenCalledWith({
      host: "localhost",
      port: 3306,
      database: "test_db",
      user: "test_user",
      password: "test_password",
      connectTimeout: 30000,
    });
    expect(mysqlMocks.execute).toHaveBeenCalledWith("select * from users");
    expect(mysqlMocks.end).toHaveBeenCalledOnce();
  });
});

function createContext(secrets: Record<string, unknown>) {
  return {
    secrets,
    systemVar: {},
    invoke: {},
    streamResponse: vi.fn(),
  } as any;
}
