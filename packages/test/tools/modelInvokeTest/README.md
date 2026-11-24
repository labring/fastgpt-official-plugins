# 模型反向调用测试

通过 `ctx.invoke.createModelClient()` 与 `Model`（`format: "modelId"`）测试 FastGPT 插件模型反向调用链路，覆盖：

- FastGPT UI 模型选择框渲染与 `isToolParam: false` 防护
- `model:invoke` 权限声明与端到端鉴权
- 非流式与流式（`stream: true` + `stream_options.include_usage` + `ctx.streamResponse`）输出
- `temperature`、`max_tokens`、`response_format: { type: "json_object" }` 参数透传
- `callCount > 1` 多次调用的账单累加验证

## 输入

- `model`: 必填，FastGPT 模型 ID（通过 `Model` 选择器配置）
- `prompt`: 必填，用户提示词
- `systemPrompt`: 可选，系统提示词
- `stream`: 可选，是否启用流式调用，默认 `false`
- `streamType`: 可选，流式消息类型（`answer` / `fastAnswer`），默认 `answer`
- `temperature`: 可选，采样温度（`0`–`2`）
- `maxTokens`: 可选，单次最大输出 Token（`1`–`32768`）
- `responseFormat`: 可选，响应格式（`text` / `json_object`），默认 `text`
- `callCount`: 可选，单次执行内连续调用模型的次数（`1`–`5`），默认 `1`

## 输出

- `reply`: 模型回复文本（多次调用时以 `\n---\n` 分隔）
- `reasoning`: 推理模型思考过程文本（非推理模型为空字符串）
- `model`: 响应中返回的实际模型标识
- `finishReason`: 最后一次调用的 `finish_reason`
- `promptTokens` / `completionTokens` / `totalTokens`: 本次执行累计 Token 统计
- `callCount`: 实际完成调用次数
- `chunkCount`: 流式 SSE 分片总数（非流式为 `0`）
- `elapsedMs`: 总耗时（毫秒）
