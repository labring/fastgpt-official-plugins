import type {
  ToolHandlerContext,
  ToolInvokeClient,
} from "@fastgpt-plugin/sdk-factory";
import { z } from "zod";

const streamMessageTypeSchema = z.enum(["answer", "fastAnswer"]);
const responseFormatTypeSchema = z.enum(["text", "json_object"]);

export const InputType = z.object({
  model: z.string().trim().min(1),
  prompt: z.string().trim().min(1),
  systemPrompt: z.string().trim().optional(),
  stream: z.boolean().optional().default(false),
  streamType: streamMessageTypeSchema.optional().default("answer"),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(32768).optional(),
  responseFormat: responseFormatTypeSchema.optional().default("text"),
  callCount: z.number().int().min(1).max(5).optional().default(1),
});

export const OutputType = z.object({
  reply: z.string(),
  reasoning: z.string(),
  model: z.string(),
  finishReason: z.string(),
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
  callCount: z.number(),
  chunkCount: z.number(),
  elapsedMs: z.number(),
});

export type ModelInvokeContext = {
  invoke: Pick<ToolInvokeClient, "createModelClient">;
  streamResponse: ToolHandlerContext["streamResponse"];
};

type ModelClient = ReturnType<ToolInvokeClient["createModelClient"]>;
type ChatMessage = { role: "system" | "user"; content: string };

type SingleCallResult = {
  reply: string;
  reasoning: string;
  model: string;
  finishReason: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  chunkCount: number;
};

type UsageLike = {
  prompt_tokens?: number | null | undefined;
  completion_tokens?: number | null | undefined;
  total_tokens?: number | null | undefined;
};

function buildMessages(input: z.infer<typeof InputType>): ChatMessage[] {
  const messages: ChatMessage[] = [];
  if (input.systemPrompt) {
    messages.push({ role: "system", content: input.systemPrompt });
  }
  messages.push({ role: "user", content: input.prompt });
  return messages;
}

function buildBaseRequest(
  input: z.infer<typeof InputType>,
  messages: ChatMessage[],
) {
  return {
    model: input.model,
    messages,
    ...(input.temperature !== undefined
      ? { temperature: input.temperature }
      : {}),
    ...(input.maxTokens !== undefined ? { max_tokens: input.maxTokens } : {}),
    ...(input.responseFormat === "json_object"
      ? { response_format: { type: "json_object" as const } }
      : {}),
  };
}

function normalizeUsage(usage: UsageLike | null | undefined) {
  const promptTokens = usage?.prompt_tokens ?? 0;
  const completionTokens = usage?.completion_tokens ?? 0;
  const totalTokens = usage?.total_tokens ?? promptTokens + completionTokens;
  return { promptTokens, completionTokens, totalTokens };
}

function readReasoningText(container: unknown): string {
  if (!container || typeof container !== "object") {
    return "";
  }
  const value = (container as { reasoning_content?: unknown })
    .reasoning_content;
  return typeof value === "string" ? value : "";
}

async function runStreamingCall(
  ai: ModelClient,
  baseRequest: ReturnType<typeof buildBaseRequest>,
  streamType: z.infer<typeof streamMessageTypeSchema>,
  streamResponse: ToolHandlerContext["streamResponse"],
): Promise<SingleCallResult> {
  const stream = await ai.chat.completions.create({
    ...baseRequest,
    stream: true,
    stream_options: { include_usage: true },
  });

  let reply = "";
  let reasoning = "";
  let model = baseRequest.model;
  let finishReason = "";
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;
  let chunkCount = 0;

  for await (const chunk of stream) {
    chunkCount += 1;
    if (chunk.model) {
      model = chunk.model;
    }

    const choice = chunk.choices[0];
    if (choice?.finish_reason) {
      finishReason = choice.finish_reason;
    }

    const deltaContent = choice?.delta?.content;
    if (typeof deltaContent === "string" && deltaContent.length > 0) {
      reply += deltaContent;
      streamResponse({
        type: streamType,
        content: deltaContent,
      });
    }

    const deltaReasoning = readReasoningText(choice?.delta);
    if (deltaReasoning.length > 0) {
      reasoning += deltaReasoning;
    }

    if (chunk.usage) {
      // Streaming usage represents cumulative totals for this single completion request.
      const normalized = normalizeUsage(chunk.usage);
      promptTokens = normalized.promptTokens;
      completionTokens = normalized.completionTokens;
      totalTokens = normalized.totalTokens;
    }
  }

  return {
    reply,
    reasoning,
    model,
    finishReason,
    promptTokens,
    completionTokens,
    totalTokens,
    chunkCount,
  };
}

async function runNonStreamingCall(
  ai: ModelClient,
  baseRequest: ReturnType<typeof buildBaseRequest>,
): Promise<SingleCallResult> {
  const completion = await ai.chat.completions.create({
    ...baseRequest,
    stream: false,
  });

  const choice = completion.choices[0];
  const message = choice?.message;
  const usage = normalizeUsage(completion.usage);

  return {
    reply: typeof message?.content === "string" ? message.content : "",
    reasoning: readReasoningText(message),
    model: completion.model || baseRequest.model,
    finishReason: choice?.finish_reason ?? "",
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    chunkCount: 0,
  };
}

/**
 * Executes one or more reverse model chat completion calls through `ctx.invoke.createModelClient()`.
 */
export async function tool(
  input: z.infer<typeof InputType>,
  ctx: ModelInvokeContext,
): Promise<z.infer<typeof OutputType>> {
  const startTime = Date.now();
  const ai = ctx.invoke.createModelClient();
  const baseRequest = buildBaseRequest(input, buildMessages(input));

  const replies: string[] = [];
  const reasonings: string[] = [];
  let resolvedModel = input.model;
  let finishReason = "";
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;
  let chunkCount = 0;

  for (let index = 0; index < input.callCount; index += 1) {
    if (input.stream && index > 0) {
      ctx.streamResponse({
        type: input.streamType,
        content: "\n---\n",
      });
    }

    const result = input.stream
      ? await runStreamingCall(
          ai,
          baseRequest,
          input.streamType,
          ctx.streamResponse,
        )
      : await runNonStreamingCall(ai, baseRequest);

    replies.push(result.reply);
    if (result.reasoning) {
      reasonings.push(result.reasoning);
    }
    resolvedModel = result.model;
    finishReason = result.finishReason;
    promptTokens += result.promptTokens;
    completionTokens += result.completionTokens;
    totalTokens += result.totalTokens;
    chunkCount += result.chunkCount;
  }

  return {
    reply: replies.join("\n---\n"),
    reasoning: reasonings.join("\n---\n"),
    model: resolvedModel,
    finishReason,
    promptTokens,
    completionTokens,
    totalTokens,
    callCount: input.callCount,
    chunkCount,
    elapsedMs: Date.now() - startTime,
  };
}
