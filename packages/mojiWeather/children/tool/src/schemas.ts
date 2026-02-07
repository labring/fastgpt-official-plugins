import { z } from "zod";
import { WeatherItemSchema } from "../../../types";

export const InputSchema = z
  .object({
    apiKey: z.string().min(1, "API密钥不能为空").describe("墨迹天气API密钥"),
    city: z.string().optional(),
    province: z.string().optional(),
    towns: z.string().optional(),
    start_time: z.string(),
    end_time: z.string(),
  })
  .refine(
    (data) => {
      return Boolean(
        (data.city && data.city.trim()) ||
          (data.province && data.province.trim()) ||
          (data.towns && data.towns.trim()),
      );
    },
    { message: "省份、城市、区县至少填写一个" },
  );
export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  data: z.array(WeatherItemSchema),
});
export type Output = z.infer<typeof OutputSchema>;
