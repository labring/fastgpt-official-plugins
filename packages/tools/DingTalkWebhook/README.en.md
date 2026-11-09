# DingTalk Webhook

The DingTalk Webhook plugin is used to send text messages to custom DingTalk group bots. By calling the DingTalk bot Webhook endpoint and automatically handling HMAC-SHA256 signature authentication, it enables real-time message notifications directly in group chats.

## Application Scenarios

- **Alerts & Monitoring Notifications**: Automatically push alerts to DevOps or engineering groups when system monitoring tools or automated workflows detect anomalies.
- **Business Process Reminders**: Notify teams about new ticket creation, approval workflow status transitions, or business metric fluctuations.
- **Customer Support & Chat Integration**: Forward conversation summaries, important customer inquiries, or lead details to staff groups during FastGPT AI agent interactions.
- **Automated Workflow Collaboration**: Consolidate daily reports or scheduled job outputs via FastGPT workflows and broadcast them to group chats.

## DingTalk Custom Bot Configuration & Secret Guide

Before using this plugin, you need to create a custom bot in your DingTalk group and obtain the **Webhook URL** and the **Signing Secret (Secret)**:

### 1. Add a Custom Bot
1. Open the DingTalk desktop or mobile client and navigate to the target group chat.
2. Click **Group Settings** (the "..." or group settings icon in the upper right) -> **Bot Management / Smart Group Assistant** -> **Add Bot**.
3. Select **Custom (Access custom services via Webhook)** from the bot gallery and click **Add**.

### 2. Configure Security Settings (Sign)
1. Set the bot name and avatar (e.g., "System Notification Bot").
2. Under **Security Settings**, make sure to check **Sign (加签)**:
   - Once checked, the system will generate a secret key string starting with `SEC` (e.g., `SEC123456...`).
   - This plugin has built-in HMAC-SHA256 signature calculation, which uses this secret to ensure secure and reliable communication.
3. Click **Finished**. DingTalk will generate the corresponding **Webhook URL**.

### 3. Obtain Configuration Parameters
- **Webhook URL**: Formatted like `https://oapi.dingtalk.com/robot/send?access_token=xxxxxx`.
- **Signing Secret**: The secret key string displayed on the page, formatted like `SECxxxxxx`.

> **Note**: Keep the Webhook URL and Signing Secret secure. Anyone who has them can send messages to the group.

## Input Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `webhookUrl` | String | Yes | The complete Webhook URL of the DingTalk custom bot, including the `access_token`. Compatible with the legacy parameter name `钉钉机器人地址`. |
| `secret` | String | Yes | The signing secret configured in the bot's security settings (usually starts with `SEC`). Compatible with the legacy parameter name `加签值`. |
| `message` | String | Yes | The text content to be sent to the DingTalk group chat. Compatible with the legacy parameter name `发送的消息`. |

> **Compatibility Note**: The plugin supports both standard English parameter names (`webhookUrl`, `secret`, `message`) and legacy Chinese parameter names (`钉钉机器人地址`, `加签值`, `发送的消息`). It is recommended to use the standard English parameter names.

## Output Results

| Field | Type | Description |
| --- | --- | --- |
| - | Object | Returns an empty object `{}` upon successful delivery. An error will be thrown if the push fails or parameter validation fails. |

## Usage Examples

### Using in a FastGPT Workflow

1. Add the "DingTalk Webhook" tool node to your FastGPT workflow orchestrator.
2. Connect it with upstream nodes (e.g., LLM output, text concatenation, or conditional branches).
3. Example node parameter values:
   - **Webhook URL**: `https://oapi.dingtalk.com/robot/send?access_token=8888888888888888`
   - **Signing secret (Secret)**: `SEC8888888888888888`
   - **Message**: `{{cdata.text}}` (or reference an upstream variable)

### Underlying Request Payload

The JSON payload dispatched to DingTalk's API endpoint is structured as follows:

```json
{
  "msgtype": "text",
  "text": {
    "content": "System Alert: Server CPU utilization exceeded 90%. Please investigate immediately!"
  }
}
```

## Important Considerations

1. **Signature Mechanism**:
   - The plugin computes an HMAC-SHA256 signature using the provided `secret` and the current timestamp `${timestamp}\n${secret}`, and attaches both `timestamp` and `sign` parameters as query strings to the Webhook URL.
   - DingTalk requires the timestamp to be within 1 hour of the DingTalk server time.
   - **"Sign (加签)" must be enabled** in the bot's security settings. If only "Custom Keywords" or "IP Address" is selected without enabling "Sign", signature verification will fail and messages will not be delivered.
2. **Rate Limits**:
   - DingTalk limits the message frequency for each custom bot: **a maximum of 20 messages per minute per bot**. Exceeding this rate will trigger a temporary 10-minute block on outgoing messages. For high-volume scenarios, implement throttling or distribute messages across multiple bots.
3. **Message Type and Length**:
   - The current version sends messages in `text` (plain text) format.
   - DingTalk typically restricts single text messages to a maximum of 20,000 characters.
4. **Network Requirements**:
   - The runtime environment executing the FastGPT plugin must be able to reach DingTalk's Open API domain `https://oapi.dingtalk.com`.
