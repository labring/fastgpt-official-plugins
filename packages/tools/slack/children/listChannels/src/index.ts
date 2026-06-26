import { z } from "zod";
import { slackApiRequest } from "../../../client";

const SlackChannelSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  is_channel: z.boolean().default(false),
  is_group: z.boolean().default(false),
  is_private: z.boolean().default(false),
  is_archived: z.boolean().default(false),
  is_member: z.boolean().default(false),
  num_members: z.number().nullable().default(null),
  topic: z
    .object({
      value: z.string().default(""),
    })
    .optional(),
  purpose: z
    .object({
      value: z.string().default(""),
    })
    .optional(),
});

export const InputType = z.object({
  botToken: z.string().min(1, "Slack bot token is required"),
  limit: z.number().int().min(1).max(1000).default(100),
  cursor: z.string().min(1).optional(),
});

export const OutputType = z.object({
  channels: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      is_private: z.boolean(),
      is_archived: z.boolean(),
      is_member: z.boolean(),
      num_members: z.number().nullable(),
      topic: z.string(),
      purpose: z.string(),
    }),
  ),
  next_cursor: z.string(),
});

export async function tool(
  input: z.input<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const { botToken, limit, cursor } = await InputType.parseAsync(input);

  const response = await slackApiRequest<{ channels?: unknown[] }>(
    botToken,
    "conversations.list",
    {
      query: {
        types: "public_channel,private_channel",
        exclude_archived: false,
        limit,
        cursor,
      },
    },
  );

  const channels = (response.channels ?? []).map((channel) => {
    const parsed = SlackChannelSchema.parse(channel);

    return {
      id: parsed.id,
      name: parsed.name,
      is_private: parsed.is_private,
      is_archived: parsed.is_archived,
      is_member: parsed.is_member,
      num_members: parsed.num_members,
      topic: parsed.topic?.value ?? "",
      purpose: parsed.purpose?.value ?? "",
    };
  });

  return OutputType.parse({
    channels,
    next_cursor: response.response_metadata?.next_cursor ?? "",
  });
}
