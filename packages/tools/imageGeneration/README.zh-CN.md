# Image Generation

统一图片生成插件，支持 OpenAI、Seedream、通义万相 Wanx 和 Nano Banana。

## 激活配置

- `model`：模型名，填写当前服务商或 OpenAI-compatible 网关支持的真实模型名。
- `apiKey`：服务商 API Key。
- `baseUrl`：可选。接入官方 API 时可不填；仅使用代理或兼容接口时填写。

## 子工具

- `OpenAI 图片生成`
- `Seedream 图片生成`
- `通义万相图片生成`
- `Nano Banana 图片生成`

选择子工具即选择服务商。

## 支持渠道

- `openai`：兼容返回 `b64_json` 或 URL 的图片接口，模型名由用户输入，例如 `gpt-image-2`。
- `seedream`：调用火山方舟图片生成接口，模型名由用户输入，例如 `doubao-seedream-4-0-250828`。
- `wanx`：提交 DashScope 异步任务并查询结果，模型名由用户输入，例如 `wanx2.1-t2i-turbo`。
- `nanobanana`：调用 Gemini 原生图片生成接口，模型名由用户输入，例如 `gemini-2.5-flash-image`、`gemini-3.1-flash-image`。

## 输出

- `imageUrl`：第一张图片的可访问 URL。
- `imageUrls`：全部图片的可访问 URL。
- `provider`：实际使用的服务商。
- `model`：实际使用的模型。
- `taskId`：异步服务商返回的任务 ID。
- `status`：服务商返回或插件归一化后的状态。
