import { defineTool } from '@tool/type';
import { FlowNodeInputTypeEnum, WorkflowIOValueTypeEnum } from '@tool/type/fastgpt';
import { ToolTagEnum } from '@tool/type/tags';

export default defineTool({
  tags: [ToolTagEnum.enum.tools],
  name: {
    'zh-CN': 'CPU 压力测试',
    en: 'CPU Stress Test'
  },
  description: {
    'zh-CN': '运行可配置的 CPU 密集型计算，用于压测 FastGPT 插件运行环境。',
    en: 'Run a configurable CPU-bound workload to stress test the FastGPT plugin runtime.'
  },
  versionList: [
    {
      value: '0.1.0',
      description: 'Initial version',
      inputs: [
        {
          key: 'durationMs',
          label: '压测时长(毫秒)',
          renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
          valueType: WorkflowIOValueTypeEnum.number,
          defaultValue: 1000
        },
        {
          key: 'batchSize',
          label: '批大小',
          renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
          valueType: WorkflowIOValueTypeEnum.number,
          defaultValue: 100000
        },
        {
          key: 'yieldEveryMs',
          label: '让步间隔(毫秒)',
          renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
          valueType: WorkflowIOValueTypeEnum.number,
          defaultValue: 0
        },
        {
          key: 'seed',
          label: '随机种子',
          renderTypeList: [FlowNodeInputTypeEnum.numberInput, FlowNodeInputTypeEnum.reference],
          valueType: WorkflowIOValueTypeEnum.number,
          defaultValue: 1
        }
      ],
      outputs: [
        {
          key: 'elapsedMs',
          label: '实际耗时(毫秒)',
          valueType: WorkflowIOValueTypeEnum.number
        },
        {
          key: 'iterations',
          label: '迭代次数',
          valueType: WorkflowIOValueTypeEnum.number
        },
        {
          key: 'checksum',
          label: '校验值',
          valueType: WorkflowIOValueTypeEnum.string
        },
        {
          key: 'opsPerSecond',
          label: '每秒迭代数',
          valueType: WorkflowIOValueTypeEnum.number
        },
        {
          key: 'yieldedCount',
          label: '让步次数',
          valueType: WorkflowIOValueTypeEnum.number
        }
      ]
    }
  ]
});
