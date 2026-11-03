import { afterEach, expect, test, vi } from "vitest";
import toolSet from "../../..";
import { InputType, tool } from "..";

const input = {
  apiKey: "test-api-key",
  image1: "https://example.com/input.png",
  prompt: "Change the background to blue",
};

function mockResponse(data: unknown) {
  return vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

function mockImage() {
  mockResponse({
    output: {
      choices: [
        { message: { content: [{ image: "https://example.com/output.png" }] } },
      ],
    },
  });
}

function requestBody() {
  return JSON.parse(vi.mocked(fetch).mock.calls[0]![1]!.body as string);
}

afterEach(() => vi.unstubAllGlobals());

test("defaults existing workflows to qwen-image-2.0-pro", async () => {
  mockImage();
  await expect(tool(InputType.parse(input))).resolves.toEqual({
    image: "https://example.com/output.png",
  });
  expect(requestBody()).toEqual({
    model: "qwen-image-2.0-pro",
    input: {
      messages: [
        {
          role: "user",
          content: [{ image: input.image1 }, { text: input.prompt }],
        },
      ],
    },
    parameters: { n: 1 },
  });
  expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
  );
});

test.each(
  InputType.shape.model.unwrap().options,
)("sends selected model %s through the public handler", async (model) => {
  mockImage();
  const handler = toolSet.getToolHandler("qwenTx2Img")!;
  const parsed = handler.inputSchema.parse({
    ...input,
    model,
    image2: "https://example.com/second.png",
    image3: "data:image/png;base64,dGVzdA==",
    negative_prompt: "blurry",
    seed: 0,
  });
  await handler.handler(parsed, {
    secrets: { apiKey: input.apiKey },
    systemVar: {},
    invoke: {},
    streamResponse: vi.fn(),
  });
  expect(requestBody()).toEqual({
    model,
    input: {
      messages: [
        {
          role: "user",
          content: [
            { image: input.image1 },
            { image: "https://example.com/second.png" },
            { image: "data:image/png;base64,dGVzdA==" },
            { text: input.prompt },
          ],
        },
      ],
    },
    parameters: { n: 1, negative_prompt: "blurry", seed: 0 },
  });
});

test("rejects the retired model in both input schemas", () => {
  const retiredInput = { ...input, model: "qwen-image-edit" };
  expect(InputType.safeParse(retiredInput).success).toBe(false);
  expect(
    toolSet.getToolHandler("qwenTx2Img")!.inputSchema.safeParse(retiredInput)
      .success,
  ).toBe(false);
});

test("rejects an empty image response", async () => {
  mockResponse({ output: { choices: [] } });
  await expect(tool(input)).rejects.toBe("Failed to generate image");
});

test("propagates upstream HTTP failures", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ code: "InvalidApiKey" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
  );
  await expect(tool(input)).rejects.toThrow("Request failed with status 401");
});
