import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import * as echarts from "echarts";
import type { Input, Output } from "./schemas";

type SeriesData = {
  name: string;
  type: "bar" | "line" | "pie"; // 只允许这三种类型
  data: number[] | { value: number; name: string }[]; // 根据图表类型的数据结构
};

type Option = {
  backgroundColor: string;
  title: { text: string };
  tooltip: object;
  xAxis: { data: string[] };
  yAxis: object;
  series: SeriesData[]; // 使用定义的类型
};

const generateChart = async (
  title = "",
  xAxis: string[],
  yAxis: string[],
  chartType: string,
  _ctx: ToolContextType,
) => {
  const chart = echarts.init(undefined, undefined, {
    renderer: "svg", // 必须使用 SVG 模式
    ssr: true, // 开启 SSR
    width: 400, // 需要指明高和宽
    height: 300,
  });

  const option: Option = {
    backgroundColor: "#f5f5f5",
    title: { text: title },
    tooltip: {},
    xAxis: { data: xAxis },
    yAxis: {},
    series: [], // 初始化为空数组
  };

  // 根据 chartType 生成不同的图表
  switch (chartType) {
    case "柱状图":
      option.series.push({
        name: "Sample",
        type: "bar",
        data: yAxis.map(Number),
      });
      break;
    case "折线图":
      option.series.push({
        name: "Sample",
        type: "line",
        data: yAxis.map(Number),
      });
      break;
    case "饼图":
      option.series.push({
        name: "Sample",
        type: "pie",
        data: yAxis.map((value, index) => ({
          value: Number(value),
          name: xAxis[index] || `Item ${index + 1}`, // 使用 xAxis 作为饼图的名称，如果不存在则使用默认名称
        })),
      });
      break;
    default:
      console.error("不支持的图表类型:", chartType);
      return "";
  }

  chart.setOption(option);
  const svgContent = chart.renderToSVGString();

  const base64 = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

  const file = await _ctx.emitter.uploadFile({
    base64,
    defaultFilename: `chart.svg`,
  });

  return file.accessUrl;
};

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { title, xAxis, yAxis, chartType } = input;
  const base64 = await generateChart(title, xAxis, yAxis, chartType, _ctx);
  return {
    "图表 url": base64, // 兼容旧版
    chartUrl: base64,
  };
}
