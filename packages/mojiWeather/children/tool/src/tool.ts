import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { getWeatherIn15Days, searchCity } from "../../../utils";
import type { Input, Output } from "./schemas";

export async function handler(
  { apiKey, city, end_time, province, start_time, towns }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const cityId = searchCity({ city, province, towns });
  if (!cityId) {
    return Promise.reject("Can not find city");
  }

  try {
    const weatherIn15Days = await getWeatherIn15Days(cityId, apiKey);
    const forecastsInRange = weatherIn15Days.filter((item) => {
      const predictDate = item.predictDate;
      return predictDate >= start_time && predictDate <= end_time;
    });
    return {
      data: forecastsInRange,
    };
  } catch {
    return Promise.reject("No weather data available");
  }
}
