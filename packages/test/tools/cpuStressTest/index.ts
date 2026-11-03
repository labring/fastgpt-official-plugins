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
  durationMs: {
    type: z.number().optional(),
    title: { en: "Stress-test duration (ms)", "zh-CN": "压测时长（毫秒）" },
    description: {
      en: "How long to run the CPU stress test; range 10–30000 ms.",
      "zh-CN": "CPU 压力测试持续时间，范围为 10–30000 毫秒。",
    },
    isToolParam: true,
  },
  batchSize: {
    type: z.number().optional(),
    title: { en: "Batch size", "zh-CN": "批大小" },
    description: {
      en: "Number of synchronous computation iterations per batch; range 1000–5000000.",
      "zh-CN": "每批同步计算的迭代次数，范围为 1000–5000000。",
    },
    isToolParam: true,
  },
  yieldEveryMs: {
    type: z.number().optional(),
    title: { en: "Yield interval (ms)", "zh-CN": "让步间隔（毫秒）" },
    description: {
      en: "At 0, block the event loop completely; above 0, periodically yield to the event loop.",
      "zh-CN": "设为 0 时完全阻塞事件循环；大于 0 时定期让出事件循环。",
    },
    isToolParam: true,
  },
  seed: {
    type: z.number().optional(),
    title: { en: "Random seed", "zh-CN": "随机种子" },
    description: {
      en: "Integer seed used to produce a reproducible checksum.",
      "zh-CN": "用于生成可复现校验值的整数种子。",
    },
    isToolParam: true,
  },
});

const outputSchema = defineOutputSchema({
  elapsedMs: {
    type: z.number(),
    title: { en: "Actual elapsed time (ms)", "zh-CN": "实际耗时（毫秒）" },
    description: {
      en: "Actual time spent running the plugin.",
      "zh-CN": "插件实际运行耗时。",
    },
  },
  iterations: {
    type: z.number(),
    title: { en: "Iteration count", "zh-CN": "迭代次数" },
    description: {
      en: "Number of CPU computation iterations completed.",
      "zh-CN": "本次 CPU 计算执行的迭代次数。",
    },
  },
  checksum: {
    type: z.string(),
    title: { en: "Checksum", "zh-CN": "校验值" },
    description: {
      en: "Checksum generated from the computation result.",
      "zh-CN": "根据计算结果生成的校验值。",
    },
  },
  opsPerSecond: {
    type: z.number(),
    title: { en: "Iterations per second", "zh-CN": "每秒迭代数" },
    description: {
      en: "Throughput calculated from the actual elapsed time.",
      "zh-CN": "根据实际耗时计算的吞吐量。",
    },
  },
  yieldedCount: {
    type: z.number(),
    title: { en: "Yield count", "zh-CN": "让步次数" },
    description: {
      en: "Number of times the run voluntarily yielded to the event loop.",
      "zh-CN": "本次运行主动让出事件循环的次数。",
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
    description: {
      en: "Run a configurable CPU-bound workload to stress test the FastGPT plugin runtime.",
      "zh-CN": "运行可配置的 CPU 密集型计算，用于压测 FastGPT 插件运行环境。",
    },
    name: {
      en: "CPU Stress Test",
      "zh-CN": "CPU 压力测试",
    },
    pluginId: "cpuStressTest",
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
