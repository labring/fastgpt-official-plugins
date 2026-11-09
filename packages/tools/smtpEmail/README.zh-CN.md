# Email 邮件发送 (SMTP Email)

FastGPT 官方通用 SMTP 邮件发送插件，基于 Node.js 工业级邮件库 `nodemailer` 深度封装。支持通过标准 SMTP 协议安全投递各类电子邮件，具备完整的 SSL/TLS 传输加密能力、富文本 HTML 正文解析渲染、多收件人/抄送/密送支持以及附件投递机制。

通过将邮件发送能力无缝接入 FastGPT 工作流，智能体能够将业务数据、分析报告、工单进展、安全告警等信息自动推送至目标收件人邮箱。

## 典型应用场景

- **系统运维告警与错误报告推送**：实时监控服务运行状况，捕获关键异常堆栈及报警级别，自动组装格式化告警邮件发送至 SRE、运维或研发应急响应组，支持配置紧急抄送与多收件人。
- **用户留资线索通知与销售跟进**：在官网客服对话或营销获客智能体中，当访客留下联系方式、预约意向或高意向咨询时，实时将聊天概要与线索档案通过富文本卡片邮件直推责任销售或 CRM 接收邮箱。
- **定时自动化业务报告邮件**：结合 FastGPT 定时任务与前置数据处理节点，大模型将多维业务数据、核心 KPI 与环比走势整理为结构化且美观的 HTML 数据周报/月报，定期自动发送给管理层。
- **审批结果与业务确认函发送**：企业内部工单（如请假、费用报销、合同会签、权限变更）审批流程流转完毕后，自动调取申请人与审批意见，批量下发官方通知函件或电子凭证。

---

## SMTP 服务端点与密钥配置说明 (Secrets)

在使用本插件前，请在 FastGPT 插件配置的密钥（Secrets）区域中设置发信邮箱的 SMTP 连接配置。出于安全考量，**邮箱密码/授权码（`smtpPass`）采用密文存储**，不会在工作流导出、前端界面或请求日志中明文展示。

### 配置项列表

| 配置项 (Key) | 界面显示名称 | 数据类型 | 必填 | 默认值 / 示例 | 加密存储 (`isSecret`) | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| `smtpHost` | SMTP 服务器地址 | 字符串 (`string`) | 是 | `smtp.qq.com` / `smtp.gmail.com` | 否 | 发信邮箱对应的 SMTP 服务器主机名或域名。 |
| `smtpPort` | SMTP 端口 | 字符串 (`string`) | 是 | `465` / `587` | 否 | SMTP 服务通信端口。端口 `465` 通常对应 SSL/TLS 加密；端口 `587` 通常对应 STARTTLS 加密。 |
| `SSL` | 启用 SSL/TLS | 布尔值 (`boolean`) | 否 | `true` (465) / `false` (587) | 否 | 是否启用 SSL/TLS 直连加密通信。使用 465 端口时必须设为 `true`；使用 587 端口时需设为 `false`。 |
| `smtpUser` | SMTP 用户名 | 字符串 (`string`) | 是 | `sender@example.com` | 否 | 发信账号用户名，通常为发件人的完整邮箱地址。需与实际发信邮箱保持一致。 |
| `smtpPass` | SMTP 密码 | 字符串 (`string`) | 是 | `******` | 是 | 发信邮箱的登录密码或专用授权码/应用专用密码。系统全程密文加密存储。 |

---

### 主流邮箱 SMTP 与授权码配置指引

大多数公共邮件服务商出于安全考虑，禁止直接使用邮箱登录密码通过第三方客户端或 SMTP 协议发信，**必须开启 POP3/SMTP 服务并生成专用的「授权码」或「应用密码」**。

#### 1. QQ 邮箱 (QQ Mail)

- **SMTP 服务器地址 (`smtpHost`)**：`smtp.qq.com`
- **端口与 SSL (`smtpPort` / `SSL`)**：端口推荐填写 `465`，`SSL` 开关开启（`true`）；或端口填写 `587`，`SSL` 开关关闭（`false`）。
- **用户名 (`smtpUser`)**：您的完整 QQ 邮箱地址（例如 `12345678@qq.com` 或绑定域名的 Foxmail 邮箱）。
- **密码 / 授权码 (`smtpPass`)**：**不能使用 QQ 登录密码**，需在 QQ 邮箱网页端生成专用 16 位授权码：
  1. 登录 [QQ 邮箱网页版](https://mail.qq.com)。
  2. 点击顶部「设置」 -> 进入「账户」标签页。
  3. 向下滚动至「POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV 服务」设置区域。
  4. 找到「POP3/SMTP服务」，点击右侧的「开启」按钮（若已开启可点击「生成授权码」）。
  5. 按照页面提示使用绑定的手机号发送短信完成安全验证。
  6. 验证通过后页面将展示生成的 **16 位字母授权码**，复制该字符串（去除空格）并填入 `smtpPass`。

#### 2. 163 网易邮箱 (163 NetEase Mail)

- **SMTP 服务器地址 (`smtpHost`)**：`smtp.163.com`
- **端口与 SSL (`smtpPort` / `SSL`)**：端口推荐填写 `465`，`SSL` 开关开启（`true`）；或端口填写 `587`，`SSL` 开关关闭（`false`）。
- **用户名 (`smtpUser`)**：您的完整 163 邮箱地址（例如 `your_name@163.com`）。
- **密码 / 授权码 (`smtpPass`)**：**不能使用网易账号登录密码**，需在 163 邮箱网页端生成客户端授权密码：
  1. 登录 [163 网易免费邮](https://mail.163.com)。
  2. 点击顶部导航栏的「设置」 -> 选择「POP3/SMTP/IMAP」。
  3. 确认已勾选开启「POP3/SMTP服务」。
  4. 切换到「客户端授权密码」菜单，点击「新增授权密码」。
  5. 输入收到的手机短信验证码完成身份验证。
  6. 自行设定或由系统生成客户端授权密码，复制保存并填入 `smtpPass`。

#### 3. Gmail (Google Workspace / Google Mail)

- **SMTP 服务器地址 (`smtpHost`)**：`smtp.gmail.com`
- **端口与 SSL (`smtpPort` / `SSL`)**：端口填写 `465` 且 `SSL` 开启（`true`）；或端口填写 `587` 且 `SSL` 关闭（`false`）。
- **用户名 (`smtpUser`)**：您的完整 Gmail 邮箱地址（例如 `username@gmail.com` 或 Google Workspace 组织邮箱）。
- **密码 / 授权码 (`smtpPass`)**：**禁止使用 Google 账号主密码**，必须生成「应用专用密码 (App Password)」：
  1. 登录 [Google 账号管理中心](https://myaccount.google.com/)。
  2. 点击左侧导航栏的「安全性 (Security)」选项。
  3. 检查「如何登录 Google (How you sign in to Google)」，确保已经开启 **两步验证 (2-Step Verification)**。
  4. 在安全性页面搜索框输入「应用专用密码」或在两步验证详情页中找到「应用专用密码 (App Passwords)」。
  5. 应用名称输入自定义名称（例如 `FastGPT`），点击「创建」。
  6. 系统将生成一串 16 位的专属应用密码（如 `abcd efgh ijkl mnop`），复制该密码（去除空格）并填入 `smtpPass`。

---

## 输入参数列表 (Inputs)

| 参数名 (Parameter) | 界面显示名称 | 数据类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `fromName` | 发件人名称 | 字符串 (`string`) | 是 | 发件人在邮件客户端中显示的友好昵称（例如 `系统监控中心`、`FastGPT 智能助手`）。邮件实际发信地址由 `smtpUser` 决定。 |
| `to` | 收件人 | 字符串 (`string`) | 是 | 接收邮件的目标邮箱地址。支持配置多个收件人，多个邮箱之间必须使用半角英文逗号（`,`）分隔，例如 `user1@example.com, user2@example.com`。 |
| `subject` | 邮件主题 | 字符串 (`string`) | 是 | 邮件的标题文本。支持接收上游节点的变量插值（例如在标题中动态注入工单编号、告警级别或生成日期）。 |
| `content` | 邮件内容 | 字符串 (`string`) | 是 | 邮件正文内容。原生支持纯文本（Plain Text）或富文本 HTML 标签（如 `<h1>`、`<p>`、`<table>`、`<div>`、`style` 内联样式等），可完美呈现排版精美的结构化报告或通知模板。 |
| `cc` | 抄送 | 字符串 (`string`) | 否 | 抄送收件人邮箱列表（CC）。多个邮箱地址之间使用半角英文逗号（`,`）分隔。 |
| `bcc` | 密送 | 字符串 (`string`) | 否 | 密送收件人邮箱列表（BCC）。多个邮箱地址之间使用半角英文逗号（`,`）分隔，该列表中的邮箱地址对其他收件人不可见。 |
| `attachments` | 附件 | 字符串 (`string`) | 否 | 邮件附件列表。必须为标准 JSON 数组格式字符串，每个对象包含 `filename`（附件文件名）和 `path`（附件网络可访问 URL 或存储路径），例如：`[{"filename":"weekly-report.pdf","path":"https://example.com/files/weekly-report.pdf"}]`。 |

---

## 输出结果说明 (Outputs)

| 字段名 (Field) | 界面显示名称 | 数据类型 | 说明 |
| --- | --- | --- | --- |
| `success` | 是否发送成功 | 布尔值 (`boolean`) | 邮件是否投递成功。`true` 表示邮件已成功移交至目标 SMTP 服务器并被接收；`false` 表示投递失败。 |
| `messageId` | 邮件消息 ID | 字符串 (`string`) | 邮件发送成功时，目标 SMTP 服务返回的全局唯一邮件识别编号（例如 `<c28f645a-8b10-e51f-b5dc-d60232490b41@smtp.example.com>`）。 |
| `error` | 错误信息 | 字符串 (`string`) | 邮件发送失败时返回的具体错误诊断信息（包含 SMTP 响应状态码及异常详细信息）。 |

### 返回示例

#### 1. 发送成功返回示例

```json
{
  "success": true,
  "messageId": "<c28f645a-8b10-e51f-b5dc-d60232490b41@smtp.example.com>"
}
```

#### 2. 发送失败返回示例

```json
{
  "success": false,
  "error": "Invalid login: 535 Login Fail. Please use authorization code instead of password."
}
```

### 异常抛出与工作流处理机制

1. **输入参数强校验异常**：如果输入的收件人（`to`、`cc`、`bcc`）包含不符合电子邮箱规范的非法格式，或者 `attachments` 传入的 JSON 字符串无法被正确解析，插件会在执行前抛出带有明确提示的校验异常，终止无效工作流执行。
2. **SMTP 错误捕获与状态分支**：若遇到网络连接超时、认证失败或触发邮件服务器频控拒绝，底层会安全捕获 SMTP 异常并返回包含具体失败原因的 `{ success: false, error: "..." }` 对象。
3. **工作流使用方式**：在 FastGPT 编排中，可通过下游「条件分支」节点依据 `success` 字段是否为 `true` 决定后续流转逻辑；如果将发信作为工作流的最终投递动作，也可以直接忽略输出字段。

---

## 典型工作流编排示例与最佳实践

### 场景：上游大模型生成 HTML 分析周报并自动投递

#### 1. 工作流编排流程

```text
[定时触发器] (每周五 18:00)
       ↓
[数据库/API 节点] (拉取本周业务核心数据)
       ↓
[大模型 (LLM) 节点] (分析业务趋势并输出排版规范的 HTML 邮件内容)
       ↓
[Email 邮件发送 节点] (本插件自动投递至管理层与团队邮箱)
       ↓
[条件分支]
   ├─ [发送成功] → [结束]
   └─ [发送失败] → [钉钉/企微告警节点] (推送异常排查通知)
```

#### 2. 各节点参数配置

1. **前置大模型节点 Prompt 示例**：
   ```text
   你是一名资深商业数据分析师，请根据上游提供的业务数据生成本周运营周报。
   要求：
   1. 直接输出可直接用于邮件发送的 HTML 片段（无需 markdown 代码块包裹）。
   2. 采用现代简洁风格与内联 CSS 样式，包含指标卡片和数据对比表格。
   ```

2. **邮件发送节点配置**：
   - **发件人名称 (`fromName`)**：`FastGPT 业务周报助手`
   - **收件人 (`to`)**：`leader@company.com, team@company.com`
   - **抄送 (`cc`)**：`archive@company.com`
   - **邮件主题 (`subject`)**：`【自动化周报】{{cdata.report_date}} 业务运营数据与趋势洞察`
   - **邮件内容 (`content`)**：引用大模型输出内容变量（如 `{{llm_node.text}}`）

#### 3. 推荐的 HTML 邮件正文结构参考

```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
  <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-top: 0;">本周核心业务数据精报</h2>
  <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">各位同事好，以下是由 FastGPT 智能数据助手自动汇总的本周业务运营报告：</p>
  
  <div style="display: flex; gap: 12px; margin: 20px 0;">
    <div style="flex: 1; background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center;">
      <div style="font-size: 12px; color: #6b7280;">本周新增用户</div>
      <div style="font-size: 20px; font-weight: bold; color: #111827; margin-top: 4px;">1,280</div>
    </div>
    <div style="flex: 1; background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center;">
      <div style="font-size: 12px; color: #6b7280;">核心转化率</div>
      <div style="font-size: 20px; font-weight: bold; color: #10b981; margin-top: 4px;">18.5%</div>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
    <thead>
      <tr style="background-color: #f9fafb; text-align: left;">
        <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">业务模块</th>
        <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">达成进度</th>
        <th style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">环比变化</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">智能客服问答</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">98.2%</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #10b981;">+2.4%</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">工单自动流转</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">94.0%</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #10b981;">+1.1%</td>
      </tr>
    </tbody>
  </table>

  <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">此邮件由 FastGPT 自动化工作流自动生成并发送，请勿直接回复。</p>
</div>
```

---

## 注意事项

1. **发信邮箱与 `smtpUser` 严格一致性**：
   - 邮件服务器（如 QQ、163、Gmail 等）会对发件人地址与登录账号进行严格的匹配性校验。
   - 插件底层发送的来源地址为 `"${fromName}" <${smtpUser}>`，实际发件邮箱固定为配置中的 `smtpUser`。严禁随意填写非当前授权账号的邮箱地址，否则会被服务器直接拒绝并返回 `553 Mail from must equal authorized user` 错误。
2. **通信端口与 SSL/TLS 匹配规则**：
   - **端口 465**：通常用于 SMTPS（直连 SSL/TLS 加密传输），必须将配置项 `SSL` 设为 `true`。
   - **端口 587**：通常用于 STARTTLS 协议，必须将配置项 `SSL` 设为 `false`。如果在 587 端口开启 `SSL: true`，将导致连接在 SSL 握手阶段挂起直至超时。
   - **端口 25**：传统明文通信端口。绝大多数公有云厂商（如阿里云、腾讯云、AWS）出于反垃圾邮件安全策略，默认在底层完全封禁外部出站 TCP 25 端口。**强烈建议在生产环境统一使用 465 端口（开启 SSL）或 587 端口**。
3. **发信频率控制与服务商反垃圾风控**：
   - 免费个人邮箱提供商（如个人 QQ 邮箱、163 邮箱、Gmail）对单日发信总额度与短时间发信频率有严格的风控策略（通常限制在每日数十封至数百封内）。短时间内连续高频发送同一模板的邮件极易被系统临时限制（如 `550 Too many connections`）或直接将邮件投递进收件人的垃圾邮件箱（Spam Folder）。
   - 在高并发业务通知、大规模群发或生产环境中，建议优先采用企业邮箱（如腾讯企业邮、阿里企业邮、Google Workspace）或专业云邮件发送服务（如阿里云邮件推送、SendGrid、Amazon SES、Resend、Mailgun 等），并配置好域名的 SPF（Sender Policy Framework）、DKIM（DomainKeys Identified Mail）与 DMARC 记录，以获得极高的送达率。
4. **HTML 邮件编写最佳实践**：
   - 各类邮件客户端（Outlook、Apple Mail、Gmail、网页端等）所使用的 HTML/CSS 渲染引擎差异显著。
   - 建议在邮件正文排版中优先使用 **内联样式 (Inline CSS)**，尽量采用基于 `<table>` 的经典布局方案，以确保良好的响应式兼容性。
   - 避免在邮件内容中使用 `<script>`、`<iframe/form>`、外部样式表（`<link rel="stylesheet">`）或复杂的现代 CSS 动画，这些标签通常会被收件箱的安全机制主动过滤或导致直接判定为垃圾邮件。
5. **网络与防火墙环境要求**：
   - 部署运行 FastGPT 插件的环境需要能够正常通过互联网出站访问目标 SMTP 邮件服务器的 IP 与指定端口（465 / 587）。若处于严格受限的内网或专网环境，需预先联系网络管理员配置出站白名单。

