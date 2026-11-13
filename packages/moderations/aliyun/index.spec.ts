import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkText, secretSchema } from "./src/moderation";

const mocks = vi.hoisted(() => ({ request: vi.fn(), config: vi.fn() }));
vi.mock("@alicloud/green20220302", () => ({
  default: class {
    constructor(config: unknown) {
      mocks.config(config);
    }
    textModerationPlusWithOptions = mocks.request;
  },
  TextModerationPlusRequest: class {
    constructor(data: object) {
      Object.assign(this, data);
    }
  },
}));

const secrets = secretSchema.parse({
  accessKeyId: "test-id",
  accessKeySecret: "test-secret",
});
const response = (riskLevel: string, result: object[] = []) => ({
  statusCode: 200,
  body: { code: 200, requestId: "request-1", data: { riskLevel, result } },
});
beforeEach(() => vi.resetAllMocks());

describe("Alibaba Cloud TextModerationPlus", () => {
  it.each<[string, string]>([
    ["none", "pass"],
    ["low", "pass"],
    ["medium", "suspected"],
    ["high", "block"],
  ])("maps %s to %s", async (risk, verdict) => {
    mocks.request.mockResolvedValue(response(risk));
    expect(await checkText({ content: "text" }, secrets)).toMatchObject({
      verdict,
      requestId: "request-1",
    });
  });

  it("sends credentials only to the regional endpoint and forwards content and dataId", async () => {
    mocks.request.mockResolvedValue(response("none"));
    await checkText({ content: "hello", dataId: "text-1" }, secrets);
    expect(mocks.config).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: "green-cip.cn-shanghai.aliyuncs.com",
        protocol: "HTTPS",
      }),
    );
    expect(mocks.request).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "llm_query_moderation",
        serviceParameters: JSON.stringify({
          content: "hello",
          dataId: "text-1",
        }),
      }),
      expect.objectContaining({ autoretry: false, readTimeout: 10000 }),
    );
  });

  it("preserves multiple native labels, zero confidence, custom keywords and positions", async () => {
    mocks.request.mockResolvedValue(
      response("high", [
        {
          label: "porn",
          confidence: 99.2,
          riskWords: "one,two",
          riskPositions: [{ riskWord: "one" }],
          customizedHit: [{ keyWords: "three,two" }],
        },
        { label: "new_label", confidence: 0 },
      ]),
    );
    const result = await checkText({ content: "text" }, secrets);
    expect(result.hits).toEqual([
      {
        label: "porn",
        providerLabel: "porn",
        score: 99.2,
        keywords: ["one", "two", "three"],
      },
      { label: "other", providerLabel: "new_label", score: 0, keywords: [] },
    ]);
  });

  it("omits a safe marker and does not invent confidence", async () => {
    mocks.request.mockResolvedValue(
      response("low", [{ label: "nonLabel" }, { label: "politics" }]),
    );
    expect((await checkText({ content: "text" }, secrets)).hits).toEqual([
      { label: "politics", providerLabel: "politics", keywords: [] },
    ]);
  });

  it.each([
    undefined,
    { code: 200 },
    { code: 200, data: { riskLevel: "unknown" } },
    { code: 403, message: "private credentials" },
  ])("returns error for missing, invalid or unsuccessful responses", async (body) => {
    mocks.request.mockResolvedValue({ statusCode: 200, body });
    expect(await checkText({ content: "text" }, secrets)).toMatchObject({
      verdict: "error",
      hits: [],
      errorMessage: expect.any(String),
    });
  });

  it("does not expose SDK exceptions, credentials, or submitted text", async () => {
    mocks.request.mockRejectedValue(new Error("test-secret private user text"));
    const result = await checkText({ content: "private user text" }, secrets);
    expect(result.verdict).toBe("error");
    expect(JSON.stringify(result)).not.toMatch(/test-secret|private user text/);
  });

  it("rejects unsupported regions and missing credentials", () => {
    expect(secretSchema.safeParse({}).success).toBe(false);
    expect(
      secretSchema.safeParse({ ...secrets, regionId: "evil.example" }).success,
    ).toBe(false);
  });
});
