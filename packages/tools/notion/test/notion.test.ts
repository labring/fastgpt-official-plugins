import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tool as createPage } from "../children/createPage/src";
import { tool as getBlockChildren } from "../children/getBlockChildren/src";
import { tool as getPage } from "../children/getPage/src";
import { tool as queryDataSource } from "../children/queryDataSource/src";
import { tool as search } from "../children/search/src";
import { notionApiRequest } from "../client";

const integrationToken = "ntn_test_token";

describe("Notion tools", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("search posts to Notion search and normalizes results", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        object: "list",
        results: [
          {
            object: "page",
            id: "page-1",
            url: "https://notion.so/page-1",
            archived: false,
            in_trash: false,
            created_time: "2026-01-01T00:00:00.000Z",
            last_edited_time: "2026-01-02T00:00:00.000Z",
            properties: {
              Name: {
                type: "title",
                title: [{ plain_text: "Roadmap" }],
              },
            },
          },
        ],
        has_more: true,
        next_cursor: "next-page",
      }),
    );

    const result = await search({
      integrationToken,
      query: "roadmap",
      objectType: "page",
      pageSize: 5,
      cursor: "cursor-1",
    });

    expect(result).toEqual({
      results: [
        {
          object: "page",
          id: "page-1",
          title: "Roadmap",
          url: "https://notion.so/page-1",
          archived: false,
          in_trash: false,
          created_time: "2026-01-01T00:00:00.000Z",
          last_edited_time: "2026-01-02T00:00:00.000Z",
        },
      ],
      has_more: true,
      next_cursor: "next-page",
    });

    const [url, init] = firstFetchCall(fetchMock);
    expect(String(url)).toBe("https://api.notion.com/v1/search");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${integrationToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json; charset=utf-8",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      query: "roadmap",
      page_size: 5,
      start_cursor: "cursor-1",
      filter: {
        property: "object",
        value: "page",
      },
    });
  });

  it("getPage retrieves page metadata and properties JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        object: "page",
        id: "page-1",
        url: "https://notion.so/page-1",
        archived: false,
        in_trash: false,
        created_time: "2026-01-01T00:00:00.000Z",
        last_edited_time: "2026-01-02T00:00:00.000Z",
        properties: {
          Name: {
            type: "title",
            title: [{ plain_text: "Spec" }],
          },
        },
      }),
    );

    const result = await getPage({ integrationToken, pageId: "page-1" });

    expect(result.title).toBe("Spec");
    expect(result.properties_json).toContain('"Name"');
    const [url] = firstFetchCall(vi.mocked(fetch));
    expect(String(url)).toBe("https://api.notion.com/v1/pages/page-1");
  });

  it("getBlockChildren reads blocks and extracts text", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        object: "list",
        results: [
          {
            object: "block",
            id: "block-1",
            type: "paragraph",
            has_children: false,
            archived: false,
            in_trash: false,
            paragraph: {
              rich_text: [{ plain_text: "Hello Notion" }],
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      }),
    );

    const result = await getBlockChildren({
      integrationToken,
      blockId: "page-1",
      pageSize: 10,
    });

    expect(result).toEqual({
      blocks: [
        {
          id: "block-1",
          type: "paragraph",
          text: "Hello Notion",
          has_children: false,
          archived: false,
          in_trash: false,
        },
      ],
      has_more: false,
      next_cursor: "",
    });

    const [url] = firstFetchCall(vi.mocked(fetch));
    const requestUrl = new URL(String(url));
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      "https://api.notion.com/v1/blocks/page-1/children",
    );
    expect(requestUrl.searchParams.get("page_size")).toBe("10");
  });

  it("queryDataSource sends filter and sorts JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        object: "list",
        results: [
          {
            object: "page",
            id: "page-2",
            url: "https://notion.so/page-2",
            archived: false,
            in_trash: false,
            created_time: "2026-01-03T00:00:00.000Z",
            last_edited_time: "2026-01-04T00:00:00.000Z",
            properties: {
              Name: {
                type: "title",
                title: [{ plain_text: "Customer A" }],
              },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      }),
    );

    const result = await queryDataSource({
      integrationToken,
      dataSourceId: "ds-1",
      filterJson: JSON.stringify({
        property: "Status",
        status: { equals: "Open" },
      }),
      sortsJson: JSON.stringify({
        sorts: [{ property: "Created", direction: "descending" }],
      }),
      pageSize: 3,
    });

    expect(result.results[0]?.title).toBe("Customer A");

    const [url, init] = firstFetchCall(vi.mocked(fetch));
    expect(String(url)).toBe(
      "https://api.notion.com/v1/data_sources/ds-1/query",
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      filter: {
        property: "Status",
        status: { equals: "Open" },
      },
      sorts: [{ property: "Created", direction: "descending" }],
      page_size: 3,
    });
  });

  it("createPage posts parent, properties, and children", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        object: "page",
        id: "page-created",
        url: "https://notion.so/page-created",
        archived: false,
        in_trash: false,
        created_time: "2026-01-05T00:00:00.000Z",
        last_edited_time: "2026-01-05T00:00:00.000Z",
      }),
    );

    const result = await createPage({
      integrationToken,
      parentType: "data_source_id",
      parentId: "ds-1",
      propertiesJson: JSON.stringify({
        Name: {
          title: [{ text: { content: "New record" } }],
        },
      }),
      childrenJson: JSON.stringify([
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content: "Created from FastGPT" } }],
          },
        },
      ]),
    });

    expect(result.id).toBe("page-created");
    const [url, init] = firstFetchCall(vi.mocked(fetch));
    expect(String(url)).toBe("https://api.notion.com/v1/pages");
    expect(JSON.parse(String(init?.body))).toEqual({
      parent: { data_source_id: "ds-1" },
      properties: {
        Name: {
          title: [{ text: { content: "New record" } }],
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ text: { content: "Created from FastGPT" } }],
          },
        },
      ],
    });
  });

  it("turns Notion API errors into clear errors without leaking token", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          object: "error",
          status: 401,
          code: "unauthorized",
          message: "API token is invalid.",
        },
        false,
        401,
        "Unauthorized",
      ),
    );

    const promise = search({ integrationToken, query: "anything" });

    await expect(promise).rejects.toThrow(
      "Notion API error 401: API token is invalid.",
    );
    await promise.catch((error: unknown) => {
      expect(String(error)).not.toContain(integrationToken);
    });
  });

  it("rejects unsupported Notion endpoints", async () => {
    await expect(
      notionApiRequest(integrationToken, "users", {}),
    ).rejects.toThrow("Unsupported Notion endpoint: users");
  });

  it("rejects invalid JSON inputs before sending a request", async () => {
    await expect(
      createPage({
        integrationToken,
        parentType: "page_id",
        parentId: "page-1",
        propertiesJson: "{invalid",
      }),
    ).rejects.toThrow("propertiesJson must be valid JSON");
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});

function jsonResponse(
  body: unknown,
  ok = true,
  status = 200,
  statusText = "OK",
): Response {
  return {
    ok,
    status,
    statusText,
    json: async () => body,
  } as Response;
}

function firstFetchCall(fetchMock: ReturnType<typeof vi.mocked<typeof fetch>>) {
  const [call] = fetchMock.mock.calls;
  expect(call).toBeDefined();
  return call as NonNullable<typeof call>;
}
