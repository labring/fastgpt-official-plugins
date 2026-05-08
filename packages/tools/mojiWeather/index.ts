import { createToolHandler, defineToolSet } from '@fastgpt-plugin/sdk-factory';
import z from 'zod';
import { InputType as toolInputType, OutputType as toolOutputType, tool as toolTool } from './children/tool';

const secretSchema = z.object({
  "apiKey": z.string().meta({
    title: "墨迹天气API密钥",
    description: "墨迹天气API密钥，用于访问天气服务"
  })
});

const toolSecretSchema = z.object({});
const toolInputSchema = z.object({
  "province": z.string().optional().meta({
    title: "省份",
    description: "省份名称，如：浙江省",
    toolDescription: "省份名称"
  }),
  "city": z.string().optional().meta({
    title: "城市",
    description: "城市名称，如：杭州市",
    toolDescription: "城市名称"
  }),
  "towns": z.string().optional().meta({
    title: "区县",
    description: "区县名称，如：余杭区",
    toolDescription: "区县名称"
  }),
  "start_time": z.string().meta({
    title: "开始时间",
    description: "开始日期，格式：YYYY-MM-DD，如：2024-07-18",
    toolDescription: "开始日期"
  }),
  "end_time": z.string().meta({
    title: "结束时间",
    description: "结束日期，格式：YYYY-MM-DD，如：2024-07-20",
    toolDescription: "结束日期"
  })
});
const toolOutputSchema = z.object({
  "data": z.array(z.record(z.string(), z.unknown())).meta({
    title: "天气数据",
    description: "指定时间范围内的天气数据数组"
  })
});

const toolHandler = createToolHandler({
  inputSchema: toolInputSchema,
  outputSchema: toolOutputSchema,
  secretSchema: toolSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await toolInputType.parseAsync(input);
    const output = await toolTool(parsedInput, ctx);
    return toolOutputType.parseAsync(output);
  }
});

const toolSet = defineToolSet({
  manifest: {
  "pluginId": "mojiWeather",
  "name": {
    "en": "Moji Weather",
    "zh-CN": "墨迹天气"
  },
  "description": {
    "en": "Moji Weather toolset providing weather query functionality",
    "zh-CN": "墨迹天气工具集，提供天气查询相关功能"
  },
  "version": "0.0.1",
  "versionDescription": {
    "en": "Initial version",
    "zh-CN": "Initial version"
  },
  "toolDescription": "Moji Weather toolset providing weather query functionality",
  "tags": [
    "tools"
  ]
},
  secretSchema,
  children: [
    {
      id: "tool",
      name: {
  "en": "Daily Weather",
  "zh-CN": "每日天气"
},
      description: {
  "en": "Get daily weather information for specified city",
  "zh-CN": "获取指定城市的每日天气信息"
},
      toolDescription: "获取指定城市的每日天气信息，包括温度、湿度、风力等详细数据",
      handler: toolHandler
    }
  ]
});

export default toolSet;
