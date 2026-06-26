import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tool as fetchMessages } from "../children/fetchMessages/src";
import { tool as listChannels } from "../children/listChannels/src";
import { tool as sendMessage } from "../children/sendMessage/src";
import { slackApiRequest } from "../client";

const botToken = "xoxb-test-token";

describe("Slack tools", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sendMessage sends chat.postMessage and normalizes response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ok: true,
        channel: "C123",
        ts: "1710000000.000100",
        message: {
          text: "hello",
          thread_ts: "1709999999.000100",
        },
      }),
    );

    const result = await sendMessage({
      botToken,
      channel: "C123",
      text: "hello",
      thread_ts: "1709999999.000100",
      unfurl_links: false,
      unfurl_media: false,
    });

    expect(result).toEqual({
      channel: "C123",
      ts: "1710000000.000100",
      text: "hello",
      thread_ts: "1709999999.000100",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("https://slack.com/api/chat.postMessage");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${botToken}`,
      "Content-Type": "application/json; charset=utf-8",
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      channel: "C123",
      text: "hello",
      thread_ts: "1709999999.000100",
      unfurl_links: false,
      unfurl_media: false,
    });
  });

  it("listChannels fetches public and private channels", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ok: true,
        channels: [
          {
            id: "C123",
            name: "general",
            is_private: false,
            is_archived: false,
            is_member: true,
            num_members: 12,
            topic: { value: "Company news" },
            purpose: { value: "Announcements" },
          },
        ],
        response_metadata: {
          next_cursor: "next-page",
        },
      }),
    );

    const result = await listChannels({
      botToken,
      limit: 20,
      cursor: "cursor-1",
    });

    expect(result).toEqual({
      channels: [
        {
          id: "C123",
          name: "general",
          is_private: false,
          is_archived: false,
          is_member: true,
          num_members: 12,
          topic: "Company news",
          purpose: "Announcements",
        },
      ],
      next_cursor: "next-page",
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    const requestUrl = new URL(String(url));
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      "https://slack.com/api/conversations.list",
    );
    expect(requestUrl.searchParams.get("types")).toBe(
      "public_channel,private_channel",
    );
    expect(requestUrl.searchParams.get("limit")).toBe("20");
    expect(requestUrl.searchParams.get("cursor")).toBe("cursor-1");
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${botToken}`,
    });
  });

  it("fetchMessages fetches conversations.history and normalizes optional fields", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ok: true,
        messages: [
          {
            type: "message",
            user: "U123",
            text: "hi",
            ts: "1710000000.000100",
          },
        ],
        has_more: true,
        response_metadata: {},
      }),
    );

    const result = await fetchMessages({
      botToken,
      channel: "C123",
      limit: 10,
      oldest: "1700000000.000100",
      latest: "1710000000.000100",
    });

    expect(result).toEqual({
      messages: [
        {
          type: "message",
          user: "U123",
          username: null,
          text: "hi",
          ts: "1710000000.000100",
          thread_ts: null,
          reply_count: null,
        },
      ],
      has_more: true,
      next_cursor: "",
    });

    const [url] = fetchMock.mock.calls[0]!;
    const requestUrl = new URL(String(url));
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      "https://slack.com/api/conversations.history",
    );
    expect(requestUrl.searchParams.get("channel")).toBe("C123");
    expect(requestUrl.searchParams.get("limit")).toBe("10");
    expect(requestUrl.searchParams.get("oldest")).toBe("1700000000.000100");
    expect(requestUrl.searchParams.get("latest")).toBe("1710000000.000100");
  });

  it("turns Slack ok:false into a clear error without leaking token", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        ok: false,
        error: "channel_not_found",
      }),
    );

    const promise = sendMessage({
      botToken,
      channel: "C404",
      text: "hello",
    });

    await expect(promise).rejects.toThrow("Slack API error: channel_not_found");
    await promise.catch((error: unknown) => {
      expect(String(error)).not.toContain(botToken);
    });
  });

  it("rejects unsupported Slack endpoints", async () => {
    await expect(
      slackApiRequest(botToken, "users.list", {}),
    ).rejects.toThrow("Unsupported Slack endpoint: users.list");
  });
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
  } as Response;
}
