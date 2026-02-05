import {
  defineTool,
  ToolTagEnum,
  WorkflowIOValueTypeEnum,
} from "@fastgpt-plugin/helpers";

export default defineTool({
  tags: [ToolTagEnum.enum.tools],
  name: {
    "zh-CN": "get-time",
    en: "get-time",
  },
  description: {
    "zh-CN": "This is a FastGPT plugin",
    en: "This is a FastGPT plugin",
  },
  icon: "core/workflow/template/get-time",
  versionList: [
    {
      value: "0.0.1",
      description: "Initial version",
      inputs: [],
      outputs: [
        {
          key: "message",
          valueType: WorkflowIOValueTypeEnum.enum.string,
          label: "Message",
          description: "Tool output message",
        },
      ],
    },
  ],
});
