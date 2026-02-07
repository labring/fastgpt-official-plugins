import {
  defineTool,
  FlowNodeInputTypeEnum,
  WorkflowIOValueTypeEnum,
} from "@fastgpt-plugin/helpers";

const v1 = {
  inputs: [
    {
      key: "biTableId",
      label: "多维表格 ID",
      description: "多维表格应用的唯一标识",
      required: true,
      valueType: WorkflowIOValueTypeEnum.string,
      renderTypeList: [
        FlowNodeInputTypeEnum.input,
        FlowNodeInputTypeEnum.reference,
      ],
      toolDescription: "The BiTable ID (app token) of the Bitable application",
      placeholder: "bascxxxxxx",
    },
    {
      key: "pageSize",
      label: "分页大小",
      description: "每页返回的数据表数量(1-100,默认20)",
      required: false,
      valueType: WorkflowIOValueTypeEnum.number,
      renderTypeList: [
        FlowNodeInputTypeEnum.numberInput,
        FlowNodeInputTypeEnum.reference,
      ],
      toolDescription: "Number of tables per page (1-100, default 20)",
      defaultValue: 20,
      max: 100,
      min: 1,
    },
    {
      key: "pageToken",
      label: "分页标记",
      description: "用于获取下一页数据的标记",
      required: false,
      valueType: WorkflowIOValueTypeEnum.string,
      renderTypeList: [
        FlowNodeInputTypeEnum.input,
        FlowNodeInputTypeEnum.reference,
      ],
      toolDescription: "Token for fetching the next page of results",
    },
  ],
  outputs: [
    {
      key: "tables",
      label: "数据表列表",
      description: "数据表数组,每个包含tableId和name",
      valueType: WorkflowIOValueTypeEnum.arrayObject,
    },
    {
      key: "hasMore",
      label: "是否有更多数据",
      description: "是否还有下一页数据",
      valueType: WorkflowIOValueTypeEnum.boolean,
    },
    {
      key: "pageToken",
      label: "下一页标记",
      description: "获取下一页数据的标记",
      valueType: WorkflowIOValueTypeEnum.string,
    },
    {
      key: "total",
      label: "总数量",
      description: "数据表总数量",
      valueType: WorkflowIOValueTypeEnum.number,
    },
  ],
};

export default defineTool({
  name: {
    "zh-CN": "获取数据表列表",
    en: "List Data Tables",
  },
  description: {
    "zh-CN": "获取飞书多维表格应用中的所有数据表列表",
    en: "Get a list of all data tables in Feishu Bitable app",
  },
  toolDescription:
    "List all data tables in a Feishu Bitable application with pagination support.",

  versionList: [
    { value: "0.1.1", description: "update docs", ...v1 },
    {
      value: "0.1.0",
      description: "Initial version",
      ...v1,
    },
  ],
});
