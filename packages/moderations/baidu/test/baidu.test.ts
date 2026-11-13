import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBaiduModerator, secretSchema, splitText } from "../src/baidu";

const settings = { apiKey: "test-api-key", secretKey: "test-secret-key" };
const fetchMock = vi.fn<typeof fetch>();
const reply = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200 });
const token = () => reply({ access_token: "test-token", expires_in: 3600 });

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("Baidu text moderation", () => {
  it.each([
    [1, "pass"],
    [2, "block"],
    [3, "suspected"],
    [4, "error"],
    [99, "error"],
  ])("maps conclusion %s to %s without requiring keywords", async (conclusionType, verdict) => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(reply({ conclusionType, log_id: "123" }));
    expect(await createBaiduModerator()("text", settings)).toMatchObject({
      verdict,
      requestId: "123",
    });
  });

  it("preserves every hit, maps modern and legacy labels, and scales real probability", async () => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(
      reply({
        conclusionType: 2,
        data: [
          {
            type: 30,
            subType: 300501,
            hits: [
              {
                words: ["a"],
                probability: "0.95",
                wordHitPositions: [{ keyword: "b" }],
              },
              { words: ["c"] },
            ],
          },
          { type: 12, subType: 2, hits: [{ words: ["d"] }] },
          { type: 13, hits: [{ words: ["e"] }] },
          { type: 31 },
          { type: 32 },
          { type: 36 },
        ],
      }),
    );
    const result = await createBaiduModerator()("text", settings);
    expect(result.hits).toHaveLength(7);
    expect(result.hits[0]).toMatchObject({
      label: "politics",
      providerLabel: "30",
      subLabel: "300501",
      score: 95,
      keywords: ["a", "b"],
    });
    expect(result.hits.map((h) => h.label)).toEqual([
      "politics",
      "politics",
      "porn",
      "other",
      "terror",
      "contraband",
      "ad",
    ]);
    expect(result.hits[1]).not.toHaveProperty("score");
  });

  it("sends URL-encoded text and optional strategy, and reuses tokens", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockImplementation(async () => reply({ conclusionType: 1 }));
    const check = createBaiduModerator();
    await check("中文 & +", { ...settings, strategyId: 123 });
    await check("next", settings);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const body = fetchMock.mock.calls[1]?.[1]?.body as URLSearchParams;
    expect(body.get("text")).toBe("中文 & +");
    expect(body.get("strategyId")).toBe("123");
    expect(fetchMock.mock.calls[0]?.[1]?.body?.toString()).toContain(
      "client_id=test-api-key",
    );
  });

  it("refreshes an expired token once and never retries indefinitely", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(reply({ error_code: 111 }))
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(reply({ error_code: 110 }));
    expect(await createBaiduModerator()("text", settings)).toMatchObject({
      verdict: "error",
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("expires cached tokens and isolates credentials", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async (url) =>
      String(url).includes("oauth") ? token() : reply({ conclusionType: 1 }),
    );
    const check = createBaiduModerator();
    await check("a", settings);
    vi.advanceTimersByTime(3600_000);
    await check("b", settings);
    await check("c", { ...settings, secretKey: "different" });
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it("deduplicates concurrent token requests", async () => {
    fetchMock.mockImplementation(async (url) =>
      String(url).includes("oauth") ? token() : reply({ conclusionType: 1 }),
    );
    const check = createBaiduModerator();
    await Promise.all([check("a", settings), check("b", settings)]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it.each([
    { error_code: 282909 },
    { conclusionType: 1, data: [{ type: 30, error_code: 1 }] },
    {},
    { conclusionType: 2, data: "invalid" },
  ])("never bypasses provider errors: %j", async (body) => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(reply(body));
    expect(await createBaiduModerator()("text", settings)).toMatchObject({
      verdict: "error",
      errorMessage: expect.any(String),
    });
  });

  it("handles HTTP, timeout and credential failures without leaking secrets", async () => {
    for (const response of [
      new Response("oops", { status: 503 }),
      reply({ error: "invalid_client" }),
    ]) {
      fetchMock.mockResolvedValueOnce(response);
      expect(await createBaiduModerator()("text", settings)).toMatchObject({
        verdict: "error",
      });
    }
    fetchMock.mockRejectedValueOnce(
      new Error("https://example.com?client_secret=private"),
    );
    expect(
      JSON.stringify(await createBaiduModerator()("text", settings)),
    ).not.toContain("private");
  });

  it("splits UTF-8 without breaking surrogate pairs and aggregates every chunk", async () => {
    const text = "🙂".repeat(5001);
    expect(
      splitText(text).map((s) => new TextEncoder().encode(s).length),
    ).toEqual([20000, 4]);
    expect(splitText(text).join("")).toBe(text);
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(
        reply({
          conclusionType: 2,
          data: [{ type: 33, hits: [{ words: ["first"] }] }],
        }),
      )
      .mockResolvedValueOnce(
        reply({
          conclusionType: 3,
          data: [{ type: 30, hits: [{ words: ["second"] }] }],
        }),
      );
    const result = await createBaiduModerator()(text, settings);
    expect(result.verdict).toBe("block");
    expect(result.hits.flatMap((h) => h.keywords ?? [])).toEqual([
      "first",
      "second",
    ]);
  });

  it("returns error if a later chunk cannot be checked, retaining earlier hits", async () => {
    fetchMock
      .mockResolvedValueOnce(token())
      .mockResolvedValueOnce(reply({ conclusionType: 2, data: [{ type: 33 }] }))
      .mockRejectedValueOnce(new Error("timeout"));
    expect(
      await createBaiduModerator()("x".repeat(20001), settings),
    ).toMatchObject({ verdict: "error", hits: [{ label: "porn" }] });
  });

  it("skips empty text and requires credentials", async () => {
    expect(await createBaiduModerator()(" ", settings)).toEqual({
      verdict: "pass",
      hits: [],
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(secretSchema.safeParse({}).success).toBe(false);
  });
});
