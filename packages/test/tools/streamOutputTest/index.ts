import { createToolHandler, defineTool } from '@fastgpt-plugin/sdk-factory';
import { InputType, OutputType, tool as toolCb } from './src';
import z from 'zod';

const secretSchema = z.object({});

const inputSchema = z.object({
  content: z.string().optional().meta({
    title: '流式输出内容',
    description: '需要按分片流式输出的完整内容'
  }),
  chunkCount: z.number().optional().meta({
    title: '分片数量',
    description: '把内容拆成多少段输出'
  }),
  intervalMs: z.number().optional().meta({
    title: '分片间隔(毫秒)',
    description: '每个分片之间等待的毫秒数'
  }),
  streamType: z.enum(['answer', 'fastAnswer']).optional().meta({
    title: '流式消息类型',
    description: 'answer 会进入回答流，fastAnswer 会进入快速回答流'
  })
});

const outputSchema = z.object({
  content: z.string().meta({
    title: '完整内容',
    description: '本次流式输出的完整内容'
  }),
  chunkCount: z.number().meta({
    title: '实际分片数',
    description: '实际发送的流式分片数量'
  }),
  streamType: z.string().meta({
    title: '流式消息类型',
    description: '本次使用的流式消息类型'
  }),
  elapsedMs: z.number().meta({
    title: '耗时(毫秒)',
    description: '插件运行总耗时'
  })
});

const handler = createToolHandler({
  inputSchema,
  outputSchema,
  secretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await InputType.parseAsync(input);
    const output = await toolCb(parsedInput, ctx);
    return OutputType.parseAsync(output);
  }
});

const tool = defineTool({
  manifest: {
    pluginId: 'streamOutputTest',
    name: {
      en: 'Stream Output Test',
      'zh-CN': '流式输出测试'
    },
    description: {
      en: 'Send configurable streaming answer chunks to test whether streaming output works correctly.',
      'zh-CN': '发送可配置的流式回答分片，用于测试流式输出是否能正常进行。'
    },
    version: '0.1.0',
    versionDescription: {
      en: 'Initial version',
      'zh-CN': '初始版本'
    },
    tags: ['tools']
  },
  handler
});

export default tool;
