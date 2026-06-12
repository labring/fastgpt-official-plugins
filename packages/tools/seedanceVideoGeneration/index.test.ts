import { afterEach, expect, test, vi } from "vitest";
import toolSet from "./index.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

test("exports video generation tool set", () => {
  expect(toolSet.userToolManifest.pluginId).toBe("seedanceVideoGeneration");
  expect(toolSet.userToolManifest.name).toEqual({
    en: "Seedance Video Generation",
    "zh-CN": "Seedance 视频生成",
  });
  expect([...toolSet.childManifests.keys()]).toEqual([
    "createSeedanceVideoGenerationTask",
    "querySeedanceVideoGenerationTask",
  ]);
});

test("children expose callable handlers", () => {
  expect([...toolSet.toolHandlers.keys()]).toEqual([
    "createSeedanceVideoGenerationTask",
    "querySeedanceVideoGenerationTask",
  ]);
});

test("create task posts Volcengine Ark payload", async () => {
  const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ id: "cgt-1" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

  const handler = toolSet.toolHandlers.get("createSeedanceVideoGenerationTask");
  const result = await handler?.handler(
    {
      model: "doubao-seedance-1-5-pro-251215",
      prompt: "小猫对着镜头打哈欠",
      firstFrameImageUrl: "https://example.com/first.png",
      lastFrameImageUrl: "https://example.com/last.png",
      resolution: "720p",
      ratio: "16:9",
      duration: 5,
      seed: 11,
      cameraFixed: false,
      watermark: true,
      generateAudio: false,
      returnLastFrame: true,
      priority: 5,
    },
    {
      secrets: {
        apiKey: "test-key",
      },
    } as never,
  );

  expect(result).toEqual({ taskId: "cgt-1" });
  expect(fetchMock).toHaveBeenCalledWith(
    "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks",
    expect.objectContaining({
      method: "POST",
      headers: {
        Authorization: "Bearer test-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "doubao-seedance-1-5-pro-251215",
        content: [
          {
            type: "text",
            text: "小猫对着镜头打哈欠",
          },
          {
            type: "image_url",
            image_url: { url: "https://example.com/first.png" },
            role: "first_frame",
          },
          {
            type: "image_url",
            image_url: { url: "https://example.com/last.png" },
            role: "last_frame",
          },
        ],
        return_last_frame: true,
        generate_audio: false,
        resolution: "720p",
        ratio: "16:9",
        duration: 5,
        seed: 11,
        camera_fixed: false,
        watermark: true,
        priority: 5,
      }),
    }),
  );
});

test("query task returns normalized task fields", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        id: "cgt-1",
        model: "seedance",
        status: "succeeded",
        content: {
          video_url: "https://example.com/video.mp4",
          last_frame_url: "https://example.com/last.png",
        },
        usage: {
          total_tokens: 100,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    ),
  );

  const handler = toolSet.toolHandlers.get("querySeedanceVideoGenerationTask");
  const result = await handler?.handler({ taskId: "cgt-1" }, {
    secrets: {
      apiKey: "test-key",
    },
  } as never);

  expect(result).toEqual({
    taskId: "cgt-1",
    status: "succeeded",
    videoUrl: "https://example.com/video.mp4",
    lastFrameUrl: "https://example.com/last.png",
    model: "seedance",
    usageTotalTokens: 100,
  });
});
