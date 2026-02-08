import {
  defineTool,
  ToolTagEnum,
  WorkflowIOValueTypeEnum,
} from "@fastgpt-plugin/helpers";

export default defineTool({
  tags: [ToolTagEnum.tools],
  name: {
    "zh-CN": "团队信息",
    en: "Team Infomation",
  },
  description: {
    "zh-CN": "获取团队信息",
    en: "Get Team information",
  },

  versionList: [
    {
      value: "0.0.1",
      description: "Default version",
      inputs: [],
      outputs: [
        {
          key: "teamName",
          valueType: WorkflowIOValueTypeEnum.string,
          label: "团队名称",
          description: "团队名称",
        },
        {
          key: "teamMembers",
          valueType: WorkflowIOValueTypeEnum.arrayObject,
          label: "团队成员列表",
          description: "团队成员列表",
        },
      ],
    },
  ],
});
