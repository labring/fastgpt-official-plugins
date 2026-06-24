import { describe, expect, test } from "vitest";
import tool from "..";
import {
  buildCommand,
  InputType,
  normalizeExitCode,
  normalizeSignal,
  quoteShellArg,
} from "../src";

describe("sshConnection", () => {
  test("exports FastGPT tool metadata", () => {
    expect(tool.getUserToolManifest().pluginId).toBe("sshConnection");
    expect(tool.getToolHandler()).toBeDefined();
    expect(tool.getSecretSchema()).toBeDefined();
  });

  test("normalizes password connection input", async () => {
    const input = await InputType.parseAsync({
      host: "example.com",
      username: "root",
      password: "secret",
      command: "uptime",
    });

    expect(input.port).toBe(22);
    expect(input.timeout).toBe(30000);
    expect(input.connectionTimeout).toBe(10000);
  });

  test("normalizes private key newlines", async () => {
    const input = await InputType.parseAsync({
      host: "example.com",
      port: "2222",
      username: "root",
      privateKey:
        "-----BEGIN OPENSSH PRIVATE KEY-----\\nkey\\n-----END OPENSSH PRIVATE KEY-----",
      command: "whoami",
    });

    expect(input.port).toBe(2222);
    expect(input.privateKey).toContain("\nkey\n");
  });

  test("requires at least one authentication method", async () => {
    await expect(
      InputType.parseAsync({
        host: "example.com",
        username: "root",
        command: "whoami",
      }),
    ).rejects.toThrow("password or privateKey is required");
  });

  test("builds cwd command with shell quoting", () => {
    expect(quoteShellArg("/var/www/app's current")).toBe(
      "'/var/www/app'\\''s current'",
    );
    expect(buildCommand("pwd", "/var/www/app's current")).toBe(
      "cd '/var/www/app'\\''s current' && pwd",
    );
  });

  test("normalizes optional close event values", () => {
    expect(normalizeExitCode(undefined)).toBeNull();
    expect(normalizeExitCode(null)).toBeNull();
    expect(normalizeExitCode(0)).toBe(0);
    expect(normalizeSignal(undefined)).toBeNull();
    expect(normalizeSignal(null)).toBeNull();
    expect(normalizeSignal("SIGTERM")).toBe("SIGTERM");
  });
});
