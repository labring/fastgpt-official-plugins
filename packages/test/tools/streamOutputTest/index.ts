import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});

const inputSchema = defineInputSchema({
  content: {
    type: z.string().optional(),
    title: { en: "Streaming content", "zh-CN": "流式输出内容" },
    description: {
      en: "Complete content to send as streaming chunks.",
      "zh-CN": "需要按分片流式输出的完整内容。",
    },
    isToolParam: true,
  },
  chunkCount: {
    type: z.number().optional(),
    title: { en: "Chunk count", "zh-CN": "分片数量" },
    description: {
      en: "Number of chunks to split the content into.",
      "zh-CN": "将内容拆分成的分片数量。",
    },
    isToolParam: true,
  },
  intervalMs: {
    type: z.number().optional(),
    title: { en: "Chunk interval (ms)", "zh-CN": "分片间隔（毫秒）" },
    description: {
      en: "Delay in milliseconds between chunks.",
      "zh-CN": "每个分片之间等待的毫秒数。",
    },
    isToolParam: true,
  },
  streamType: {
    type: z.enum(["answer", "fastAnswer"]).optional(),
    title: { en: "Stream message type", "zh-CN": "流式消息类型" },
    description: {
      en: "Use answer for the standard answer stream or fastAnswer for the fast-answer stream.",
      "zh-CN": "answer 表示普通回答流，fastAnswer 表示快速回答流。",
    },
    isToolParam: true,
  },
  输出内容: {
    type: z.string().min(1).max(2000).optional(),
    title: { en: "Streaming content (Chinese alias)", "zh-CN": "流式输出内容" },
    description: {
      en: "Chinese alias for the complete content to send as streaming chunks.",
      "zh-CN": "需要按分片流式输出的完整内容。",
    },
    isToolParam: true,
  },
  分片数量: {
    type: z.number().int().min(1).max(50).optional(),
    title: { en: "Chunk count (Chinese alias)", "zh-CN": "分片数量" },
    description: {
      en: "Chinese alias for the number of chunks to split the content into.",
      "zh-CN": "将内容拆分成的分片数量。",
    },
    isToolParam: true,
  },
  分片间隔: {
    type: z.number().int().min(0).max(10000).optional(),
    title: {
      en: "Chunk interval (Chinese alias)",
      "zh-CN": "分片间隔（毫秒）",
    },
    description: {
      en: "Chinese alias for the delay in milliseconds between chunks.",
      "zh-CN": "每个分片之间等待的毫秒数。",
    },
    isToolParam: true,
  },
  流类型: {
    type: z.enum(["answer", "fastAnswer"]).optional(),
    title: {
      en: "Stream message type (Chinese alias)",
      "zh-CN": "流式消息类型",
    },
    description: {
      en: "Chinese alias for the stream message type.",
      "zh-CN": "选择 answer 普通回答流或 fastAnswer 快速回答流。",
    },
    isToolParam: true,
  },
});

const outputSchema = defineOutputSchema({
  content: {
    type: z.string(),
    title: { en: "Complete content", "zh-CN": "完整内容" },
    description: {
      en: "The complete content sent in this stream.",
      "zh-CN": "本次流式输出的完整内容。",
    },
  },
  chunkCount: {
    type: z.number(),
    title: { en: "Actual chunk count", "zh-CN": "实际分片数" },
    description: {
      en: "Number of streaming chunks actually sent.",
      "zh-CN": "实际发送的流式分片数量。",
    },
  },
  streamType: {
    type: z.string(),
    title: { en: "Stream message type", "zh-CN": "流式消息类型" },
    description: {
      en: "Stream message type used for this run.",
      "zh-CN": "本次使用的流式消息类型。",
    },
  },
  elapsedMs: {
    type: z.number(),
    title: { en: "Elapsed time (ms)", "zh-CN": "耗时（毫秒）" },
    description: {
      en: "Total plugin execution time in milliseconds.",
      "zh-CN": "插件运行总耗时。",
    },
  },
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
    pluginId: "streamOutputTest",
    name: {
      en: "Stream Output Test",
      "zh-CN": "流式输出测试",
    },
    description: {
      en: "Send configurable streaming answer chunks to test whether streaming output works correctly.",
      "zh-CN": "发送可配置的流式回答分片，用于测试流式输出是否能正常进行。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  handler,
});

export default tool;
