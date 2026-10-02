import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tool } from "../src";

const fetchMock = vi.fn();

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sentRequest() {
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  return { url, init, body: JSON.parse(init.body as string) };
}

describe("Firecrawl Search Tool", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns url, title and description for each result", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: {
          web: [
            { url: "https://example.com/a", title: "A", description: "first" },
            { url: "https://example.com/b", title: "B", description: "second" },
          ],
        },
      }),
    );

    const result = await tool({
      apiUrl: "https://api.firecrawl.dev",
      apiKey: "fc-test",
      query: "firecrawl search api",
      limit: 2,
      includeContent: false,
    });

    const { url, init, body } = sentRequest();
    expect(url).toBe("https://api.firecrawl.dev/v2/search");
    expect(init.headers).toMatchObject({ Authorization: "Bearer fc-test" });
    expect(body).toEqual({
      query: "firecrawl search api",
      limit: 2,
      origin: "fastgpt",
    });
    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toEqual({
      url: "https://example.com/a",
      title: "A",
      description: "first",
    });
  });

  it("passes scrapeOptions when includeContent is true and keeps markdown", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: {
          web: [
            {
              url: "https://example.com/a",
              title: "A",
              description: "first",
              markdown: "# A",
            },
          ],
        },
      }),
    );

    const result = await tool({
      apiUrl: "https://api.firecrawl.dev",
      apiKey: "fc-test",
      query: "q",
      limit: 1,
      includeContent: true,
    });

    expect(sentRequest().body).toEqual({
      query: "q",
      limit: 1,
      scrapeOptions: { formats: ["markdown"] },
      origin: "fastgpt",
    });
    expect(result.results[0]?.markdown).toBe("# A");
  });

  it("uses a custom apiUrl and falls back to the official API when it is empty", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse(200, { success: true, data: { web: [] } }),
    );

    await tool({
      apiUrl: "https://firecrawl.example.com/",
      apiKey: "fc-test",
      query: "q",
      limit: 1,
      includeContent: false,
    });
    await tool({
      apiUrl: "",
      apiKey: "fc-test",
      query: "q",
      limit: 1,
      includeContent: false,
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://firecrawl.example.com/v2/search",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://api.firecrawl.dev/v2/search",
    );
  });

  it("rejects with the API error on an HTTP error", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, {
        success: false,
        error: "Unauthorized: Invalid token",
      }),
    );

    await expect(
      tool({
        apiUrl: "https://api.firecrawl.dev",
        apiKey: "bad",
        query: "q",
        limit: 5,
        includeContent: false,
      }),
    ).rejects.toThrow("Firecrawl API error 401: Unauthorized: Invalid token");
  });

  it("rejects when the API returns success false", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { success: false, error: "Search failed" }),
    );

    await expect(
      tool({
        apiUrl: "https://api.firecrawl.dev",
        apiKey: "fc-test",
        query: "q",
        limit: 5,
        includeContent: false,
      }),
    ).rejects.toThrow("Search failed");
  });

  it("truncates long descriptions", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, {
        success: true,
        data: {
          web: [
            {
              url: "https://example.com/a",
              title: "A",
              description: "x".repeat(2000),
            },
          ],
        },
      }),
    );

    const result = await tool({
      apiUrl: "https://api.firecrawl.dev",
      apiKey: "fc-test",
      query: "q",
      limit: 1,
      includeContent: false,
    });

    expect(result.results[0]?.description).toBe(`${"x".repeat(500)}…`);
  });

  it("returns an empty list when the API returns no results", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, data: {} }));

    const result = await tool({
      apiUrl: "https://api.firecrawl.dev",
      apiKey: "fc-test",
      query: "q",
      limit: 5,
      includeContent: false,
    });

    expect(result.results).toEqual([]);
  });
});
