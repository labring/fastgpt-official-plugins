import {
  defineTool,
  ToolTagEnum,
  WorkflowIOValueTypeEnum,
} from "@fastgpt-plugin/helpers";

export default defineTool({
  tags: [ToolTagEnum.tools],
  name: {
    "zh-CN": "wecom-corp-id",
    en: "wecom-corp-id",
  },
  description: {
    "zh-CN": "This is a FastGPT plugin",
    en: "This is a FastGPT plugin",
  },
  icon: "core/workflow/template/wecom-corp-id",
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
