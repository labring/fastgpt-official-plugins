import { z } from "zod";
import { slackApiRequest } from "../../../client";

const SlackMessageSchema = z.object({
  type: z.string().default("message"),
  user: z.string().nullable().default(null),
  username: z.string().nullable().default(null),
  text: z.string().default(""),
  ts: z.string(),
  thread_ts: z.string().nullable().default(null),
  reply_count: z.number().nullable().default(null),
});

export const InputType = z.object({
  botToken: z.string().min(1, "Slack bot token is required"),
  channel: z.string().min(1, "Channel is required"),
  limit: z.number().int().min(1).max(1000).default(100),
  oldest: z.string().min(1).optional(),
  latest: z.string().min(1).optional(),
});

export const OutputType = z.object({
  messages: z.array(
    z.object({
      type: z.string(),
      user: z.string().nullable(),
      username: z.string().nullable(),
      text: z.string(),
      ts: z.string(),
      thread_ts: z.string().nullable(),
      reply_count: z.number().nullable(),
    }),
  ),
  has_more: z.boolean(),
  next_cursor: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { botToken, channel, limit, oldest, latest } =
    await InputType.parseAsync(input);

  const response = await slackApiRequest<{ messages?: unknown[]; has_more?: boolean }>(
    botToken,
    "conversations.history",
    {
      query: {
        channel,
        limit,
        oldest,
        latest,
      },
    },
  );

  const messages = (response.messages ?? []).map((message) => {
    const parsed = SlackMessageSchema.parse(message);

    return {
      type: parsed.type,
      user: parsed.user,
      username: parsed.username,
      text: parsed.text,
      ts: parsed.ts,
      thread_ts: parsed.thread_ts,
      reply_count: parsed.reply_count,
    };
  });

  return OutputType.parse({
    messages,
    has_more: response.has_more ?? false,
    next_cursor: response.response_metadata?.next_cursor ?? "",
  });
}
