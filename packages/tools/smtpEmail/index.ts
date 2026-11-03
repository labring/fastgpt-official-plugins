import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  smtpHost: z.string().meta({
    title: "SMTP server host",
    description: "For example, smtp.gmail.com or smtp.qq.com.",
    "x-i18n": {
      title: { en: "SMTP server host", "zh-CN": "SMTP 服务器地址" },
      description: {
        en: "For example, smtp.gmail.com or smtp.qq.com.",
        "zh-CN": "例如 smtp.gmail.com 或 smtp.qq.com",
      },
    },
    isSecret: false,
  }),
  smtpPort: z.string().meta({
    title: "SMTP port",
    description: "For example, 465 or 587.",
    "x-i18n": {
      title: { en: "SMTP port", "zh-CN": "SMTP 端口" },
      description: {
        en: "For example, 465 or 587.",
        "zh-CN": "例如 465 或 587",
      },
    },
    isSecret: false,
  }),
  SSL: z
    .boolean()
    .optional()
    .meta({
      title: "Enable SSL/TLS",
      description: "Usually enabled for port 465 and disabled for port 587.",
      "x-i18n": {
        title: { en: "Enable SSL/TLS", "zh-CN": "启用 SSL/TLS" },
        description: {
          en: "Usually enabled for port 465 and disabled for port 587.",
          "zh-CN": "通常 465 端口开启，587 端口关闭",
        },
      },
      isSecret: false,
    }),
  smtpUser: z.string().meta({
    title: "SMTP username",
    description: "Usually the sender's email address.",
    "x-i18n": {
      title: { en: "SMTP username", "zh-CN": "SMTP 用户名" },
      description: {
        en: "Usually the sender's email address.",
        "zh-CN": "通常为发件邮箱地址",
      },
    },
    isSecret: false,
  }),
  smtpPass: z.string().meta({
    title: "SMTP password",
    description: "SMTP password or email authorization code.",
    isSecret: true,
    "x-i18n": {
      title: { en: "SMTP password", "zh-CN": "SMTP 密码" },
      description: {
        en: "SMTP password or email authorization code.",
        "zh-CN": "SMTP 密码或邮箱授权码",
      },
    },
  }),
});
const inputSchema = defineInputSchema({
  fromName: {
    type: z.string(),
    title: { en: "Sender name", "zh-CN": "发件人名称" },
    description: {
      en: "Display name of the sender.",
      "zh-CN": "显示的发件人名称。",
    },
    isToolParam: true,
  },
  to: {
    type: z.string(),
    title: { en: "Recipients", "zh-CN": "收件人" },
    description: {
      en: "Recipient email addresses, separated by commas.",
      "zh-CN": "请输入收件人邮箱，多个邮箱用逗号分隔。",
    },
    isToolParam: true,
  },
  subject: {
    type: z.string(),
    title: { en: "Subject", "zh-CN": "邮件主题" },
    description: { en: "Email subject.", "zh-CN": "请输入邮件主题。" },
    isToolParam: true,
  },
  content: {
    type: z.string(),
    title: { en: "Email content", "zh-CN": "邮件内容" },
    description: {
      en: "Email content; HTML is supported.",
      "zh-CN": "请输入邮件内容，支持 HTML 格式。",
    },
    isToolParam: true,
  },
  cc: {
    type: z.string().optional(),
    title: { en: "CC", "zh-CN": "抄送" },
    description: {
      en: "CC email addresses, separated by commas.",
      "zh-CN": "请输入抄送邮箱，多个邮箱用逗号分隔。",
    },
    isToolParam: true,
  },
  bcc: {
    type: z.string().optional(),
    title: { en: "BCC", "zh-CN": "密送" },
    description: {
      en: "BCC email addresses, separated by commas.",
      "zh-CN": "请输入密送邮箱，多个邮箱用逗号分隔。",
    },
    isToolParam: true,
  },
  attachments: {
    type: z.string().optional(),
    title: { en: "Attachments", "zh-CN": "附件" },
    description: {
      en: 'Provide a JSON array such as [{"filename":"file name","path":"attachment URL"}].',
      "zh-CN":
        '必须是 JSON 数组格式，例如 [{"filename":"附件名","path":"附件 URL"}]。',
    },
    isToolParam: true,
  },
});
const outputSchema = defineOutputSchema({
  success: {
    type: z.boolean(),
    title: { en: "Sent successfully", "zh-CN": "是否发送成功" },
    description: {
      en: "Whether the email was sent successfully.",
      "zh-CN": "邮件是否发送成功。",
    },
  },
  messageId: {
    type: z.string().optional(),
    title: { en: "Message ID", "zh-CN": "邮件消息 ID" },
    description: {
      en: "Message ID returned by the SMTP service.",
      "zh-CN": "SMTP 服务返回的邮件消息 ID。",
    },
  },
  error: {
    type: z.string().optional(),
    title: { en: "Error", "zh-CN": "错误信息" },
    description: {
      en: "Error information when sending fails.",
      "zh-CN": "发送失败时的错误信息。",
    },
  },
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await toolCb(parsedInput);
    return OutputType.parseAsync(output);
  },
});

const tool = defineTool({
  manifest: {
    pluginId: "smtpEmail",
    name: {
      en: "SMTP Email",
      "zh-CN": "Email 邮件发送",
    },
    description: {
      en: "Send email by SMTP protocol (nodemailer)",
      "zh-CN": "通过SMTP协议发送电子邮件(nodemailer)",
    },
    version: "0.1.1",
    versionDescription: {
      en: "Default version",
      "zh-CN": "默认版本",
    },
    tags: ["communication"],
  },
  handler,
});

export default tool;
