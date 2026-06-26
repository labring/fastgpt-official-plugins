import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as fetchMessagesInputType,
  OutputType as fetchMessagesOutputType,
  tool as fetchMessagesTool,
} from "./children/fetchMessages";
import {
  InputType as listChannelsInputType,
  OutputType as listChannelsOutputType,
  tool as listChannelsTool,
} from "./children/listChannels";
import {
  InputType as sendMessageInputType,
  OutputType as sendMessageOutputType,
  tool as sendMessageTool,
} from "./children/sendMessage";

const secretSchema = z.object({
  botToken: z.string().meta({
    title: "Slack Bot Token",
    description: "Slack Bot User OAuth Token，例如 xoxb-...",
    isSecret: true,
  }),
});

const sendMessageSecretSchema = z.object({});
const sendMessageInputSchema = z.object({
  channel: z.string().meta({
    title: "Channel ID",
    description: "Slack channel ID，例如 C1234567890",
    toolDescription: "Slack channel ID to send the message to.",
  }),
  text: z.string().meta({
    title: "Message Text",
    description: "要发送的文本消息",
    toolDescription: "Plain text message to send.",
  }),
  thread_ts: z.string().optional().meta({
    title: "Thread Timestamp",
    description: "可选，回复到指定 thread 的 ts",
    toolDescription: "Optional thread timestamp to reply in a Slack thread.",
  }),
  unfurl_links: z.boolean().optional().meta({
    title: "Unfurl Links",
    description: "是否展开消息中的链接",
    toolDescription: "Whether Slack should unfurl links in the message.",
  }),
  unfurl_media: z.boolean().optional().meta({
    title: "Unfurl Media",
    description: "是否展开消息中的媒体",
    toolDescription: "Whether Slack should unfurl media in the message.",
  }),
});
const sendMessageOutputSchema = z.object({
  channel: z.string().meta({
    title: "Channel ID",
    description: "消息发送到的 channel ID",
  }),
  ts: z.string().meta({
    title: "Message Timestamp",
    description: "Slack 消息时间戳",
  }),
  text: z.string().meta({
    title: "Message Text",
    description: "Slack 返回的消息文本",
  }),
  thread_ts: z.string().nullable().meta({
    title: "Thread Timestamp",
    description: "线程时间戳，无线程时为 null",
  }),
});
const sendMessageHandler = createToolHandler({
  inputSchema: sendMessageInputSchema,
  outputSchema: sendMessageOutputSchema,
  secretSchema: sendMessageSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await sendMessageInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await sendMessageTool(parsedInput);
    return sendMessageOutputType.parseAsync(output);
  },
});

const listChannelsSecretSchema = z.object({});
const listChannelsInputSchema = z.object({
  limit: z.number().int().min(1).max(1000).optional().meta({
    title: "Limit",
    description: "返回 channel 数量，范围 1-1000，默认 100",
    toolDescription: "Maximum number of channels to return.",
  }),
  cursor: z.string().optional().meta({
    title: "Cursor",
    description: "Slack pagination cursor",
    toolDescription: "Pagination cursor returned by a previous call.",
  }),
});
const listChannelsOutputSchema = z.object({
  channels: z
    .array(
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
    )
    .meta({
      title: "Channels",
      description: "Slack public/private channel 列表",
    }),
  next_cursor: z.string().meta({
    title: "Next Cursor",
    description: "下一页 cursor，无下一页时为空字符串",
  }),
});
const listChannelsHandler = createToolHandler({
  inputSchema: listChannelsInputSchema,
  outputSchema: listChannelsOutputSchema,
  secretSchema: listChannelsSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await listChannelsInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await listChannelsTool(parsedInput);
    return listChannelsOutputType.parseAsync(output);
  },
});

const fetchMessagesSecretSchema = z.object({});
const fetchMessagesInputSchema = z.object({
  channel: z.string().meta({
    title: "Channel ID",
    description: "Slack channel ID，例如 C1234567890",
    toolDescription: "Slack channel ID to fetch messages from.",
  }),
  limit: z.number().int().min(1).max(1000).optional().meta({
    title: "Limit",
    description: "返回消息数量，范围 1-1000，默认 100",
    toolDescription: "Maximum number of messages to return.",
  }),
  oldest: z.string().optional().meta({
    title: "Oldest Timestamp",
    description: "只返回该 Slack ts 之后的消息",
    toolDescription: "Only messages after this Slack timestamp.",
  }),
  latest: z.string().optional().meta({
    title: "Latest Timestamp",
    description: "只返回该 Slack ts 之前的消息",
    toolDescription: "Only messages before this Slack timestamp.",
  }),
});
const fetchMessagesOutputSchema = z.object({
  messages: z
    .array(
      z.object({
        type: z.string(),
        user: z.string().nullable(),
        username: z.string().nullable(),
        text: z.string(),
        ts: z.string(),
        thread_ts: z.string().nullable(),
        reply_count: z.number().nullable(),
      }),
    )
    .meta({
      title: "Messages",
      description: "Slack channel 最近消息列表",
    }),
  has_more: z.boolean().meta({
    title: "Has More",
    description: "是否还有更多消息",
  }),
  next_cursor: z.string().meta({
    title: "Next Cursor",
    description: "下一页 cursor，无下一页时为空字符串",
  }),
});
const fetchMessagesHandler = createToolHandler({
  inputSchema: fetchMessagesInputSchema,
  outputSchema: fetchMessagesOutputSchema,
  secretSchema: fetchMessagesSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await fetchMessagesInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await fetchMessagesTool(parsedInput);
    return fetchMessagesOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "slack",
    name: {
      en: "Slack Tool Set",
      "zh-CN": "Slack 工具集",
    },
    description: {
      en: "Send messages and read channels or recent messages with Slack Web API.",
      "zh-CN": "通过 Slack Web API 发送消息、列出频道并读取最近消息。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial Slack tool suite",
      "zh-CN": "初始 Slack 工具集版本",
    },
    toolDescription:
      "Slack tool suite for posting text messages, listing public/private channels, and fetching recent channel messages.",
    tags: ["communication", "tools"],
  },
  secretSchema,
  children: [
    {
      id: "sendMessage",
      name: {
        en: "Send Message",
        "zh-CN": "发送消息",
      },
      description: {
        en: "Send a text message to a Slack channel with optional thread and unfurl settings.",
        "zh-CN": "向 Slack channel 发送文本消息，可选 thread 与链接/媒体展开设置。",
      },
      toolDescription:
        "Send a plain text message to a Slack channel using chat.postMessage.",
      handler: sendMessageHandler,
    },
    {
      id: "listChannels",
      name: {
        en: "List Channels",
        "zh-CN": "列出频道",
      },
      description: {
        en: "List Slack public and private channels with cursor pagination.",
        "zh-CN": "分页列出 Slack public/private channel。",
      },
      toolDescription:
        "List Slack public and private channels using conversations.list.",
      handler: listChannelsHandler,
    },
    {
      id: "fetchMessages",
      name: {
        en: "Fetch Messages",
        "zh-CN": "获取消息",
      },
      description: {
        en: "Fetch recent messages from a Slack channel with optional time range filters.",
        "zh-CN": "获取 Slack channel 最近消息，可选 oldest/latest 时间过滤。",
      },
      toolDescription:
        "Fetch recent Slack channel messages using conversations.history.",
      handler: fetchMessagesHandler,
    },
  ],
});

export default toolSet;
