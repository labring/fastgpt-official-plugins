# Slack 工具集

Slack 工具集通过 Slack Web API 提供最小可用的消息与频道操作能力。

## 密钥

需要配置 `botToken`，使用 Slack Bot User OAuth Token，格式通常为 `xoxb-...`。调用时通过 `Authorization: Bearer <token>` 传递，工具输出和错误信息不会包含 token。

Bot token 通常需要以下 Slack scopes：

- `chat:write`：发送消息
- `channels:read`：读取 public channel 列表和消息
- `groups:read`：读取 private channel 列表和消息

## 子工具

### sendMessage

使用 `chat.postMessage` 向指定 channel 发送文本消息。

输入：

- `channel`：Slack channel ID，例如 `C1234567890`
- `text`：消息文本
- `thread_ts`：可选，回复到指定 thread
- `unfurl_links`：可选，是否展开链接
- `unfurl_media`：可选，是否展开媒体

输出：

- `channel`
- `ts`
- `text`
- `thread_ts`

### listChannels

使用 `conversations.list` 列出 public/private channel。

输入：

- `limit`：可选，范围 1-1000，默认 100
- `cursor`：可选，分页 cursor

输出：

- `channels`：频道列表
- `next_cursor`：下一页 cursor，无下一页时为空字符串

### fetchMessages

使用 `conversations.history` 拉取指定 channel 最近消息。

输入：

- `channel`：Slack channel ID
- `limit`：可选，范围 1-1000，默认 100
- `oldest`：可选，只返回该 Slack ts 之后的消息
- `latest`：可选，只返回该 Slack ts 之前的消息

输出：

- `messages`：消息列表
- `has_more`：是否还有更多消息
- `next_cursor`：下一页 cursor，无下一页时为空字符串

## 错误处理

Slack API 返回 `ok:false` 时会转成 `Slack API error: <error>`。工具只支持 `chat.postMessage`、`conversations.list`、`conversations.history` 三个固定 endpoint。
