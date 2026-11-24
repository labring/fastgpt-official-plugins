import { expect, test, vi } from "vitest";
import z from "zod";
import tool from "../index";
import { InputType, OutputType, tool as toolCb } from "../src";

test("exports plugin metadata with model:invoke permission and modelId input schema", () => {
  const manifest = tool.getUserToolManifest();
  expect(manifest.pluginId).toBe("modelInvokeTest");
  expect(manifest.permission).toEqual(["model:invoke"]);

  const handler = tool.getToolHandler();
  expect(handler).toBeDefined();
  const inputJsonSchema = z.toJSONSchema(handler.inputSchema);
  expect(inputJsonSchema.required).toEqual(["model", "prompt"]);
  expect(inputJsonSchema.properties).toMatchObject({
    stream: { default: false },
    streamType: { default: "answer" },
    responseFormat: { default: "text" },
    callCount: { default: 1 },
  });
  expect(handler.inputSchema.shape.model.meta()).toMatchObject({
    format: "modelId",
    isToolParam: false,
  });
  expect(handler.inputSchema.shape.prompt.meta()).toMatchObject({
    isToolParam: true,
  });
  expect(handler.inputSchema.shape.systemPrompt.meta()).toMatchObject({
    isToolParam: true,
  });
  for (const key of [
    "stream",
    "streamType",
    "temperature",
    "maxTokens",
    "responseFormat",
    "callCount",
  ] as const) {
    expect(handler.inputSchema.shape[key].meta()).toMatchObject({
      isToolParam: false,
    });
  }
  expect(
    handler.inputSchema.parse({
      model: "model-id-default",
      prompt: "Hello",
    }),
  ).toEqual({
    model: "model-id-default",
    prompt: "Hello",
    stream: false,
    streamType: "answer",
    responseFormat: "text",
    callCount: 1,
  });
});

test("tool handler validates input and executes through createModelClient", async () => {
  const create = vi.fn().mockResolvedValue({
    id: "chatcmpl-handler",
    object: "chat.completion",
    created: 1700000000,
    model: "gpt-4o",
    choices: [
      {
        index: 0,
        finish_reason: "stop",
        message: { role: "assistant", content: "ok" },
      },
    ],
    usage: { prompt_tokens: 5, completion_tokens: 1, total_tokens: 6 },
  });

  const handler = tool.getToolHandler();
  const output = await handler.handler(
    {
      model: "  model-id-trimmed  ",
      prompt: "  Ping  ",
    },
    {
      systemVar: {
        time: "2026-11-16",
        invokeToken: "tok",
        app: { id: "app", name: "App" },
        chat: { chatId: "chat", uid: "uid" },
      },
      secrets: {},
      invoke: {
        createModelClient: () => ({ chat: { completions: { create } } }) as any,
      } as any,
      streamResponse: vi.fn(),
    },
  );

  expect(create).toHaveBeenCalledWith({
    model: "model-id-trimmed",
    messages: [{ role: "user", content: "Ping" }],
    stream: false,
  });
  expect(output).toMatchObject({
    reply: "ok",
    model: "gpt-4o",
    promptTokens: 5,
    completionTokens: 1,
    totalTokens: 6,
    callCount: 1,
  });
});

test("executes non-streaming completion with optional params and returns usage", async () => {
  const create = vi.fn().mockResolvedValue({
    id: "chatcmpl-1",
    object: "chat.completion",
    created: 1700000000,
    model: "gpt-4o-mini",
    choices: [
      {
        index: 0,
        finish_reason: "stop",
        message: {
          role: "assistant",
          content: '{"status":"ok"}',
          reasoning_content: "checked format",
        },
      },
    ],
    usage: {
      prompt_tokens: 12,
      completion_tokens: 8,
      total_tokens: 20,
    },
  });

  const streamResponse = vi.fn();
  const input = await InputType.parseAsync({
    model: "model-id-1",
    prompt: "Return status ok as JSON",
    systemPrompt: "Respond in JSON.",
    temperature: 0.2,
    maxTokens: 256,
    responseFormat: "json_object",
  });

  const output = await toolCb(input, {
    invoke: {
      createModelClient: () => ({ chat: { completions: { create } } }) as any,
    },
    streamResponse,
  });

  expect(create).toHaveBeenCalledTimes(1);
  expect(create).toHaveBeenCalledWith({
    model: "model-id-1",
    messages: [
      { role: "system", content: "Respond in JSON." },
      { role: "user", content: "Return status ok as JSON" },
    ],
    temperature: 0.2,
    max_tokens: 256,
    response_format: { type: "json_object" },
    stream: false,
  });
  expect(streamResponse).not.toHaveBeenCalled();
  expect(OutputType.parse(output)).toEqual({
    reply: '{"status":"ok"}',
    reasoning: "checked format",
    model: "gpt-4o-mini",
    finishReason: "stop",
    promptTokens: 12,
    completionTokens: 8,
    totalTokens: 20,
    callCount: 1,
    chunkCount: 0,
    elapsedMs: expect.any(Number),
  });
});

test("streams chunks via ctx.streamResponse and accumulates usage across multiple calls", async () => {
  let invocation = 0;
  const create = vi.fn().mockImplementation(async () => {
    invocation += 1;
    const tag = invocation;
    return (async function* () {
      yield {
        id: `chatcmpl-${tag}`,
        model: "deepseek-r1",
        choices: [
          {
            index: 0,
            delta: { reasoning_content: `think-${tag} ` },
            finish_reason: null,
          },
        ],
      };
      yield {
        id: `chatcmpl-${tag}`,
        model: "deepseek-r1",
        choices: [
          {
            index: 0,
            delta: { content: `part-${tag}a ` },
            finish_reason: null,
          },
        ],
      };
      yield {
        id: `chatcmpl-${tag}`,
        model: "deepseek-r1",
        choices: [
          {
            index: 0,
            delta: { content: `part-${tag}b` },
            finish_reason: "stop",
          },
        ],
      };
      yield {
        id: `chatcmpl-${tag}`,
        model: "deepseek-r1",
        choices: [],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };
    })();
  });

  const streamMessages: Array<{
    type: "answer" | "fastAnswer";
    content: string;
  }> = [];
  const input = await InputType.parseAsync({
    model: "model-id-2",
    prompt: "Say hello",
    stream: true,
    streamType: "fastAnswer",
    callCount: 2,
  });

  const output = await toolCb(input, {
    invoke: {
      createModelClient: () => ({ chat: { completions: { create } } }) as any,
    },
    streamResponse: (message) => streamMessages.push(message),
  });

  expect(create).toHaveBeenCalledTimes(2);
  expect(create).toHaveBeenNthCalledWith(1, {
    model: "model-id-2",
    messages: [{ role: "user", content: "Say hello" }],
    stream: true,
    stream_options: { include_usage: true },
  });
  expect(streamMessages).toEqual([
    { type: "fastAnswer", content: "part-1a " },
    { type: "fastAnswer", content: "part-1b" },
    { type: "fastAnswer", content: "\n---\n" },
    { type: "fastAnswer", content: "part-2a " },
    { type: "fastAnswer", content: "part-2b" },
  ]);
  expect(OutputType.parse(output)).toEqual({
    reply: "part-1a part-1b\n---\npart-2a part-2b",
    reasoning: "think-1 \n---\nthink-2 ",
    model: "deepseek-r1",
    finishReason: "stop",
    promptTokens: 20,
    completionTokens: 10,
    totalTokens: 30,
    callCount: 2,
    chunkCount: 8,
    elapsedMs: expect.any(Number),
  });
});

test("propagates errors thrown by createModelClient", async () => {
  const create = vi
    .fn()
    .mockRejectedValue(new Error("403 Forbidden: missing model:invoke"));
  const input = await InputType.parseAsync({
    model: "model-id-3",
    prompt: "Test error",
  });

  await expect(
    toolCb(input, {
      invoke: {
        createModelClient: () => ({ chat: { completions: { create } } }) as any,
      },
      streamResponse: vi.fn(),
    }),
  ).rejects.toThrow("403 Forbidden: missing model:invoke");
});

test("uses latest cumulative usage snapshot within a single streaming call", async () => {
  const create = vi.fn().mockImplementation(async () =>
    (async function* () {
      yield {
        id: "chatcmpl-cumulative",
        model: "gpt-4o-mini",
        choices: [{ index: 0, delta: { content: "hi" }, finish_reason: null }],
        usage: { prompt_tokens: 10, completion_tokens: 1, total_tokens: 11 },
      };
      yield {
        id: "chatcmpl-cumulative",
        model: "gpt-4o-mini",
        choices: [{ index: 0, delta: { content: "!" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 10, completion_tokens: 2, total_tokens: 12 },
      };
    })(),
  );

  const input = await InputType.parseAsync({
    model: "model-id-4",
    prompt: "Cumulative usage",
    stream: true,
  });

  const output = await toolCb(input, {
    invoke: {
      createModelClient: () => ({ chat: { completions: { create } } }) as any,
    },
    streamResponse: vi.fn(),
  });

  expect(output.promptTokens).toBe(10);
  expect(output.completionTokens).toBe(2);
  expect(output.totalTokens).toBe(12);
});
