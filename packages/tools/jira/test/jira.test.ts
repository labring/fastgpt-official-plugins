import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tool as addComment } from "../children/addComment/src";
import { tool as createIssue } from "../children/createIssue/src";
import { tool as getIssue } from "../children/getIssue/src";
import { tool as searchIssues } from "../children/searchIssues/src";
import { jiraApiRequest } from "../client";

const auth = {
  siteUrl: "https://example.atlassian.net",
  email: "bot@example.com",
  apiToken: "jira_api_token_123456",
};

describe("Jira tools", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("searchIssues posts JQL to Jira search and normalizes issues", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        issues: [jiraIssue()],
        isLast: false,
        nextPageToken: "page-2",
      }),
    );

    const result = await searchIssues({
      ...auth,
      jql: "project = PROJ ORDER BY created DESC",
      maxResults: 5,
      nextPageToken: "page-1",
      fields: "summary,status,assignee,project",
    });

    expect(result.issues[0]).toMatchObject({
      id: "10001",
      key: "PROJ-123",
      url: "https://example.atlassian.net/browse/PROJ-123",
      summary: "Fix login",
      status: "To Do",
      project_key: "PROJ",
      assignee: "Ada Lovelace",
    });
    expect(result.is_last).toBe(false);
    expect(result.next_page_token).toBe("page-2");

    const [url, init] = firstFetchCall(fetchMock);
    expect(String(url)).toBe(
      "https://example.atlassian.net/rest/api/3/search/jql",
    );
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: `Basic ${btoa(`${auth.email}:${auth.apiToken}`)}`,
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      jql: "project = PROJ ORDER BY created DESC",
      maxResults: 5,
      nextPageToken: "page-1",
      fields: ["summary", "status", "assignee", "project"],
    });
  });

  it("getIssue retrieves a Jira issue by key", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(jiraIssue()));

    const result = await getIssue({
      ...auth,
      issueKeyOrId: "PROJ-123",
      fields: "summary,status,reporter",
    });

    expect(result.key).toBe("PROJ-123");
    expect(result.reporter).toBe("Grace Hopper");

    const [url] = firstFetchCall(vi.mocked(fetch));
    const requestUrl = new URL(String(url));
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      "https://example.atlassian.net/rest/api/3/issue/PROJ-123",
    );
    expect(requestUrl.searchParams.get("fields")).toBe(
      "summary,status,reporter",
    );
  });

  it("createIssue posts issue fields with ADF description", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        id: "10002",
        key: "PROJ-124",
        self: "https://example.atlassian.net/rest/api/3/issue/10002",
      }),
    );

    const result = await createIssue({
      ...auth,
      projectKey: "proj",
      issueTypeName: "Bug",
      summary: "Broken checkout",
      description: "Line one\nLine two",
      additionalFieldsJson: JSON.stringify({
        priority: { name: "High" },
      }),
    });

    expect(result).toEqual({
      id: "10002",
      key: "PROJ-124",
      self: "https://example.atlassian.net/rest/api/3/issue/10002",
      url: "https://example.atlassian.net/browse/PROJ-124",
    });

    const [url, init] = firstFetchCall(vi.mocked(fetch));
    expect(String(url)).toBe("https://example.atlassian.net/rest/api/3/issue");
    expect(JSON.parse(String(init?.body))).toEqual({
      fields: {
        priority: { name: "High" },
        project: { key: "PROJ" },
        issuetype: { name: "Bug" },
        summary: "Broken checkout",
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Line one" }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Line two" }],
            },
          ],
        },
      },
    });
  });

  it("addComment posts plain text as ADF", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        id: "20001",
        self: "https://example.atlassian.net/rest/api/3/issue/PROJ-123/comment/20001",
        created: "2026-01-01T00:00:00.000+0000",
        updated: "2026-01-01T00:00:00.000+0000",
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Investigating now" }],
            },
          ],
        },
      }),
    );

    const result = await addComment({
      ...auth,
      issueKeyOrId: "PROJ-123",
      body: "Investigating now",
    });

    expect(result.body_text).toBe("Investigating now");
    const [url, init] = firstFetchCall(vi.mocked(fetch));
    expect(String(url)).toBe(
      "https://example.atlassian.net/rest/api/3/issue/PROJ-123/comment",
    );
    expect(JSON.parse(String(init?.body))).toEqual({
      body: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Investigating now" }],
          },
        ],
      },
    });
  });

  it("turns Jira API errors into clear errors without leaking token", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          errorMessages: [`Invalid token ${auth.apiToken}`],
        },
        false,
        401,
        "Unauthorized",
      ),
    );

    const promise = searchIssues({
      ...auth,
      jql: "project = PROJ",
    });

    await expect(promise).rejects.toThrow(
      "Jira API error 401: Invalid token [REDACTED]",
    );
    await promise.catch((error: unknown) => {
      expect(String(error)).not.toContain(auth.apiToken);
      expect(String(error)).not.toContain(
        btoa(`${auth.email}:${auth.apiToken}`),
      );
    });
  });

  it("rejects unsupported hosts and endpoints", async () => {
    await expect(
      searchIssues({
        ...auth,
        siteUrl: "https://jira.internal.example.com",
        jql: "project = PROJ",
      }),
    ).rejects.toThrow("Jira site URL must be an Atlassian Cloud");

    await expect(jiraApiRequest(auth, "project", {})).rejects.toThrow(
      "Unsupported Jira endpoint: project",
    );
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("rejects reserved fields and invalid JSON before sending a request", async () => {
    await expect(
      createIssue({
        ...auth,
        projectKey: "PROJ",
        issueTypeName: "Task",
        summary: "New issue",
        additionalFieldsJson: JSON.stringify({
          summary: "override",
        }),
      }),
    ).rejects.toThrow("additionalFieldsJson cannot override reserved field");

    await expect(
      createIssue({
        ...auth,
        projectKey: "PROJ",
        issueTypeName: "Task",
        summary: "New issue",
        additionalFieldsJson: "{invalid",
      }),
    ).rejects.toThrow("additionalFieldsJson must be valid JSON");

    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});

function jiraIssue() {
  return {
    id: "10001",
    key: "PROJ-123",
    fields: {
      summary: "Fix login",
      status: { name: "To Do" },
      assignee: { displayName: "Ada Lovelace" },
      reporter: { displayName: "Grace Hopper" },
      created: "2026-01-01T00:00:00.000+0000",
      updated: "2026-01-02T00:00:00.000+0000",
      issuetype: { name: "Bug" },
      project: { key: "PROJ" },
      priority: { name: "High" },
    },
  };
}

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
