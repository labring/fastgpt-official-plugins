import {
  defineTool,
  ToolTagEnum,
  WorkflowIOValueTypeEnum,
} from "@fastgpt-plugin/helpers";

export default defineTool({
  tags: [ToolTagEnum.tools],
  name: {
    "zh-CN": "ding-talk-webhook",
    en: "ding-talk-webhook",
  },
  description: {
    "zh-CN": "This is a FastGPT plugin",
    en: "This is a FastGPT plugin",
  },
  icon: "core/workflow/template/ding-talk-webhook",
  versionList: [
    {
      value: "0.0.1",
      description: "Initial version",
      inputs: [],
      outputs: [
        {
          key: "time",
          valueType: WorkflowIOValueTypeEnum.string,
          label: "时间",
          description: "当前时间",
        },
      ],
    },
  ],
});
