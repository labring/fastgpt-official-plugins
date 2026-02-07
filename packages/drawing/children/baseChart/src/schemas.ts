import json5 from "json5";
import { z } from "zod";

export const InputSchema = z
  .object({
    title: z.string().optional(),
    xAxis: z.union([z.string(), z.array(z.union([z.string(), z.number()]))]),
    yAxis: z.union([z.string(), z.array(z.union([z.string(), z.number()]))]),
    chartType: z.string(),
  })
  .transform((data) => {
    return {
      ...data,
      xAxis: (Array.isArray(data.xAxis)
        ? data.xAxis
        : (json5.parse(data.xAxis) as string[])
      ).map((item) => String(item)),
      yAxis: (Array.isArray(data.yAxis)
        ? data.yAxis
        : (json5.parse(data.yAxis) as string[])
      ).map((item) => String(item)),
    };
  });
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  "图表 url": z.string().optional(), // 兼容旧版
  chartUrl: z.string().optional(),
});
export type Output = z.infer<typeof OutputSchema>;
