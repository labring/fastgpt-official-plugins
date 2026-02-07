import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import nodemailer from "nodemailer";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    smtpHost,
    smtpPort,
    SSL,
    smtpUser,
    smtpPass,
    fromName,
    to,
    subject,
    content,
    cc,
    bcc,
    attachments,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: SSL,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
  try {
    const attachmentsArray = (() => {
      try {
        return JSON.parse(attachments || "[]");
      } catch {
        throw new Error(
          "Attachment format parsing error, please check attachment configuration",
        );
      }
    })();
    // 发送邮件
    const info = await transporter.sendMail({
      from: `"${fromName || "FastGPT"}" <${smtpUser}>`,
      to: to
        .split(",")
        .map((email) => email.trim())
        .join(","),
      cc: cc
        ?.split(",")
        .map((email) => email.trim())
        .join(","),
      bcc: bcc
        ?.split(",")
        .map((email) => email.trim())
        .join(","),
      subject,
      html: content,
      attachments: attachmentsArray || [],
    });
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message ?? (typeof error === "string" ? error : "未知错误"),
    };
  }
}
