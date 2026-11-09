# Seedance 视频生成

使用火山方舟 Seedance 视频生成 API 创建和查询视频生成任务。

## 工具

- `createSeedanceVideoGenerationTask`: 创建视频生成任务，支持文生视频、首帧图生视频、首尾帧图生视频。
- `querySeedanceVideoGenerationTask`: 根据任务 ID 查询状态、视频 URL、尾帧 URL、错误信息和 token 用量。

## 密钥

- `apiKey`: 必填。火山方舟 API Key。
- `baseUrl`: 可选。默认 `https://ark.cn-beijing.volces.com/api/v3`。

## 创建任务输入

- `model`: 火山方舟视频模型 ID 或 Endpoint ID。
- `prompt`: 视频提示词。
- `firstFrameImageUrl`: 可选，首帧或参考图。
- `lastFrameImageUrl`: 可选，尾帧图。
- `ratio`: 可选，宽高比。
- `resolution`: 可选，分辨率。
- `duration`: 可选，视频时长，单位秒。
- `seed`: 可选，随机种子。
- `cameraFixed`: 可选，是否固定镜头。
- `watermark`: 可选，是否加水印。
- `generateAudio`: 可选，是否生成同步音频。
- `returnLastFrame`: 可选，是否返回尾帧。
- `callbackUrl`: 可选，任务状态变化回调地址。
- `safetyIdentifier`: 可选，终端用户唯一标识。
- `priority`: 可选，任务优先级，0-9。

`ratio`、`resolution`、`duration`、`seed`、`cameraFixed`、`watermark` 会按照火山方舟文档作为请求体顶层字段传入，例如：

```json
{
  "prompt": "小猫对着镜头打哈欠",
  "resolution": "720p",
  "ratio": "16:9",
  "duration": 5
}
```

## 输出

- `taskId`: 视频生成任务 ID。
- `status`: 任务状态。
- `videoUrl`: 成功后的视频 URL。
- `lastFrameUrl`: 成功后的视频尾帧 URL。
- `errorCode`: 上游错误码。
- `errorMessage`: 上游错误信息。
- `model`: 实际模型。
- `createdAt`: 创建时间。
- `updatedAt`: 更新时间。
- `usageTotalTokens`: 总 token 用量。

## 说明

视频 URL 和尾帧 URL 有有效期，火山方舟文档说明视频 URL 有效期为 24 小时，请及时下载或转存。

## 开发

```bash
pnpm install
pnpm run test
pnpm run build
npx @fastgpt-plugin/cli check --entry . --output ./dist
pnpm run pack
```
