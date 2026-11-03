import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as baseChartInputType,
  OutputType as baseChartOutputType,
  tool as baseChartTool,
} from "./children/baseChart";

const secretSchema = z.object({});
const baseChartSecretSchema = z.object({});
const baseChartInputSchema = defineInputSchema({
  title: {
    type: z.string().optional(),
    title: { en: "Chart title", "zh-CN": "图表标题" },
    description: {
      en: "Optional title for the BI chart.",
      "zh-CN": "BI 图表的可选标题。",
    },
    isToolParam: true,
  },
  xAxis: {
    type: z.array(z.string()),
    title: { en: "X-axis data", "zh-CN": "X 轴数据" },
    description: {
      en: 'X-axis values, for example ["A", "B", "C"].',
      "zh-CN": 'X 轴数据，例如：["A", "B", "C"]。',
    },
    isToolParam: true,
  },
  yAxis: {
    type: z.array(z.string()),
    title: { en: "Y-axis data", "zh-CN": "Y 轴数据" },
    description: {
      en: "Y-axis values, for example [1, 2, 3].",
      "zh-CN": "Y 轴数据，例如：[1, 2, 3]。",
    },
    isToolParam: true,
  },
  chartType: {
    type: z.enum(["折线图", "柱状图", "饼图"]),
    title: { en: "Chart type", "zh-CN": "图表类型" },
    description: {
      en: "Chart type: bar, line, or pie chart.",
      "zh-CN": "图表类型：柱状图、折线图或饼图。",
    },
    isToolParam: true,
  },
});
const baseChartOutputSchema = defineOutputSchema({
  chartUrl: {
    type: z.string().optional(),
    title: { en: "Chart URL", "zh-CN": "图表链接" },
    description: {
      en: "Chart image URL; it can be displayed using Markdown, for example ![image](url).",
      "zh-CN": "图表图片链接，可使用 Markdown 展示，例如：![图片](url)。",
    },
  },
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
    permission: ["file-upload:allow"],
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
      "zh-CN": "初始版本",
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
