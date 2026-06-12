import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({
  smtpHost: z.string().meta({
    title: "SMTP 服务器地址",
    description: "例如 smtp.gmail.com 或 smtp.qq.com",
  }),
  smtpPort: z.string().meta({
    title: "SMTP 端口",
    description: "例如 465 或 587",
  }),
  SSL: z.boolean().optional().meta({
    title: "启用 SSL/TLS",
    description: "通常 465 端口开启，587 端口关闭",
  }),
  smtpUser: z.string().meta({
    title: "SMTP 用户名",
    description: "通常为发件邮箱地址",
  }),
  smtpPass: z.string().meta({
    title: "SMTP 密码",
    description: "SMTP 密码或邮箱授权码",
    isSecret: true,
  }),
});
const inputSchema = z.object({
  fromName: z.string().meta({
    title: "fromName",
    description: "显示的发件人名称",
  }),
  to: z.string().meta({
    title: "to",
    description: "请输入收件人邮箱，多个邮箱用逗号分隔",
    toolDescription: "请输入收件人邮箱，多个邮箱用逗号分隔",
  }),
  subject: z.string().meta({
    title: "subject",
    description: "请输入邮件主题",
    toolDescription: "请输入邮件主题",
  }),
  content: z.string().meta({
    title: "content",
    description: "请输入邮件内容，支持HTML格式",
    toolDescription: "请输入邮件内容，支持HTML格式",
  }),
  cc: z.string().optional().meta({
    title: "cc",
    description: "请输入抄送邮箱，多个邮箱用逗号分隔",
    toolDescription: "请输入抄送邮箱，多个邮箱用逗号分隔",
  }),
  bcc: z.string().optional().meta({
    title: "bcc",
    description: "请输入密送邮箱，多个邮箱用逗号分隔",
    toolDescription: "请输入密送邮箱，多个邮箱用逗号分隔",
  }),
  attachments: z.string().optional().meta({
    title: "attachments",
    description: '必须是json数组格式\n[{\filename:"附件名",path:"附件url"}]',
    toolDescription:
      '必须是json数组格式\n[{\filename:"附件名",path:"附件url"}]',
  }),
});
const outputSchema = z.object({
  success: z.boolean().meta({
    title: "是否发送成功",
    description: "邮件是否发送成功",
  }),
  messageId: z.string().optional().meta({
    title: "邮件消息 ID",
    description: "SMTP 服务返回的邮件消息 ID",
  }),
  error: z.string().optional().meta({
    title: "错误信息",
    description: "发送失败时的错误信息",
  }),
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
    const output = await toolCb(parsedInput, ctx);
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
      "zh-CN": "Default version",
    },
    tags: ["communication"],
  },
  secretSchema,
  handler,
});

export default tool;
