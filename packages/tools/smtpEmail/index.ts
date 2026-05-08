import { createToolHandler, defineTool } from "@fastgpt-plugin/sdk-factory";
import { InputType, OutputType, tool as toolCb } from "./src";
import z from "zod";

const secretSchema = z.object({});
const inputSchema = z.object({
  "fromName": z.string().meta({
    title: "fromName",
    description: "显示的发件人名称"
  }),
  "to": z.string().meta({
    title: "to",
    description: "请输入收件人邮箱，多个邮箱用逗号分隔",
    toolDescription: "请输入收件人邮箱，多个邮箱用逗号分隔"
  }),
  "subject": z.string().meta({
    title: "subject",
    description: "请输入邮件主题",
    toolDescription: "请输入邮件主题"
  }),
  "content": z.string().meta({
    title: "content",
    description: "请输入邮件内容，支持HTML格式",
    toolDescription: "请输入邮件内容，支持HTML格式"
  }),
  "cc": z.string().optional().meta({
    title: "cc",
    description: "请输入抄送邮箱，多个邮箱用逗号分隔",
    toolDescription: "请输入抄送邮箱，多个邮箱用逗号分隔"
  }),
  "bcc": z.string().optional().meta({
    title: "bcc",
    description: "请输入密送邮箱，多个邮箱用逗号分隔",
    toolDescription: "请输入密送邮箱，多个邮箱用逗号分隔"
  }),
  "attachments": z.string().optional().meta({
    title: "attachments",
    description: "必须是json数组格式\n[{\filename\:\"附件名\",\path\:\"附件url\"}]",
    toolDescription: "必须是json数组格式\n[{\filename\:\"附件名\",\path\:\"附件url\"}]"
  })
});
const outputSchema = z.object({
  "result": z.string().optional().meta({
    title: "发送结果",
    description: "发送结果"
  })
});
const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
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
