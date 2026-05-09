import { expect, test } from 'vitest';
import tool from '..';
import { InputType, OutputType, tool as toolCb } from '../src';

test('exports plugin metadata and handler', () => {
  expect(tool.getUserToolManifest().pluginId).toBe('cpuStressTest');
  expect(tool.getToolHandler()).toBeDefined();
});

test('runs a CPU workload and returns metrics', async () => {
  const input = await InputType.parseAsync({
    durationMs: 10,
    batchSize: 1000,
    seed: 1
  });

  const output = await toolCb(input);
  const parsedOutput = OutputType.parse(output);

  expect(parsedOutput.elapsedMs).toBeGreaterThanOrEqual(0);
  expect(parsedOutput.iterations).toBeGreaterThanOrEqual(1000);
  expect(parsedOutput.checksum).toMatch(/^[0-9a-f]{8}$/);
  expect(parsedOutput.opsPerSecond).toBeGreaterThanOrEqual(0);
  expect(parsedOutput.yieldedCount).toBe(0);
});

test('supports Chinese input aliases and yielding mode', async () => {
  const input = await InputType.parseAsync({
    压测时长: 10,
    批大小: 1000,
    让步间隔: 1,
    随机种子: 7
  });

  const output = await toolCb(input);

  expect(output.iterations).toBeGreaterThanOrEqual(1000);
  expect(output.yieldedCount).toBeGreaterThanOrEqual(1);
});

test('rejects unsafe duration values', async () => {
  await expect(
    InputType.parseAsync({
      durationMs: 30001
    })
  ).rejects.toThrow();
});
