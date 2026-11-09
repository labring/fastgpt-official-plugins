# aliModelStudio

This is an Aliyun Model Studio toolset, supporting various model services provided by the Aliyun Model Studio platform.

## Qwen image editing

Configure an Alibaba Cloud Model Studio API key for the Beijing region in the toolset's `apiKey` secret.

The `qwenTx2Img` tool accepts a required `prompt` and `image1`, optional `image2` and `image3` (public URLs or Base64 data URLs), and optional `negative_prompt` and `seed` parameters. It returns one generated image URL in `image`; the URL expires after 24 hours.

Select the optional `model` input from:

- `qwen-image-2.0-pro` (default; recommended)
- `qwen-image-2.0-pro-2026-06-22`
- `qwen-image-2.0-pro-2026-04-22`
- `qwen-image-2.0-pro-2026-03-03`
- `qwen-image-2.0`
- `qwen-image-2.0-2026-03-03`

Existing workflows that omit `model` automatically use `qwen-image-2.0-pro` instead of the retired `qwen-image-edit`. Model availability depends on the account and region. Prompts support Chinese and English, up to 1300 tokens.

The request uses the synchronous multimodal generation endpoint, with `n: 1`, `negative_prompt`, and `seed` in `parameters`.

API reference: https://help.aliyun.com/zh/model-studio/qwen-image-edit-api
