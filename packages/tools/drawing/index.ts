import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as baseChartInputType,
  OutputType as baseChartOutputType,
  tool as baseChartTool,
} from "./children/baseChart";

const secretSchema = z.object({});
const baseChartSecretSchema = z.object({});
const baseChartInputSchema = z.object({
  "title": z.string().optional().meta({
    title: "title",
    description: "BI图表的标题",
    toolDescription: "BI图表的标题"
  }),
  "xAxis": z.array(z.string()).meta({
    title: "xAxis",
    description: "x轴数据，例如：[\"A\", \"B\", \"C\"]",
    toolDescription: "x轴数据，例如：[\"A\", \"B\", \"C\"]"
  }),
  "yAxis": z.array(z.string()).meta({
    title: "yAxis",
    description: "y轴数据，例如：[1,2,3]",
    toolDescription: "y轴数据，例如：[1,2,3]"
  }),
  "chartType": z.enum(["折线图","柱状图","饼图"]).meta({
    title: "chartType",
    description: "图表类型：柱状图，折线图，饼图",
    toolDescription: "图表类型：柱状图，折线图，饼图"
  })
});
const baseChartOutputSchema = z.object({
  "chartUrl": z.string().optional().meta({
    title: "图表 url",
    description: "可用使用markdown格式展示图片，如：![图片](url)"
  })
});
const baseChartHandler = createToolHandler({
  inputSchema: baseChartInputSchema,
  outputSchema: baseChartOutputSchema,
  secretSchema: baseChartSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await baseChartInputType.parseAsync(input);
    const output = await baseChartTool(parsedInput, ctx);
    return baseChartOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "drawing",
    name: {
      en: "BI Charts",
      "zh-CN": "BI图表功能",
    },
    description: {
      en: "BI Charts, can generate some common charts, such as pie charts, bar charts, line charts, etc.",
      "zh-CN": "BI图表功能，可以生成一些常用的图表，如饼图，柱状图，折线图等",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial version",
      "zh-CN": "Initial version",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "baseChart",
      name: {
        en: "baseChart",
        "zh-CN": "基础图表",
      },
      description: {
        en: "Generate charts based on data, and generate charts such as bar charts, line charts, pie charts based on chartType",
        "zh-CN": "根据数据生成图表，可根据chartType生成柱状图，折线图，饼图",
      },
      handler: baseChartHandler,
    },
  ],
});

export default toolSet;
