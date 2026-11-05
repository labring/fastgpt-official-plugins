import { createServer } from "node:http";
import { describe, expect, it, vi } from "vitest";
import plugin from "./index";
import { createLegacyModerator, secretSchema } from "./src/moderation";

const config = { endpoint: "http://127.0.0.1/censor" };

describe("legacy custom censor compatibility", () => {
  it.each([
    true,
    false,
  ])("maps success=%s without forwarding messages or extra data", async (success) => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success,
          message: "private upstream message",
          hits: ["ignored"],
        }),
      ),
    );
    expect(await createLegacyModerator(fetch)("original text", config)).toEqual(
      { verdict: success ? "pass" : "block", hits: [] },
    );
    expect(fetch).toHaveBeenCalledWith(
      config.endpoint,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "original text" }),
        redirect: "error",
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it.each([
    {},
    { success: "false" },
    { success: 1 },
    { data: { success: true } },
    null,
  ])("rejects malformed result %j", async (body) => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
    expect(await createLegacyModerator(fetch)("text", config)).toMatchObject({
      verdict: "error",
      hits: [],
      errorMessage: expect.any(String),
    });
  });

  it("does not leak upstream bodies, endpoint queries or network exceptions", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValue(new Error("private secret and submitted text"));
    const result = await createLegacyModerator(fetch)(
      "private submitted text",
      { endpoint: "https://example.test?token=private" },
    );
    expect(result.verdict).toBe("error");
    expect(JSON.stringify(result)).not.toContain("private");
  });

  it.each([
    401, 500, 302,
  ])("reports HTTP %s without returning upstream body", async (status) => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response("private body", { status }));
    expect(await createLegacyModerator(fetch)("text", config)).toEqual({
      verdict: "error",
      hits: [],
      errorMessage: `Legacy censor returned HTTP ${status}`,
    });
  });

  it.each([
    "invalid json",
    "x".repeat(65537),
  ])("handles invalid or oversized responses", async (body) => {
    expect(
      await createLegacyModerator(
        vi.fn().mockResolvedValue(new Response(body)),
      )("text", config),
    ).toMatchObject({ verdict: "error" });
  });

  it.each([
    "file:///etc/passwd",
    "ftp://example.test",
    "http://user:pass@example.test",
  ])("rejects endpoint %s before calling it", async (endpoint) => {
    const fetch = vi.fn();
    expect(
      await createLegacyModerator(fetch)("text", { endpoint }),
    ).toMatchObject({ verdict: "error" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses bounded timeouts and localized metadata", () => {
    expect(secretSchema.parse(config).timeoutMs).toBe(10000);
    expect(secretSchema.safeParse({ ...config, timeoutMs: 0 }).success).toBe(
      false,
    );
    expect(
      secretSchema.safeParse({ ...config, timeoutMs: 60001 }).success,
    ).toBe(false);
    expect(plugin.getPluginType()).toBe("moderation");
    expect(plugin.getUserModerationManifest()).toMatchObject({
      pluginId: "legacy-custom-censor",
      meta: { provider: "legacy-custom-censor" },
    });
  });

  it("calls a real local legacy endpoint using the exact wire protocol", async () => {
    let received: unknown;
    const server = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        received = {
          method: req.method,
          type: req.headers["content-type"],
          body: JSON.parse(Buffer.concat(chunks).toString()),
        };
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: false, message: "ignored" }));
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    try {
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("Missing server port");
      expect(
        await createLegacyModerator()("待审核文本", {
          endpoint: `http://127.0.0.1:${address.port}`,
        }),
      ).toEqual({ verdict: "block", hits: [] });
      expect(received).toEqual({
        method: "POST",
        type: "application/json",
        body: { text: "待审核文本" },
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it("actually aborts a slow upstream request", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(init.signal?.reason),
            { once: true },
          );
        }),
    );
    expect(
      await createLegacyModerator(fetch)("text", { ...config, timeoutMs: 100 }),
    ).toMatchObject({ verdict: "error" });
    expect(fetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });
});
