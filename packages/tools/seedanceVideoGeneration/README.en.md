# Seedance Video Generation

Create and query video generation tasks using Volcano Ark Seedance Video Generation API.

## Tools

- `createSeedanceVideoGenerationTask`: Create a video generation task supporting text-to-video, first-frame image-to-video, and first-to-last frame image-to-video.
- `querySeedanceVideoGenerationTask`: Query task status, video URL, last frame URL, error details, and token usage by task ID.

## Secrets

- `apiKey`: Required. Volcano Ark API Key.
- `baseUrl`: Optional. Defaults to `https://ark.cn-beijing.volces.com/api/v3`.

## Create Task Inputs

- `model`: Volcano Ark video model ID or Endpoint ID.
- `prompt`: Video prompt text.
- `firstFrameImageUrl`: Optional first frame or reference image URL.
- `lastFrameImageUrl`: Optional last frame image URL.
- `ratio`: Optional aspect ratio.
- `resolution`: Optional resolution (e.g. 720p).
- `duration`: Optional duration in seconds.
- `seed`: Optional random seed.
- `cameraFixed`: Optional boolean for fixed camera.
- `watermark`: Optional boolean for watermark.
- `generateAudio`: Optional boolean for audio generation.
- `returnLastFrame`: Optional boolean to return the last frame.
- `callbackUrl`: Optional webhook URL for task status changes.
- `safetyIdentifier`: Optional unique identifier for end-user safety tracing.
- `priority`: Optional task priority (0-9).

Top-level configuration parameters (`ratio`, `resolution`, `duration`, `seed`, `cameraFixed`, `watermark`) are passed according to Volcano Ark specifications:

```json
{
  "prompt": "A cat yawning at the camera",
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5
}
```

## Outputs

- `taskId`: Task ID of the video generation task.
- `status`: Execution status.
- `videoUrl`: URL of the generated video upon success.
- `lastFrameUrl`: URL of the last video frame upon success.
- `errorCode`: Upstream error code if any.
- `errorMessage`: Error message if failed.
