import { z } from "zod";
import { slackApiRequest } from "../../../client";

const SlackMessageSchema = z.object({
  channel: z.string(),
  ts: z.string(),
  text: z.string().default(""),
  thread_ts: z.string().nullable().default(null),
});

export const InputType = z.object({
  botToken: z.string().min(1, "Slack bot token is required"),
  channel: z.string().min(1, "Channel is required"),
  text: z.string().min(1, "Message text is required"),
  thread_ts: z.string().min(1).optional(),
  unfurl_links: z.boolean().optional(),
  unfurl_media: z.boolean().optional(),
});

export const OutputType = z.object({
  channel: z.string(),
  ts: z.string(),
  text: z.string(),
  thread_ts: z.string().nullable(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const {
    botToken,
    channel,
    text,
    thread_ts,
    unfurl_links,
    unfurl_media,
  } = await InputType.parseAsync(input);

  const body = {
    channel,
    text,
    ...(thread_ts === undefined ? {} : { thread_ts }),
    ...(unfurl_links === undefined ? {} : { unfurl_links }),
    ...(unfurl_media === undefined ? {} : { unfurl_media }),
  };

  const response = await slackApiRequest<{ channel: string; ts: string; message?: unknown }>(
    botToken,
    "chat.postMessage",
    {
      method: "POST",
      body,
    },
  );

  const message = SlackMessageSchema.parse({
    channel: response.channel,
    ts: response.ts,
    ...(isRecord(response.message) ? response.message : {}),
  });

  return OutputType.parse({
    channel: message.channel,
    ts: message.ts,
    text: message.text,
    thread_ts: message.thread_ts,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
