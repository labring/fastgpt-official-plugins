# Unified Image Generation

Unified image generation plugin supporting OpenAI, Seedream, Tongyi Wanx, and Nano Banana providers.

## Configuration

- `model`: Model name supported by the provider or OpenAI-compatible gateway.
- `apiKey`: Provider API Key.
- `baseUrl`: Optional custom base URL when using proxies or compatible gateways.

## Tools

- `OpenAI Image Generation`
- `Seedream Image Generation`
- `Tongyi Wanx Image Generation`
- `Nano Banana Image Generation`

Selecting a child tool selects the corresponding provider.

## Supported Providers

- `openai`: Compatible with image APIs returning `b64_json` or URL (e.g. `gpt-image-2`).
- `seedream`: Calls Volcano Engine image generation API (e.g. `doubao-seedream-4-0-250828`).
- `wanx`: Submits DashScope asynchronous task and polls for completion (e.g. `wanx2.1-t2i-turbo`).
- `nanobanana`: Calls Gemini native image generation API (e.g. `gemini-2.5-flash-image`).

## Outputs

- `imageUrl`: Public URL of the first generated image.
- `imageUrls`: Public URLs of all generated images.
- `provider`: Actual provider used.
- `model`: Actual model used.
- `taskId`: Task ID returned by asynchronous providers.
- `status`: Execution status returned by provider.
