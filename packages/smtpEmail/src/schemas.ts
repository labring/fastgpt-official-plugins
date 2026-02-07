import { z } from "zod";

export const InputSchema = z
  .object({
    smtpHost: z.string(),
    smtpPort: z.string(),
    SSL: z.union([z.enum(["true", "false", ""]), z.boolean()]).optional(),
    smtpUser: z.string(),
    smtpPass: z.string(),
    fromName: z.string().optional(),
    to: z.string().refine(
      (val) =>
        val
          .split(",")
          .map((email) => email.trim())
          .every((email) => z.string().email().safeParse(email).success),
      { message: "to should be a comma-separated list of valid emails" },
    ),
    subject: z.string(),
    content: z.string(),
    cc: z
      .string()
      .refine(
        (val) =>
          val === undefined ||
          val === "" ||
          val
            .split(",")
            .map((email) => email.trim())
            .every((email) => z.string().email().safeParse(email).success),
        {
          message:
            "cc should be a comma-separated list of valid emails if provided",
        },
      )
      .optional(),
    bcc: z
      .string()
      .refine(
        (val) =>
          val === undefined ||
          val === "" ||
          val
            .split(",")
            .map((email) => email.trim())
            .every((email) => z.string().email().safeParse(email).success),
        {
          message:
            "bcc should be a comma-separated list of valid emails if provided",
        },
      )
      .optional(),
    attachments: z.string().optional(),
  })
  .transform((data) => {
    return {
      ...data,
      SSL: data.SSL === "true" || data.SSL === true,
    };
  });
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
