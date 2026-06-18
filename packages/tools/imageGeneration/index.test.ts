import { afterEach, expect, test, vi } from "vitest";
import toolSet from ".";
import { tool } from "./src";

afterEach(() => {
  vi.restoreAllMocks();
});

test("exports a FastGPT tool", () => {
  expect(toolSet).toBeDefined();
  expect(typeof toolSet).toBe("object");
});

test("splits providers into child tools and keeps model in activation config", () => {
  const manifest = toolSet.getUserToolManifest();
  const secretSchema = toolSet.getSecretSchema();
  const childManifests = toolSet.getChildManifests();
  const openaiHandler = toolSet.getToolHandler("openaiImageGeneration");

  expect(manifest.version).toBe("0.0.11");
  expect(Object.keys(secretSchema.shape)).toEqual([
    "model",
    "apiKey",
    "baseUrl",
  ]);
  expect(childManifests.map((child) => child.id)).toEqual([
    "openaiImageGeneration",
    "seedreamImageGeneration",
    "wanxImageGeneration",
    "nanobananaImageGeneration",
  ]);
  expect(openaiHandler?.inputSchema.shape.provider).toBeUndefined();
  expect(openaiHandler?.inputSchema.shape.model).toBeUndefined();
});

test("keeps provider child inputs narrow", () => {
  expect(
    Object.keys(
      toolSet.getToolHandler("openaiImageGeneration")?.inputSchema.shape ?? {},
    ),
  ).toEqual(["prompt", "size", "imageCount"]);
  expect(
    Object.keys(
      toolSet.getToolHandler("seedreamImageGeneration")?.inputSchema.shape ??
        {},
    ),
  ).toEqual(["prompt", "size"]);
  expect(
    Object.keys(
      toolSet.getToolHandler("wanxImageGeneration")?.inputSchema.shape ?? {},
    ),
  ).toEqual(["prompt", "imageCount", "negativePrompt"]);
  expect(
    Object.keys(
      toolSet.getToolHandler("nanobananaImageGeneration")?.inputSchema.shape ??
        {},
    ),
  ).toEqual(["prompt", "aspectRatio"]);
});

test("normalizes OpenAI base64 image output", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, init) => {
      expect(url).toBe("https://api.openai.com/v1/images/generations");
      expect(JSON.parse(init.body as string)).toMatchObject({
        model: "gpt-image-2",
        prompt: "a cat",
        size: "1024x1024",
      });
      return jsonResponse({
        data: [{ b64_json: Buffer.from("image").toString("base64") }],
      });
    }),
  );

  const output = await tool({
    provider: "openai",
    model: "gpt-image-2",
    apiKey: "key",
    prompt: "a cat",
  });

  expect(output.imageUrl).toMatch(/^data:image\/png;base64,/);
  expect(output.imageUrls).toHaveLength(1);
  expect(output.model).toBe("gpt-image-2");
});

test("accepts OpenAI v1 base URL and maps legacy quality values", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementationOnce(async (url, init) => {
      expect(url).toBe("https://api.openai.com/v1/images/generations");
      expect(JSON.parse(init.body as string)).toMatchObject({
        quality: "high",
      });
      return jsonResponse({
        data: [{ url: "https://example.com/openai.png" }],
      });
    }),
  );

  const output = await tool({
    provider: "openai",
    apiKey: "key",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-image-2",
    prompt: "a cat",
    quality: "hd",
  });

  expect(output.imageUrl).toBe("https://example.com/openai.png");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("normalizes Seedream URL output", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementationOnce(async (url, init) => {
      expect(url).toBe(
        "https://ark.cn-beijing.volces.com/api/v3/images/generations",
      );
      expect(JSON.parse(init.body as string)).toMatchObject({
        model: "doubao-seedream-4-0-250828",
        prompt: "a cat",
      });
      return jsonResponse({ data: [{ url: "https://example.com/cat.png" }] });
    }),
  );

  const output = await tool({
    provider: "seedream",
    apiKey: "key",
    model: "doubao-seedream-4-0-250828",
    prompt: "a cat",
  });

  expect(output.imageUrl).toBe("https://example.com/cat.png");
  expect(output.imageUrls).toEqual(["https://example.com/cat.png"]);
  expect(output.status).toBe("succeeded");
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("returns provider URL without uploading when upload context exists", async () => {
  const uploadFile = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementationOnce(async (url, init) => {
      expect(url).toBe(
        "https://ark.cn-beijing.volces.com/api/v3/images/generations",
      );
      expect(JSON.parse(init.body as string)).toMatchObject({
        model: "doubao-seedream-4-0-250828",
        prompt: "a cat",
      });
      return jsonResponse({ data: [{ url: "https://example.com/cat.png" }] });
    }),
  );

  const output = await tool(
    {
      provider: "seedream",
      apiKey: "key",
      model: "doubao-seedream-4-0-250828",
      prompt: "a cat",
    },
    {
      invoke: {
        uploadFile,
      },
    },
  );

  expect(output.imageUrl).toBe("https://example.com/cat.png");
  expect(output.imageUrls).toEqual(["https://example.com/cat.png"]);
  expect(uploadFile).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledTimes(1);
});

test("polls Wanx task until succeeded", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementationOnce(async (url, init) => {
        expect(url).toBe(
          "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
        );
        expect(init.headers).toMatchObject({
          Authorization: "Bearer key",
          "X-DashScope-Async": "enable",
        });
        expect(JSON.parse(init.body as string)).toMatchObject({
          model: "wanx2.1-t2i-turbo",
          input: {
            prompt: "a cat",
          },
        });
        return jsonResponse({
          output: {
            task_id: "task-1",
            task_status: "PENDING",
          },
        });
      })
      .mockResolvedValueOnce(
        jsonResponse({
          output: {
            task_status: "RUNNING",
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          output: {
            task_status: "SUCCEEDED",
            results: [{ url: "https://example.com/wanx.png" }],
          },
        }),
      ),
  );

  const output = await tool({
    provider: "wanx",
    apiKey: "key",
    model: "wanx2.1-t2i-turbo",
    prompt: "a cat",
    pollIntervalMs: 1,
  });

  expect(output.imageUrl).toBe("https://example.com/wanx.png");
  expect(output.imageUrls).toEqual(["https://example.com/wanx.png"]);
  expect(output.taskId).toBe("task-1");
  expect(output.status).toBe("SUCCEEDED");
  expect(fetch).toHaveBeenCalledTimes(3);
});

test("uses Wanx generation protocol for wan2.6 models", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementationOnce(async (url, init) => {
        expect(url).toBe(
          "https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation",
        );
        expect(init.headers).toMatchObject({
          Authorization: "Bearer key",
          "X-DashScope-Async": "enable",
        });
        expect(JSON.parse(init.body as string)).toMatchObject({
          model: "wan2.6-t2i",
          input: {
            messages: [
              {
                role: "user",
                content: [{ text: "a cat" }],
              },
            ],
          },
          parameters: {
            size: "1280*1280",
            n: 1,
            negative_prompt: "dog",
          },
        });
        return jsonResponse({
          output: {
            task_id: "task-2",
            task_status: "PENDING",
          },
        });
      })
      .mockResolvedValueOnce(
        jsonResponse({
          output: {
            task_status: "SUCCEEDED",
            choices: [
              {
                message: {
                  content: [{ image: "https://example.com/wan26.png" }],
                },
              },
            ],
          },
        }),
      ),
  );

  const output = await tool({
    provider: "wanx",
    apiKey: "key",
    model: "wan2.6-t2i",
    prompt: "a cat",
    size: "1280*1280",
    imageCount: 1,
    negativePrompt: "dog",
    pollIntervalMs: 1,
  });

  expect(output.imageUrl).toBe("https://example.com/wan26.png");
  expect(output.imageUrls).toEqual(["https://example.com/wan26.png"]);
  expect(output.taskId).toBe("task-2");
  expect(output.status).toBe("SUCCEEDED");
  expect(fetch).toHaveBeenCalledTimes(2);
});

test("uses Wanx generation protocol for wan2.7 image models", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementationOnce(async (url, init) => {
        expect(url).toBe(
          "https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation",
        );
        const body = JSON.parse(init.body as string);
        expect(body).toMatchObject({
          model: "wan2.7-image",
          input: {
            messages: [
              {
                role: "user",
                content: [{ text: "a cat" }],
              },
            ],
          },
          parameters: {
            n: 1,
          },
        });
        expect(body.parameters).not.toHaveProperty("negative_prompt");
        return jsonResponse({
          output: {
            task_id: "task-27",
            task_status: "PENDING",
          },
        });
      })
      .mockResolvedValueOnce(
        jsonResponse({
          output: {
            task_status: "SUCCEEDED",
            choices: [
              {
                message: {
                  content: [{ image: "https://example.com/wan27.png" }],
                },
              },
            ],
          },
        }),
      ),
  );

  const output = await tool({
    provider: "wanx",
    apiKey: "key",
    model: "wan2.7-image",
    prompt: "a cat",
    imageCount: 1,
    negativePrompt: "dog",
    pollIntervalMs: 1,
  });

  expect(output.imageUrl).toBe("https://example.com/wan27.png");
  expect(output.imageUrls).toEqual(["https://example.com/wan27.png"]);
  expect(output.taskId).toBe("task-27");
  expect(output.status).toBe("SUCCEEDED");
  expect(fetch).toHaveBeenCalledTimes(2);
});

test("normalizes Nano Banana inline image output", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, init) => {
      expect(url).toBe(
        "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-image:generateContent",
      );
      expect(init.headers).toMatchObject({
        "x-goog-api-key": "key",
        "Content-Type": "application/json",
      });
      expect(JSON.parse(init.body as string)).toMatchObject({
        contents: [{ parts: [{ text: "a cat" }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          responseFormat: {
            image: {
              aspectRatio: "1:1",
            },
          },
        },
      });
      return jsonResponse({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: Buffer.from("image").toString("base64"),
                  },
                },
              ],
            },
          },
        ],
      });
    }),
  );

  const output = await tool({
    provider: "nanobanana",
    apiKey: "key",
    model: "gemini-2.5-flash-image",
    prompt: "a cat",
    aspectRatio: "1:1",
  });

  expect(output.imageUrl).toMatch(/^data:image\/png;base64,/);
  expect(output.imageUrls).toHaveLength(1);
  expect(output.model).toBe("gemini-2.5-flash-image");
  expect(output.status).toBe("succeeded");
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
