import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineTool,
  Model,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import { InputType, OutputType, tool as toolCb } from "./src";

const secretSchema = z.object({});

const inputSchema = defineInputSchema({
  model: {
    type: Model,
    title: { en: "Model", "zh-CN": "模型" },
    description: {
      en: "FastGPT model used for reverse model invocation.",
      "zh-CN": "用于反向调用的 FastGPT 模型。",
    },
    isToolParam: false,
  },
  prompt: {
    type: z.string().min(1),
    title: { en: "Prompt", "zh-CN": "提示词" },
    description: {
      en: "User prompt sent to the selected model.",
      "zh-CN": "发送给所选模型的用户提示词。",
    },
    placeholder: {
      en: "Enter a prompt to test reverse model invocation",
      "zh-CN": "输入用于测试模型反向调用的提示词",
    },
    isToolParam: true,
  },
  systemPrompt: {
    type: z.string().optional(),
    title: { en: "System prompt", "zh-CN": "系统提示词" },
    description: {
      en: "Optional system prompt prepended before the user message.",
      "zh-CN": "可选的系统提示词，作为 system 消息置于对话最前。",
    },
    isToolParam: true,
  },
  stream: {
    type: z.boolean().default(false).optional(),
    title: { en: "Enable streaming", "zh-CN": "启用流式调用" },
    description: {
      en: "Call chat completions with stream=true and forward chunks via ctx.streamResponse.",
      "zh-CN":
        "开启后以流式方式调用模型，并通过 ctx.streamResponse 实时转发输出分片。",
    },
    isToolParam: false,
  },
  streamType: {
    type: z.enum(["answer", "fastAnswer"]).default("answer").optional(),
    title: { en: "Stream message type", "zh-CN": "流式消息类型" },
    description: {
      en: "Stream message type emitted when streaming is enabled: answer or fastAnswer.",
      "zh-CN": "启用流式调用时发送的流式消息类型，可选 answer 或 fastAnswer。",
    },
    isToolParam: false,
  },
  temperature: {
    type: z.number().min(0).max(2).optional(),
    title: { en: "Temperature", "zh-CN": "采样温度" },
    description: {
      en: "Sampling temperature between 0 and 2.",
      "zh-CN": "采样温度，范围为 0–2。",
    },
    isToolParam: false,
  },
  maxTokens: {
    type: z.number().int().min(1).max(32768).optional(),
    title: { en: "Max tokens", "zh-CN": "最大输出 Token" },
    description: {
      en: "Maximum completion tokens per model call (1–32768).",
      "zh-CN": "单次模型调用允许生成的最大 Token 数（1–32768）。",
    },
    isToolParam: false,
  },
  responseFormat: {
    type: z.enum(["text", "json_object"]).default("text").optional(),
    title: { en: "Response format", "zh-CN": "响应格式" },
    description: {
      en: "OpenAI response_format mode: text or json_object.",
      "zh-CN":
        "透传给 OpenAI response_format 的输出模式，可选 text 或 json_object。",
    },
    isToolParam: false,
  },
  callCount: {
    type: z.number().int().min(1).max(5).default(1).optional(),
    title: { en: "Call count", "zh-CN": "调用次数" },
    description: {
      en: "Number of sequential model calls (1–5) in one execution to verify billing accumulation.",
      "zh-CN": "单次工具执行内连续调用模型的次数（1–5），用于验证计费累加。",
    },
    isToolParam: false,
  },
});

const outputSchema = defineOutputSchema({
  reply: {
    type: z.string(),
    title: { en: "Model reply", "zh-CN": "模型回复" },
    description: {
      en: "Assistant reply content returned by the model.",
      "zh-CN": "模型返回的助手回复内容。",
    },
  },
  reasoning: {
    type: z.string(),
    title: { en: "Reasoning content", "zh-CN": "思考过程" },
    description: {
      en: "Reasoning content if returned by a reasoning model; empty otherwise.",
      "zh-CN": "推理模型返回的思考过程文本，非推理模型为空字符串。",
    },
  },
  model: {
    type: z.string(),
    title: { en: "Resolved model", "zh-CN": "实际模型" },
    description: {
      en: "Model identifier reported in the OpenAI response.",
      "zh-CN": "OpenAI 响应中返回的实际模型标识。",
    },
  },
  finishReason: {
    type: z.string(),
    title: { en: "Finish reason", "zh-CN": "结束原因" },
    description: {
      en: "Completion finish reason from the final model call.",
      "zh-CN": "最后一次模型调用返回的 finish_reason。",
    },
  },
  promptTokens: {
    type: z.number(),
    title: { en: "Prompt tokens", "zh-CN": "输入 Token 数" },
    description: {
      en: "Accumulated prompt tokens across all calls in this execution.",
      "zh-CN": "本次执行内所有模型调用累计的输入 Token 数。",
    },
  },
  completionTokens: {
    type: z.number(),
    title: { en: "Completion tokens", "zh-CN": "输出 Token 数" },
    description: {
      en: "Accumulated completion tokens across all calls in this execution.",
      "zh-CN": "本次执行内所有模型调用累计的输出 Token 数。",
    },
  },
  totalTokens: {
    type: z.number(),
    title: { en: "Total tokens", "zh-CN": "总 Token 数" },
    description: {
      en: "Accumulated total tokens across all calls in this execution.",
      "zh-CN": "本次执行内所有模型调用累计的总 Token 数。",
    },
  },
  callCount: {
    type: z.number(),
    title: { en: "Actual call count", "zh-CN": "实际调用次数" },
    description: {
      en: "Number of model calls completed in this execution.",
      "zh-CN": "本次执行实际完成的模型调用次数。",
    },
  },
  chunkCount: {
    type: z.number(),
    title: { en: "Stream chunk count", "zh-CN": "流式分片数" },
    description: {
      en: "Total SSE chunks received when streaming is enabled; 0 otherwise.",
      "zh-CN": "流式调用时收到的 SSE 分片总数；非流式时为 0。",
    },
  },
  elapsedMs: {
    type: z.number(),
    title: { en: "Elapsed time (ms)", "zh-CN": "耗时（毫秒）" },
    description: {
      en: "Total plugin execution time in milliseconds.",
      "zh-CN": "插件运行总耗时（毫秒）。",
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
    pluginId: "modelInvokeTest",
    name: {
      en: "Model Invoke Test",
      "zh-CN": "模型反向调用测试",
    },
    description: {
      en: "Test FastGPT model reverse invocation via ctx.invoke.createModelClient(), covering streaming output, JSON mode, and token usage billing.",
      "zh-CN":
        "通过 ctx.invoke.createModelClient() 测试 FastGPT 模型反向调用，覆盖流式输出、JSON 模式与实时 Token 计费。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
    permission: ["model:invoke"],
  },
  handler,
});

export default tool;
