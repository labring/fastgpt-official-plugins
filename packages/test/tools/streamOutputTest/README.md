# 流式输出测试

发送可配置的流式回答分片，用于测试 FastGPT 插件流式输出是否能正常进行。

## 输入

- `content`: 需要按分片流式输出的完整内容，默认 `FastGPT stream output test.`
- `chunkCount`: 分片数量，范围 1-50，默认 5
- `intervalMs`: 每个分片之间等待的毫秒数，范围 0-10000，默认 300
- `streamType`: 流式消息类型，可选 `answer` 或 `fastAnswer`，默认 `answer`

## 输出

- `content`: 本次流式输出的完整内容
- `chunkCount`: 实际发送的流式分片数量
- `streamType`: 本次使用的流式消息类型
- `elapsedMs`: 插件运行总耗时

## 示例

```json
{
  "content": "abcdef",
  "chunkCount": 3,
  "intervalMs": 0,
  "streamType": "answer"
}
```
