import {
  defineTool,
  FlowNodeInputTypeEnum,
  FlowNodeOutputTypeEnum,
  WorkflowIOValueTypeEnum,
} from "@fastgpt-plugin/helpers";

export default defineTool({
  name: {
    "zh-CN": "star3",
    en: "star3",
  },
  description: {
    "zh-CN": "用以与libulibu星流3模型交互",
    en: "Used to interact with the libulibu Star3 model",
  },
  versionList: [
    {
      value: "0.1.1",
      description: "Default version",
      inputs: [
        {
          key: "prompt",
          label: "绘画提示词",
          toolDescription: "绘画提示词",
          renderTypeList: [
            FlowNodeInputTypeEnum.input,
            FlowNodeInputTypeEnum.reference,
          ],
          valueType: WorkflowIOValueTypeEnum.string,
        },
        {
          key: "size",
          label: "图像尺寸",
          description: "设置生成图像的分辨率",
          toolDescription:
            "设置生成图像的分辨率, 可选值: 512*1024, 768*512, 768*1024, 1024*576, 576*1024, 1024*1024",
          renderTypeList: [FlowNodeInputTypeEnum.select],
          valueType: WorkflowIOValueTypeEnum.string,
          defaultValue: "1024*1024",
          list: [
            { label: "512x1024", value: "512*1024" },
            { label: "768x512", value: "768*512" },
            { label: "768x1024", value: "768*1024" },
            { label: "1024x576", value: "1024*576" },
            { label: "576x1024", value: "576*1024" },
            { label: "1024x1024 (默认)", value: "1024*1024" },
          ],
        },
      ],
      outputs: [
        {
          valueType: WorkflowIOValueTypeEnum.string,
          key: "link",
          label: "图片链接",
          description: "绘画结果图片链接",
        },
        {
          type: FlowNodeOutputTypeEnum.error,
          valueType: WorkflowIOValueTypeEnum.string,
          key: "error",
          label: "错误消息",
        },
      ],
    },
  ],
});
