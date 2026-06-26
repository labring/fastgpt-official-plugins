import type { Client, ConnectConfig } from "ssh2";
import { z } from "zod";

const DEFAULT_PORT = 22;
const DEFAULT_TIMEOUT = 30000;
const MAX_TIMEOUT = 300000;
const DEFAULT_CONNECTION_TIMEOUT = 10000;
const MAX_CONNECTION_TIMEOUT = 60000;

export const InputType = z
  .object({
    host: z.string().trim().min(1, "host is required"),
    port: z.union([z.string(), z.number()]).optional(),
    username: z.string().trim().min(1, "username is required"),
    password: z.string().optional(),
    privateKey: z.string().optional(),
    passphrase: z.string().optional(),
    command: z.string().trim().min(1, "command is required"),
    cwd: z.string().trim().optional(),
    timeout: z.number().int().positive().max(MAX_TIMEOUT).optional(),
    connectionTimeout: z
      .number()
      .int()
      .positive()
      .max(MAX_CONNECTION_TIMEOUT)
      .optional(),
  })
  .transform((data) => {
    const port = normalizePort(data.port);
    const privateKey = normalizeSecret(data.privateKey);
    const password = normalizeSecret(data.password);
    const passphrase = normalizeSecret(data.passphrase);

    if (!password && !privateKey) {
      throw new Error("password or privateKey is required");
    }

    return {
      ...data,
      port,
      password,
      privateKey,
      passphrase,
      cwd: normalizeOptionalString(data.cwd),
      timeout: data.timeout ?? DEFAULT_TIMEOUT,
      connectionTimeout: data.connectionTimeout ?? DEFAULT_CONNECTION_TIMEOUT,
    };
  });

export const OutputType = z.object({
  stdout: z.string(),
  stderr: z.string(),
  exitCode: z.number().nullable(),
  signal: z.string().nullable(),
  durationMs: z.number(),
});

export type SshCommandInput = z.infer<typeof InputType>;
export type SshCommandOutput = z.infer<typeof OutputType>;

export async function tool(input: SshCommandInput): Promise<SshCommandOutput> {
  const startedAt = Date.now();
  const command = buildCommand(input.command, input.cwd);
  const result = await executeSshCommand(input, command);

  return {
    ...result,
    durationMs: Date.now() - startedAt,
  };
}

export function buildCommand(command: string, cwd?: string): string {
  if (!cwd) {
    return command;
  }

  return `cd ${quoteShellArg(cwd)} && ${command}`;
}

export function quoteShellArg(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

export function normalizeExitCode(
  exitCode: number | null | undefined,
): number | null {
  return exitCode ?? null;
}

export function normalizeSignal(
  signal: string | null | undefined,
): string | null {
  return signal ?? null;
}

function normalizePort(port: string | number | undefined): number {
  if (port === undefined || port === "") {
    return DEFAULT_PORT;
  }

  const parsedPort = typeof port === "string" ? Number(port) : port;
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error("port must be an integer between 1 and 65535");
  }

  return parsedPort;
}

function normalizeSecret(value: string | undefined): string | undefined {
  const normalized = normalizeOptionalString(value);
  return normalized?.replaceAll("\\n", "\n");
}

function normalizeOptionalString(
  value: string | undefined,
): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function createConnectConfig(input: SshCommandInput): ConnectConfig {
  const config: ConnectConfig = {
    host: input.host,
    port: input.port,
    username: input.username,
    readyTimeout: input.connectionTimeout,
    keepaliveInterval: 10000,
    keepaliveCountMax: 3,
  };

  if (input.password) {
    config.password = input.password;
  }
  if (input.privateKey) {
    config.privateKey = input.privateKey;
  }
  if (input.passphrase) {
    config.passphrase = input.passphrase;
  }

  return config;
}

async function executeSshCommand(
  input: SshCommandInput,
  command: string,
): Promise<Omit<SshCommandOutput, "durationMs">> {
  const { Client } = await loadSsh2();

  return new Promise((resolve, reject) => {
    const client = new Client();
    let settled = false;
    let commandTimer: NodeJS.Timeout | undefined;

    const cleanup = () => {
      if (commandTimer) {
        clearTimeout(commandTimer);
        commandTimer = undefined;
      }
      client.removeAllListeners();
      client.end();
    };

    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      callback();
    };

    client
      .on("ready", () => {
        commandTimer = setTimeout(() => {
          settle(() =>
            reject(new Error(`SSH command timed out after ${input.timeout}ms`)),
          );
        }, input.timeout);

        client.exec(command, (error, stream) => {
          if (error) {
            settle(() => reject(error));
            return;
          }

          let stdout = "";
          let stderr = "";

          stream
            .on(
              "close",
              (
                exitCode: number | null | undefined,
                signal: string | null | undefined,
              ) => {
                const normalizedExitCode = normalizeExitCode(exitCode);
                const normalizedSignal = normalizeSignal(signal);

                settle(() =>
                  resolve({
                    stdout,
                    stderr,
                    exitCode: normalizedExitCode,
                    signal: normalizedSignal,
                  }),
                );
              },
            )
            .on("data", (chunk: Buffer | string) => {
              stdout += chunk.toString();
            })
            .stderr.on("data", (chunk: Buffer | string) => {
              stderr += chunk.toString();
            });
        });
      })
      .on("error", (error) => {
        settle(() => reject(error));
      })
      .on("timeout", () => {
        settle(() =>
          reject(
            new Error(
              `SSH connection timed out after ${input.connectionTimeout}ms`,
            ),
          ),
        );
      })
      .connect(createConnectConfig(input));
  });
}

function loadSsh2(): Promise<{ Client: typeof Client }> {
  return new Function("specifier", "return import(specifier)")("ssh2");
}
