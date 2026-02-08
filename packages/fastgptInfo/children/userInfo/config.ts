import {
  defineTool,
  ToolTagEnum,
  WorkflowIOValueTypeEnum,
} from "@fastgpt-plugin/helpers";

export default defineTool({
  tags: [ToolTagEnum.tools],
  name: {
    "zh-CN": "用户信息",
    en: "User Infomation",
  },
  description: {
    "zh-CN": "获取用户信息",
    en: "Get user information",
  },

  versionList: [
    {
      value: "0.0.1",
      description: "Default version",
      inputs: [],
      outputs: [
        {
          key: "username",
          valueType: WorkflowIOValueTypeEnum.string,
          label: "账号",
          description: "账号(username)",
        },
        {
          key: "memberName",
          valueType: WorkflowIOValueTypeEnum.string,
          label: "当前所属团队的成员名",
          description: "当前所属团队的成员名",
        },
        {
          key: "notificationAccount",
          valueType: WorkflowIOValueTypeEnum.string,
          label: "通知账号",
          description: "通知账号",
        },
        {
          key: "tags",
          valueType: WorkflowIOValueTypeEnum.arrayString,
          label: "用户标签列表",
          description: "用户标签列表",
        },
      ],
    },
  ],
});
