import { createToolHandler, defineTool } from '@fastgpt-plugin/sdk-factory';
import { InputType, OutputType, tool as toolCb } from './src';
import z from 'zod';

const secretSchema = z.object({});

const inputSchema = z.object({
  durationMs: z.number().optional().meta({
    title: '压测时长(毫秒)',
    description: 'CPU 压测持续时间，范围 10-30000'
  }),
  batchSize: z.number().optional().meta({
    title: '批大小',
    description: '每批同步计算的迭代次数，范围 1000-5000000'
  }),
  yieldEveryMs: z.number().optional().meta({
    title: '让步间隔(毫秒)',
    description: '设为 0 时完全阻塞 event loop；大于 0 时定期让出 event loop'
  }),
  seed: z.number().optional().meta({
    title: '随机种子',
    description: '用于生成可复现 checksum 的整数种子'
  })
});

const outputSchema = z.object({
  elapsedMs: z.number().meta({
    title: '实际耗时(毫秒)',
    description: '插件运行的实际耗时'
  }),
  iterations: z.number().meta({
    title: '迭代次数',
    description: '本次 CPU 计算执行的迭代次数'
  }),
  checksum: z.string().meta({
    title: '校验值',
    description: '根据计算结果生成的校验值'
  }),
  opsPerSecond: z.number().meta({
    title: '每秒迭代数',
    description: '按实际耗时计算的吞吐'
  }),
  yieldedCount: z.number().meta({
    title: '让步次数',
    description: '本次运行主动让出 event loop 的次数'
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
    description: {
      en: 'Run a configurable CPU-bound workload to stress test the FastGPT plugin runtime.',
      'zh-CN': '运行可配置的 CPU 密集型计算，用于压测 FastGPT 插件运行环境。'
    },
    name: {
      en: 'CPU Stress Test',
      'zh-CN': 'CPU 压力测试'
    },
    pluginId: 'cpuStressTest',
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
