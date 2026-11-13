import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkText, mapResponse, secretSchema } from "./src/moderation";

const { request, createClient } = vi.hoisted(() => ({
  request: vi.fn(),
  createClient: vi.fn(),
}));
vi.mock("tencentcloud-sdk-nodejs-tms", () => ({
  tms: {
    v20201229: {
      Client: class {
        constructor(options: unknown) {
          createClient(options);
        }
        TextModeration = request;
      },
    },
  },
}));
const secrets = secretSchema.parse({
  secretId: "test-id",
  secretKey: "test-key",
  bizType: "chat-policy",
});

beforeEach(() => vi.clearAllMocks());
describe("Tencent Cloud TMS", () => {
  it.each([
    ["Pass", "pass"],
    ["Review", "suspected"],
    ["Block", "block"],
  ])("maps %s to %s without inventing scores", (Suggestion, verdict) => {
    expect(
      mapResponse({
        Suggestion,
        Label: Suggestion === "Pass" ? "Normal" : "Porn",
      }),
    ).toMatchObject({ verdict });
  });
  it("retains all categories, zero scores, custom labels and keywords", () => {
    expect(
      mapResponse({
        Suggestion: "Block",
        RequestId: "trace-1",
        DetailResults: [
          {
            Label: "Porn",
            Score: 99,
            Keywords: ["first"],
            SubLabel: "Explicit",
            Tags: [{ Keyword: "second" }],
          },
          { Label: "CustomPolicy", Score: 0, Keywords: ["third"] },
          { Label: "Normal", Score: 100 },
        ],
      }),
    ).toEqual({
      verdict: "block",
      requestId: "trace-1",
      hits: [
        {
          label: "porn",
          providerLabel: "Porn",
          score: 99,
          keywords: ["first", "second"],
          subLabel: "Explicit",
        },
        {
          label: "other",
          providerLabel: "CustomPolicy",
          score: 0,
          keywords: ["third"],
        },
      ],
    });
  });
  it("preserves tag-level sublabels and their native scores", () => {
    expect(
      mapResponse({
        Suggestion: "Review",
        DetailResults: [
          {
            Label: "Ad",
            Tags: [{ SubLabel: "Contact", Score: 0, Keyword: "contact" }],
          },
        ],
      }).hits,
    ).toEqual([
      { label: "ad", providerLabel: "Ad", keywords: ["contact"] },
      {
        label: "ad",
        providerLabel: "Ad",
        subLabel: "Contact",
        score: 0,
        keywords: ["contact"],
      },
    ]);
  });
  it("handles null optional fields and uses the top-level result when details are absent", () => {
    expect(
      mapResponse({
        Suggestion: "Review",
        Label: "Polity",
        Score: 80,
        DetailResults: null,
        Keywords: null,
      }),
    ).toEqual({
      verdict: "suspected",
      hits: [
        { label: "politics", providerLabel: "Polity", score: 80, keywords: [] },
      ],
    });
  });
  it("passes UTF-8 Base64 text, policy and correlation metadata to the official SDK", async () => {
    request.mockResolvedValue({
      Suggestion: "Pass",
      Label: "Normal",
      RequestId: "trace",
    });
    await expect(
      checkText(
        {
          content: "你好 world",
          dataId: "data-1",
          sessionId: "session-1",
          userId: "user-1",
          userIp: "127.0.0.1",
        },
        secrets,
      ),
    ).resolves.toEqual({ verdict: "pass", hits: [], requestId: "trace" });
    expect(request).toHaveBeenCalledWith({
      Content: Buffer.from("你好 world").toString("base64"),
      BizType: "chat-policy",
      DataId: "data-1",
      SessionId: "session-1",
      User: { UserId: "user-1", AccountType: 7 },
      Device: { IP: "127.0.0.1" },
    });
    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "ap-guangzhou",
        profile: {
          httpProfile: { endpoint: "tms.tencentcloudapi.com", reqTimeout: 15 },
        },
      }),
    );
  });
  it("omits unset optional request fields", async () => {
    request.mockResolvedValue({ Suggestion: "Pass", Label: "Normal" });
    await checkText(
      { content: "hello" },
      { secretId: "id", secretKey: "key", region: "ap-guangzhou" },
    );
    expect(request).toHaveBeenCalledWith({ Content: "aGVsbG8=" });
  });
  it.each([
    {},
    { Suggestion: "Unknown" },
    { Suggestion: "Block" },
    { Suggestion: "Block", Label: "Porn", Score: 101 },
  ])("returns error for invalid upstream responses: %j", async (response) => {
    request.mockResolvedValue(response);
    await expect(
      checkText({ content: "hello" }, secrets),
    ).resolves.toMatchObject({
      verdict: "error",
      hits: [],
      errorMessage: expect.any(String),
    });
  });
  it("does not expose upstream error messages, credentials or original text", async () => {
    request.mockRejectedValue(
      new Error("test-key private-content Authorization signature"),
    );
    const result = await checkText({ content: "private-content" }, secrets);
    expect(result.verdict).toBe("error");
    expect(JSON.stringify(result)).not.toMatch(
      /test-key|private-content|Authorization|signature/,
    );
  });
  it("requires credentials and supplies a default region", () => {
    expect(secretSchema.safeParse({}).success).toBe(false);
    expect(secrets.region).toBe("ap-guangzhou");
  });
});
