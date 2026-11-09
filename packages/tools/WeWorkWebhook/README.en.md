# WeCom Group Bot Notification (WeWork Webhook)

The WeWork Webhook plugin is used to send text messages to custom group bots in WeCom (formerly WeChat Work / WeWork). By calling the official WeCom Webhook API, it enables real-time notification push and team communication directly within group chats.

> **Important Note**: According to official WeCom specifications, custom bots **only support WeCom internal company groups** (where all members belong to the same enterprise). External groups, cross-enterprise federated groups, and groups containing external WeChat contacts cannot create or use custom group bots.

## Application Scenarios

- **DevOps Alerts & Monitoring Notifications**: When monitoring systems or automated workflows detect service downtime, performance degradation, or deployment errors, push instant alerts to internal engineering and operations groups.
- **Business Process & Approval Reminders**: Send real-time updates for ticket assignments, OA approval status transitions, business metric deviations, or routine inspection reminders.
- **Customer Support & Collaboration**: In FastGPT AI agent or question-answering workflows, forward conversation summaries, critical customer inquiries, or escalation items to internal staff groups.
- **Automated Workflow Collaboration**: Consolidate daily standups, scheduled reports, or news briefings via FastGPT cron triggers and broadcast them to team channels.

## WeCom Custom Bot Configuration & Webhook Guide

Before using this plugin, you must add a custom bot to a WeCom internal group and obtain its unique **Webhook URL**. It is recommended to perform this setup in the WeCom desktop client (PC / Mac):

### 1. Open Group Settings
1. Open the WeCom desktop client and navigate to the target **internal group chat**.
2. Click the **Group Settings** icon ("..." or management panel) in the upper-right corner.

### 2. Add a Group Bot
1. In the group settings panel, locate the **Group Bot** (群机器人) section.
2. Click **Add a Bot** (or the "+" button if bots already exist).
3. In the bot gallery modal, select **Create a new bot** (新创建一个机器人).

### 3. Configure Bot Information
1. Set the bot's **Name** (e.g., "System Notification Bot" or "FastGPT Assistant") and optionally upload a custom avatar.
2. Click **Add** to complete the creation.

### 4. Copy the Webhook URL
1. Once created, WeCom will display the bot's unique **Webhook URL**, formatted like:
   ```text
   https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
2. Click **Copy** to save the URL. You will pass this value to the `webhookUrl` parameter in FastGPT.

> **Security Note**: The `key` query parameter in the Webhook URL represents the bot's credential. Anyone who holds this URL can push messages to your group. Please store it securely and avoid exposing it in public code repositories.

## Input Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `webhookUrl` | String | Yes | The complete Webhook URL of the WeCom internal group bot, formatted like `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxxx`. Compatible with legacy parameter name `企微机器人地址`. |
| `message` | String | Yes | The text message content to send to the WeCom group chat. Compatible with legacy parameter name `发送的消息`. |

> **Compatibility Note**: The plugin supports both standard English parameter names (`webhookUrl`, `message`) and legacy Chinese parameter names (`企微机器人地址`, `发送的消息`). Both sets are handled transparently by internal transformation. Using standard English parameter names is recommended in FastGPT workflows.

## Output Results

| Field | Type | Description |
| --- | --- | --- |
| - | Object | Returns an empty object `{}` upon successful delivery. An error containing the detailed API response will be thrown if the push fails or validation does not pass. |

## Usage Examples

### Using in a FastGPT Workflow

1. In the FastGPT workflow orchestrator, add the **WeWork Webhook** (企业微信 webhook) tool node.
2. Connect upstream nodes (e.g., "AI Chat" output, "Text Processing" node, or "Condition Branch").
3. Configure node inputs:
   - **Webhook URL (`webhookUrl`)**: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693a91f6-7xxx-4bc4-97a0-0ec2cd54xxxx`
   - **Message (`message`)**: `{{cdata.text}}` (or reference an upstream text variable)

### Underlying Request Payload

The plugin dispatches HTTP POST requests with a JSON body structured as follows:

```json
{
  "msgtype": "text",
  "text": {
    "content": "[System Alert] Production database connections exceeded threshold (85%). Please investigate immediately!"
  }
}
```

## Important Considerations

1. **Internal Groups Only**: WeCom custom bots are strictly limited to internal company group chats. External groups or chats involving external WeChat users cannot use custom bots.
2. **Rate Limits**: WeCom enforces a strict rate limit: **each custom bot can send at most 20 messages per minute**. Excess messages will be blocked. For high-throughput alerting scenarios, implement throttling in the workflow or distribute traffic across multiple bots.
3. **Message Format & Content Length**:
   - The current version sends messages in `text` (plain text) format.
   - WeCom restricts single text message payloads to a maximum of **2048 bytes** (UTF-8 encoded, approximately 680 Chinese characters). Messages exceeding this limit will trigger API error `40058: message content text limit`. Truncate or split longer text into chunks upstream in your workflow.
4. **Network Access**: The FastGPT plugin runtime environment must be able to reach WeCom's official API domain `https://qyapi.weixin.qq.com` over port 443. Ensure appropriate firewall rules and proxy whitelist configurations are in place.
