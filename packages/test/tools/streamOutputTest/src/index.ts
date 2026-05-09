import { z } from 'zod';

const streamMessageTypeSchema = z.enum(['answer', 'fastAnswer']);

export const InputType = z
  .object({
    content: z.string().min(1).max(2000).optional(),
    chunkCount: z.number().int().min(1).max(50).optional(),
    intervalMs: z.number().int().min(0).max(10000).optional(),
    streamType: streamMessageTypeSchema.optional(),
    输出内容: z.string().min(1).max(2000).optional(),
    分片数量: z.number().int().min(1).max(50).optional(),
    分片间隔: z.number().int().min(0).max(10000).optional(),
    流类型: streamMessageTypeSchema.optional()
  })
  .transform((data) => ({
    content: data.content ?? data.输出内容 ?? 'FastGPT stream output test.',
    chunkCount: data.chunkCount ?? data.分片数量 ?? 5,
    intervalMs: data.intervalMs ?? data.分片间隔 ?? 300,
    streamType: data.streamType ?? data.流类型 ?? 'answer'
  }));

export const OutputType = z.object({
  content: z.string(),
  chunkCount: z.number(),
  streamType: streamMessageTypeSchema,
  elapsedMs: z.number()
});

type StreamContext = {
  streamResponse: (msg: {
    type: z.infer<typeof streamMessageTypeSchema>;
    content: string;
  }) => void;
};

export async function tool(
  input: z.infer<typeof InputType>,
  ctx: StreamContext
): Promise<z.infer<typeof OutputType>> {
  const startTime = Date.now();
  const chunks = splitContent(input.content, input.chunkCount);

  for (const chunk of chunks) {
    ctx.streamResponse({
      type: input.streamType,
      content: chunk
    });

    if (input.intervalMs > 0) {
      await sleep(input.intervalMs);
    }
  }

  return {
    content: input.content,
    chunkCount: chunks.length,
    streamType: input.streamType,
    elapsedMs: Date.now() - startTime
  };
}

function splitContent(content: string, chunkCount: number): string[] {
  const chars = Array.from(content);
  const actualChunkCount = Math.min(chunkCount, chars.length);
  const chunks: string[] = [];

  for (let index = 0; index < actualChunkCount; index += 1) {
    const start = Math.floor((index * chars.length) / actualChunkCount);
    const end = Math.floor(((index + 1) * chars.length) / actualChunkCount);
    chunks.push(chars.slice(start, end).join(''));
  }

  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
