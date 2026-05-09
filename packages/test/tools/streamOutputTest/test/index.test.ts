import { expect, test } from 'vitest';
import tool from '..';
import { InputType, OutputType, tool as toolCb } from '../src';

test('exports plugin metadata and handler', () => {
  expect(tool.getUserToolManifest().pluginId).toBe('streamOutputTest');
  expect(tool.getToolHandler()).toBeDefined();
});

test('streams configured chunks and returns summary output', async () => {
  const streamMessages: Array<{ type: 'answer' | 'fastAnswer'; content: string }> = [];
  const input = await InputType.parseAsync({
    content: 'abcdef',
    chunkCount: 3,
    intervalMs: 0,
    streamType: 'answer'
  });

  const output = await toolCb(input, {
    streamResponse: (message) => streamMessages.push(message)
  });

  expect(OutputType.parse(output)).toEqual({
    content: 'abcdef',
    chunkCount: 3,
    streamType: 'answer',
    elapsedMs: expect.any(Number)
  });
  expect(streamMessages).toEqual([
    { type: 'answer', content: 'ab' },
    { type: 'answer', content: 'cd' },
    { type: 'answer', content: 'ef' }
  ]);
});

test('supports Chinese input aliases and fastAnswer stream type', async () => {
  const streamMessages: Array<{ type: 'answer' | 'fastAnswer'; content: string }> = [];
  const input = await InputType.parseAsync({
    输出内容: '流式测试',
    分片数量: 2,
    分片间隔: 0,
    流类型: 'fastAnswer'
  });

  const output = await toolCb(input, {
    streamResponse: (message) => streamMessages.push(message)
  });

  expect(output.content).toBe('流式测试');
  expect(output.chunkCount).toBe(2);
  expect(output.streamType).toBe('fastAnswer');
  expect(streamMessages).toEqual([
    { type: 'fastAnswer', content: '流式' },
    { type: 'fastAnswer', content: '测试' }
  ]);
});
