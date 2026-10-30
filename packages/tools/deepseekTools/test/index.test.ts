import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  inputSchema as fetchInputSchema,
  tool as fetchTool,
} from "../children/fetch";
import {
  inputSchema as searchInputSchema,
  tool as searchTool,
} from "../children/search";
import toolSet from "../index";
import {
  DeepSeekApiError,
  formatSearchResultsText,
  postDeepSeek,
} from "../utils/client";

describe("DeepSeek Tool Set", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Manifest & Structure", () => {
    it("should have valid plugin manifest and children", () => {
      expect(toolSet).toBeDefined();

      const manifest = toolSet.getUserToolManifest();
      expect(manifest.pluginId).toBe("deepseekTools");
      expect(manifest.name.en).toBe("DeepSeek Search");
      expect(manifest.name["zh-CN"]).toBe("DeepSeek 搜索");

      const children = toolSet.getChildManifests();
      expect(children).toHaveLength(2);

      const searchChild = children.find((c) => c.id === "search");
      expect(searchChild).toBeDefined();
      expect(searchChild?.name["zh-CN"]).toBe("DeepSeek 网页搜索");

      const fetchChild = children.find((c) => c.id === "fetch");
      expect(fetchChild).toBeDefined();
      expect(fetchChild?.name["zh-CN"]).toBe("DeepSeek 网页抓取");

      expect(toolSet.getToolHandler("search")).toBeDefined();
      expect(toolSet.getToolHandler("fetch")).toBeDefined();
      expect(toolSet.getSecretSchema()).toBeDefined();
    });
  });

  describe("Client & Utilities", () => {
    it("should throw when API key is empty", async () => {
      await expect(
        postDeepSeek("/v1/tools/search", "", { query: "test" }),
      ).rejects.toThrow("DeepSeek API key cannot be empty");
    });

    it("should throw DeepSeekApiError with parsed message on HTTP failure", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({
          error: {
            message: "'count' must be between 1 and 50",
            type: "invalid_request_error",
            code: "invalid_request_error",
          },
        }),
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        mockResponse as unknown as Response,
      );

      await expect(
        postDeepSeek("/v1/tools/search", "sk-test", {
          query: "test",
          count: 100,
        }),
      ).rejects.toThrowError(DeepSeekApiError);
    });

    it("should format search results correctly", () => {
      const results = [
        {
          title: "DeepSeek V4",
          url: "https://example.com/deepseek-v4",
          snippet: "Short snippet",
          summary: "Long summary description for LLM",
          site_name: "Example News",
          date: "2026-06-01",
          authority: 3,
          rerank_score: 2.5,
        },
      ];

      const formatted = formatSearchResultsText(results);
      expect(formatted).toContain(
        "### 1. [DeepSeek V4](https://example.com/deepseek-v4)",
      );
      expect(formatted).toContain("来源: Example News");
      expect(formatted).toContain("时间: 2026-06-01");
      expect(formatted).toContain("权威度: 3/4");
      expect(formatted).toContain("相关度: 2.50");
      expect(formatted).toContain("**摘要**: Long summary description for LLM");
    });
  });

  describe("Search Tool", () => {
    it("should validate search input requirements", async () => {
      // Query cannot be empty
      await expect(
        searchInputSchema.parseAsync({
          query: "",
        }),
      ).rejects.toThrow();

      // Query length limit
      const longQuery = "a".repeat(129);
      await expect(
        searchInputSchema.parseAsync({
          query: longQuery,
        }),
      ).rejects.toThrow();

      // Valid input with defaults
      const valid = await searchInputSchema.parseAsync({
        query: "DeepSeek V4 release",
      });
      expect(valid.count).toBe(10);
      expect(valid.need_content).toBe(false);
    });

    it("should successfully execute search tool and format response", async () => {
      const mockApiResponse = {
        results: [
          {
            rerank_score: 2.8,
            title: "DeepSeek Model Release",
            url: "https://example.com/article",
            snippet: "Snippet text",
            summary: "Comprehensive summary text",
            content: "Full markdown content",
            site_name: "DeepSeek Blog",
            site_icon: "https://example.com/icon.png",
            date: "2026-06-01T00:00:00+00:00",
            authority: 4,
          },
        ],
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as unknown as Response);

      const parsedInput = await searchInputSchema.parseAsync({
        query: "DeepSeek V4",
        count: 5,
        need_content: true,
      });

      const output = await searchTool(parsedInput, "sk-test-key");

      expect(output.results).toHaveLength(1);
      expect(output.results[0].title).toBe("DeepSeek Model Release");
      expect(output.results[0].content).toBe("Full markdown content");
      expect(output.formatText).toContain("DeepSeek Model Release");
      expect(output.formatText).toContain("**正文内容**:");
    });
  });

  describe("Fetch Tool", () => {
    it("should validate fetch URL", async () => {
      // Invalid URL
      await expect(
        fetchInputSchema.parseAsync({
          url: "invalid-url",
        }),
      ).rejects.toThrow();

      // Unsupported protocol (e.g. ftp)
      await expect(
        fetchInputSchema.parseAsync({
          url: "ftp://example.com/file",
        }),
      ).rejects.toThrow();

      // URL with credentials
      await expect(
        fetchInputSchema.parseAsync({
          url: "https://user:pass@example.com",
        }),
      ).rejects.toThrow();

      // Valid URL
      const valid = await fetchInputSchema.parseAsync({
        url: "https://api-docs.deepseek.com/guides/search/",
      });
      expect(valid.url).toBe("https://api-docs.deepseek.com/guides/search/");
    });

    it("should successfully execute fetch tool", async () => {
      const mockFetchResponse = {
        title: "Search & Fetch Guide",
        content: "# Search & Fetch\n\nDeepSeek Search API guide content.",
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockFetchResponse,
      } as unknown as Response);

      const parsedInput = await fetchInputSchema.parseAsync({
        url: "https://api-docs.deepseek.com/guides/search/",
      });

      const output = await fetchTool(parsedInput, "sk-test-key");

      expect(output.title).toBe("Search & Fetch Guide");
      expect(output.content).toContain("DeepSeek Search API guide content.");
    });
  });
});
