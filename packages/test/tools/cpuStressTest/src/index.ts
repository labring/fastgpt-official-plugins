import { z } from 'zod';

const DEFAULT_DURATION_MS = 1000;
const DEFAULT_BATCH_SIZE = 100000;
const DEFAULT_YIELD_EVERY_MS = 0;
const DEFAULT_SEED = 1;

export const InputType = z
  .object({
    durationMs: z.number().int().min(10).max(30000).optional(),
    batchSize: z.number().int().min(1000).max(5000000).optional(),
    yieldEveryMs: z.number().int().min(0).max(1000).optional(),
    seed: z.number().int().min(1).max(2147483647).optional(),
    压测时长: z.number().int().min(10).max(30000).optional(),
    批大小: z.number().int().min(1000).max(5000000).optional(),
    让步间隔: z.number().int().min(0).max(1000).optional(),
    随机种子: z.number().int().min(1).max(2147483647).optional()
  })
  .transform((data) => ({
    durationMs: data.durationMs ?? data.压测时长 ?? DEFAULT_DURATION_MS,
    batchSize: data.batchSize ?? data.批大小 ?? DEFAULT_BATCH_SIZE,
    yieldEveryMs: data.yieldEveryMs ?? data.让步间隔 ?? DEFAULT_YIELD_EVERY_MS,
    seed: data.seed ?? data.随机种子 ?? DEFAULT_SEED
  }));

export const OutputType = z.object({
  elapsedMs: z.number().nonnegative(),
  iterations: z.number().int().nonnegative(),
  checksum: z.string(),
  opsPerSecond: z.number().nonnegative(),
  yieldedCount: z.number().int().nonnegative()
});

type WorkloadState = {
  x: number;
  checksum: number;
  iterations: number;
};

export async function tool(
  input: z.infer<typeof InputType>,
  _ctx?: unknown
): Promise<z.infer<typeof OutputType>> {
  const startTime = Date.now();
  const endTime = startTime + input.durationMs;
  const state: WorkloadState = {
    x: input.seed >>> 0,
    checksum: 2166136261,
    iterations: 0
  };
  let yieldedCount = 0;
  let lastYieldTime = startTime;

  do {
    runBatch(state, input.batchSize);

    if (input.yieldEveryMs > 0) {
      const now = Date.now();
      if (now - lastYieldTime >= input.yieldEveryMs) {
        yieldedCount += 1;
        lastYieldTime = now;
        await sleep(0);
      }
    }
  } while (Date.now() < endTime);

  const elapsedMs = Date.now() - startTime;

  return {
    elapsedMs,
    iterations: state.iterations,
    checksum: state.checksum.toString(16).padStart(8, '0'),
    opsPerSecond: elapsedMs > 0 ? Math.round((state.iterations * 1000) / elapsedMs) : 0,
    yieldedCount
  };
}

function runBatch(state: WorkloadState, batchSize: number): void {
  let x = state.x;
  let checksum = state.checksum;

  for (let index = 0; index < batchSize; index += 1) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    checksum = Math.imul(checksum ^ x, 16777619) >>> 0;
  }

  state.x = x;
  state.checksum = checksum;
  state.iterations += batchSize;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
