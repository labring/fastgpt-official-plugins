# SMTP Email

FastGPT official general-purpose SMTP email dispatch plugin, built on top of the industry-standard Node.js `nodemailer` library. It supports securely delivering various types of emails via standard SMTP protocols, featuring full SSL/TLS encryption, rich HTML body parsing and rendering, multi-recipient/CC/BCC handling, and flexible attachment delivery.

By seamlessly integrating email dispatch capabilities into FastGPT workflows, AI agents can automatically deliver operational metrics, analytical summaries, ticket updates, and security alerts directly to target recipients' mailboxes.

## Typical Application Scenarios

- **DevOps Alerts & System Error Notifications**: Monitor system services in real time, capture critical exception stack traces and alert levels, and automatically assemble formatted alert emails sent to SRE, DevOps, or on-call engineering teams, with support for emergency CC and multiple recipients.
- **Lead Notifications & Sales Follow-up**: In customer service or marketing AI agents, when visitors submit contact info, appointment requests, or high-intent inquiries, immediately forward conversation summaries and lead profiles to assigned sales representatives or CRM inboxes via rich-text card emails.
- **Automated Scheduled Business Reports**: In conjunction with FastGPT scheduled triggers and upstream data processing nodes, Large Language Models (LLMs) can aggregate multidimensional business metrics, core KPIs, and period-over-period trends into structured, beautifully styled HTML weekly/monthly reports, automatically delivered to management.
- **Approval Confirmation & Status Updates**: Upon completion of internal approval workflows (e.g., leave requests, expense reimbursements, contract countersignatures, or permission grants), automatically retrieve applicant details and approval comments to dispatch official notification letters or electronic certificates.

---

## SMTP Server & Secrets Configuration (Secrets)

Before using this plugin, configure the SMTP connection credentials in the Secrets section of the FastGPT plugin configuration. For security reasons, **passwords or authorization codes (`smtpPass`) are stored encrypted** and are never exposed in plaintext across workflow exports, frontend interfaces, or execution logs.

### Configuration Options

| Configuration Key | Display Title | Data Type | Required | Default / Example | Encrypted (`isSecret`) | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `smtpHost` | SMTP server host | String (`string`) | Yes | `smtp.qq.com` / `smtp.gmail.com` | No | Hostname or domain of the sender's SMTP server. |
| `smtpPort` | SMTP port | String (`string`) | Yes | `465` / `587` | No | SMTP communication port. Port `465` is typically used for SSL/TLS encryption; port `587` is typically used for STARTTLS encryption. |
| `SSL` | Enable SSL/TLS | Boolean (`boolean`) | No | `true` (465) / `false` (587) | No | Whether to enable direct SSL/TLS encrypted communication. Must be set to `true` when connecting to port 465, and `false` when connecting to port 587. |
| `smtpUser` | SMTP username | String (`string`) | Yes | `sender@example.com` | No | Username for SMTP authentication, usually the sender's full email address. Must match the actual sender address. |
| `smtpPass` | SMTP password | String (`string`) | Yes | `******` | Yes | Login password or dedicated client authorization code / App Password for the sending email. Encrypted and managed securely by FastGPT. |

---

### Popular Email Provider Setup Guides

For security reasons, most public email providers disallow using your account's primary login password over third-party SMTP clients. **You must enable POP3/SMTP services and generate a dedicated authorization code or App Password**.

#### 1. QQ Mail (QQ 邮箱)

- **SMTP Server Host (`smtpHost`)**: `smtp.qq.com`
- **Port & SSL (`smtpPort` / `SSL`)**: Recommended port `465` with `SSL` enabled (`true`), or port `587` with `SSL` disabled (`false`).
- **Username (`smtpUser`)**: Your complete QQ email address (e.g., `12345678@qq.com` or custom domain Foxmail).
- **Password / Authorization Code (`smtpPass`)**: **Never use your QQ login password**. You must generate a dedicated 16-character authorization code via webmail:
  1. Log in to [QQ Mail Web](https://mail.qq.com).
  2. Click **Settings (设置)** at the top -> Go to the **Accounts (账户)** tab.
  3. Scroll down to the **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV Service** section.
  4. Locate **POP3/SMTP Service** and click **Enable (开启)** (or click "Generate authorization code" if already enabled).
  5. Follow the on-screen instructions to send an SMS verification using your linked mobile phone.
  6. Upon verification, the page displays a **16-character letter authorization code**. Copy the string (without spaces) and paste it into `smtpPass`.

#### 2. 163 NetEase Mail (网易 163 邮箱)

- **SMTP Server Host (`smtpHost`)**: `smtp.163.com`
- **Port & SSL (`smtpPort` / `SSL`)**: Recommended port `465` with `SSL` enabled (`true`), or port `587` with `SSL` disabled (`false`).
- **Username (`smtpUser`)**: Your complete 163 email address (e.g., `your_name@163.com`).
- **Password / Authorization Code (`smtpPass`)**: **Never use your NetEase account login password**. Generate a client authorization password:
  1. Log in to [163 Mail Web](https://mail.163.com).
  2. Click **Settings (设置)** in the top navigation -> Select **POP3/SMTP/IMAP**.
  3. Verify that **POP3/SMTP Service** is checked and enabled.
  4. Navigate to the **Client Authorization Password (客户端授权密码)** menu and click **Add Authorization Password (新增授权密码)**.
  5. Enter the SMS verification code received on your phone to complete verification.
  6. Set or receive the generated client authorization password, copy it, and paste it into `smtpPass`.

#### 3. Gmail (Google Workspace / Google Mail)

- **SMTP Server Host (`smtpHost`)**: `smtp.gmail.com`
- **Port & SSL (`smtpPort` / `SSL`)**: Port `465` with `SSL` enabled (`true`), or port `587` with `SSL` disabled (`false`).
- **Username (`smtpUser`)**: Your complete Gmail address (e.g., `username@gmail.com` or Google Workspace custom domain).
- **Password / Authorization Code (`smtpPass`)**: **Do not use your primary Google account password**. You must generate an "App Password":
  1. Log in to your [Google Account Console](https://myaccount.google.com/).
  2. Select **Security** from the left navigation panel.
  3. Under **How you sign in to Google**, ensure that **2-Step Verification** is turned ON.
  4. In the search box or security settings, search for **App Passwords**.
  5. Enter a custom name for the application (e.g., `FastGPT`) and click **Create**.
  6. A 16-character passcode (e.g., `abcd efgh ijkl mnop`) will be generated. Copy this passcode (without spaces) and paste it into `smtpPass`.

---

## Input Parameters (Inputs)

| Parameter | Display Title | Data Type | Required | Description |
| --- | --- | --- | --- | --- |
| `fromName` | Sender name | String (`string`) | Yes | Display name of the sender presented in mail clients (e.g., `DevOps Monitoring`, `FastGPT Assistant`). The actual sending address is determined by `smtpUser`. |
| `to` | Recipients | String (`string`) | Yes | Recipient email addresses. Supports multiple recipients separated by standard half-width English commas (`,`), e.g., `user1@example.com, user2@example.com`. |
| `subject` | Subject | String (`string`) | Yes | Email subject line. Supports dynamic variable interpolation from upstream workflow nodes (e.g., inserting ticket numbers, alert levels, or dates). |
| `content` | Email content | String (`string`) | Yes | Email body content. Supports plain text or rich HTML formatting (e.g., `<h1>`, `<p>`, `<table>`, `<div>`, inline `style`, etc.) for beautifully structured reports and templates. |
| `cc` | CC | String (`string`) | No | Carbon copy (CC) recipient email addresses. Multiple addresses must be separated by commas (`,`). |
| `bcc` | BCC | String (`string`) | No | Blind carbon copy (BCC) recipient email addresses. Multiple addresses must be separated by commas (`,`). Hidden from other recipients. |
| `attachments` | Attachments | String (`string`) | No | Email attachments configuration. Must be a valid JSON array string where each object contains `filename` and `path` (a reachable URL or storage path), e.g., `[{"filename":"weekly-report.pdf","path":"https://example.com/files/weekly-report.pdf"}]`. |

---

## Output Results (Outputs)

| Field | Display Title | Data Type | Description |
| --- | --- | --- | --- |
| `success` | Sent successfully | Boolean (`boolean`) | Indicates whether the email was successfully accepted by the SMTP server. `true` indicates delivery success; `false` indicates failure. |
| `messageId` | Message ID | String (`string`) | A globally unique message identifier assigned by the destination SMTP service upon successful dispatch (e.g., `<c28f645a-8b10-e51f-b5dc-d60232490b41@smtp.example.com>`). |
| `error` | Error | String (`string`) | Detailed error diagnostic information returned when delivery fails (including SMTP response codes and error descriptions). |

### Response Examples

#### 1. Successful Response Example

```json
{
  "success": true,
  "messageId": "<c28f645a-8b10-e51f-b5dc-d60232490b41@smtp.example.com>"
}
```

#### 2. Failure Response Example

```json
{
  "success": false,
  "error": "Invalid login: 535 Login Fail. Please use authorization code instead of password."
}
```

### Exception Handling & Workflow Behavior

1. **Input Parameter Validation Errors**: If recipients (`to`, `cc`, `bcc`) contain invalid email syntax, or if `attachments` contains malformed JSON that cannot be parsed, the plugin immediately throws an informative validation exception prior to execution, halting invalid workflow flows.
2. **SMTP Failure Capture & Branching**: If network connection timeouts, SMTP authentication failures, or rate limit blocks occur, the underlying handler safely catches the exception and returns a `{ success: false, error: "..." }` object.
3. **Usage in Workflows**: In FastGPT orchestrations, downstream "Conditional Branch" nodes can evaluate whether `success` is `true` to guide recovery or alert paths. For simple notification flows where email dispatch is the final action, output fields can simply be ignored.

---

## Typical Workflow Orchestration & Best Practices

### Scenario: Upstream LLM Generates HTML Weekly Report and Dispatches Automatically

#### 1. Workflow Architecture

```text
[Scheduled Trigger] (Every Friday at 18:00)
       ↓
[Database / API Node] (Fetch weekly core business metrics)
       ↓
[LLM Node] (Analyze trends and generate structured HTML email content)
       ↓
[SMTP Email Node] (Automatically deliver to executive and team mailboxes)
       ↓
[Conditional Branch]
   ├─ [Success] → [End]
   └─ [Failure] → [DingTalk / WeCom Webhook Node] (Alert DevOps on-call)
```

#### 2. Node Parameter Configurations

1. **Upstream LLM Node Prompt Example**:
   ```text
   You are a senior business data analyst. Generate this week's operational summary based on the provided business metrics.
   Requirements:
   1. Output pure HTML markup ready for email delivery (do not wrap in markdown code blocks).
   2. Use modern minimalist inline CSS styling, including key metric cards and data comparison tables.
   ```

2. **Email Node Configuration**:
   - **Sender name (`fromName`)**: `FastGPT Weekly Report Assistant`
   - **Recipients (`to`)**: `leader@company.com, team@company.com`
   - **CC (`cc`)**: `archive@company.com`
   - **Subject (`subject`)**: `[Automated Report] Business Operations & Metric Insights - Week {{cdata.week_num}}`
   - **Email content (`content`)**: Reference the upstream LLM node's text output variable (e.g., `{{llm_node.text}}`)

#### 3. Recommended HTML Email Structure Reference

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
  <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-top: 0;">Weekly Business Performance Report</h2>
  <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Hello team, here is the weekly operations digest automatically aggregated by FastGPT Data Assistant:</p>
  
  <div style="display: flex; gap: 12px; margin: 20px 0;">
    <div style="flex: 1; background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center;">
      <div style="font-size: 12px; color: #6b7280;">New Users</div>
      <div style="font-size: 20px; font-weight: bold; color: #111827; margin-top: 4px;">1,280</div>
    </div>
    <div style="flex: 1; background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center;">
      <div style="font-size: 12px; color: #6b7280;">Core Conversion</div>
      <div style="font-size: 20px; font-weight: bold; color: #10b981; margin-top: 4px;">18.5%</div>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
    <thead>
      <tr style="background-color: #f9fafb; text-align: left;">
        <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">Module</th>
        <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">Progress</th>
        <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">WoW Change</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">AI Support</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">98.2%</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #10b981;">+2.4%</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">Ticket Automation</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">94.0%</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #10b981;">+1.1%</td>
      </tr>
    </tbody>
  </table>

  <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">This email was automatically generated and dispatched by FastGPT Workflow. Please do not reply directly.</p>
</div>
```

---

## Important Considerations

1. **Strict Consistency Between Sender Email and `smtpUser`**:
   - Mail servers (QQ, 163, Gmail, etc.) enforce strict validation between the sender's email address and the authenticated login account.
   - The plugin dispatches emails with the header format `"${fromName}" <${smtpUser}>`. The underlying sender address is always pinned to `smtpUser`. Do not forge or substitute arbitrary sender addresses, as the server will reject the request with `553 Mail from must equal authorized user`.
2. **Port and SSL/TLS Configuration Matching Rules**:
   - **Port 465**: Standard for SMTPS (direct SSL/TLS encryption). You must set `SSL` to `true`.
   - **Port 587**: Standard for STARTTLS. You must set `SSL` to `false`. Setting `SSL: true` on port 587 causes the connection to hang during the SSL handshake until timeout.
   - **Port 25**: Legacy unencrypted port. Major cloud providers (Aliyun, Tencent Cloud, AWS, GCP) block outbound TCP port 25 traffic by default to combat spam. **Always use port 465 (with SSL enabled) or port 587 in production environments**.
3. **Rate Limiting & Spam Filtering**:
   - Free personal mail providers (personal QQ Mail, 163 Mail, Gmail) apply stringent spam filtering and throughput quotas (typically limited to dozens or hundreds of emails per day). Rapidly sending multiple emails with identical content can trigger temporary blocks (e.g., `550 Too many connections`) or cause emails to land in spam folders.
   - For high-volume business notifications, mass mailing, or enterprise production workloads, use corporate mail services (Tencent Enterprise Mail, Lark/Feishu Mail, Google Workspace) or dedicated cloud email delivery platforms (SendGrid, Amazon SES, Resend, Mailgun, Aliyun DirectMail). Configure DNS SPF, DKIM, and DMARC records to maximize inbox delivery rates.
4. **HTML Email Formatting Best Practices**:
   - Email client rendering engines (Outlook, Apple Mail, Gmail, web clients) vary significantly.
   - Use **inline CSS** for styling and standard `<table>`-based layouts for consistent cross-client rendering.
   - Avoid using `<script>`, `<iframe/form>`, external stylesheets (`<link rel="stylesheet">`), or modern CSS animations, as these elements are blocked or flagged as spam by security filters.
5. **Network & Firewall Requirements**:
   - The server environment hosting FastGPT must have outbound Internet access to the target SMTP server on port 465 or 587. In restricted intranet or VPC environments, ensure outbound firewall whitelists are configured.
