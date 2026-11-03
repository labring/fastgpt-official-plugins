import {
  createToolHandler,
  defineInputSchema,
  defineOutputSchema,
  defineToolSet,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import {
  InputType as toolInputType,
  OutputType as toolOutputType,
  tool as toolTool,
} from "./children/tool";

const secretSchema = z.object({
  apiKey: z.string().meta({
    title: "Moji Weather API Key",
    description: "API key used to access the Moji Weather service.",
    "x-i18n": {
      title: { en: "Moji Weather API Key", "zh-CN": "墨迹天气 API 密钥" },
      description: {
        en: "API key used to access the Moji Weather service.",
        "zh-CN": "用于访问墨迹天气服务的 API 密钥。",
      },
    },
    isSecret: true,
  }),
});

const toolSecretSchema = z.object({});
const toolInputSchema = defineInputSchema({
  province: {
    type: z.string().optional(),
    title: { en: "Province", "zh-CN": "省份" },
    description: {
      en: "Province name, for example Zhejiang Province.",
      "zh-CN": "省份名称，例如浙江省。",
    },
    isToolParam: true,
  },
  city: {
    type: z.string().optional(),
    title: { en: "City", "zh-CN": "城市" },
    description: {
      en: "City name, for example Hangzhou.",
      "zh-CN": "城市名称，例如杭州市。",
    },
    isToolParam: true,
  },
  towns: {
    type: z.string().optional(),
    title: { en: "District or County", "zh-CN": "区县" },
    description: {
      en: "District or county name, for example Yuhang District.",
      "zh-CN": "区县名称，例如余杭区。",
    },
    isToolParam: true,
  },
  start_time: {
    type: z.string(),
    title: { en: "Start Date", "zh-CN": "开始日期" },
    description: {
      en: "Start date in YYYY-MM-DD format, for example 2024-07-18.",
      "zh-CN": "开始日期，格式为 YYYY-MM-DD，例如 2024-07-18。",
    },
    isToolParam: true,
  },
  end_time: {
    type: z.string(),
    title: { en: "End Date", "zh-CN": "结束日期" },
    description: {
      en: "End date in YYYY-MM-DD format, for example 2024-07-20.",
      "zh-CN": "结束日期，格式为 YYYY-MM-DD，例如 2024-07-20。",
    },
    isToolParam: true,
  },
});
const weatherItemOutputSchema = defineOutputSchema({
  conditionDay: {
    type: z.string(),
    title: { en: "Day condition", "zh-CN": "白天天气状况" },
    description: {
      en: "Weather condition during the day.",
      "zh-CN": "白天的天气状况。",
    },
  },
  conditionIdDay: {
    type: z.string(),
    title: { en: "Day condition code", "zh-CN": "白天天气代码" },
    description: {
      en: "Code identifying the daytime weather condition.",
      "zh-CN": "标识白天天气状况的代码。",
    },
  },
  conditionIdNight: {
    type: z.string(),
    title: { en: "Night condition code", "zh-CN": "夜间天气代码" },
    description: {
      en: "Code identifying the nighttime weather condition.",
      "zh-CN": "标识夜间天气状况的代码。",
    },
  },
  conditionNight: {
    type: z.string(),
    title: { en: "Night condition", "zh-CN": "夜间天气状况" },
    description: {
      en: "Weather condition at night.",
      "zh-CN": "夜间的天气状况。",
    },
  },
  humidity: {
    type: z.string(),
    title: { en: "Humidity", "zh-CN": "湿度" },
    description: { en: "Forecast humidity.", "zh-CN": "预报湿度。" },
  },
  moonphase: {
    type: z.string(),
    title: { en: "Moon phase", "zh-CN": "月相" },
    description: {
      en: "Moon phase for the forecast date.",
      "zh-CN": "预报日期对应的月相。",
    },
  },
  moonrise: {
    type: z.string(),
    title: { en: "Moonrise", "zh-CN": "月出时间" },
    description: { en: "Moonrise time.", "zh-CN": "月出时间。" },
  },
  moonset: {
    type: z.string(),
    title: { en: "Moonset", "zh-CN": "月落时间" },
    description: { en: "Moonset time.", "zh-CN": "月落时间。" },
  },
  pop: {
    type: z.string(),
    title: { en: "Precipitation probability", "zh-CN": "降水概率" },
    description: {
      en: "Probability of precipitation.",
      "zh-CN": "降水发生的概率。",
    },
  },
  predictDate: {
    type: z.string(),
    title: { en: "Forecast date", "zh-CN": "预报日期" },
    description: {
      en: "Date covered by this forecast.",
      "zh-CN": "本条预报对应的日期。",
    },
  },
  qpf: {
    type: z.string(),
    title: { en: "Precipitation amount", "zh-CN": "降水量" },
    description: {
      en: "Quantitative precipitation forecast.",
      "zh-CN": "定量降水预报。",
    },
  },
  sunrise: {
    type: z.string(),
    title: { en: "Sunrise", "zh-CN": "日出时间" },
    description: { en: "Sunrise time.", "zh-CN": "日出时间。" },
  },
  sunset: {
    type: z.string(),
    title: { en: "Sunset", "zh-CN": "日落时间" },
    description: { en: "Sunset time.", "zh-CN": "日落时间。" },
  },
  tempDay: {
    type: z.string(),
    title: { en: "Day temperature", "zh-CN": "白天温度" },
    description: {
      en: "Forecast daytime temperature.",
      "zh-CN": "预报白天温度。",
    },
  },
  tempNight: {
    type: z.string(),
    title: { en: "Night temperature", "zh-CN": "夜间温度" },
    description: {
      en: "Forecast nighttime temperature.",
      "zh-CN": "预报夜间温度。",
    },
  },
  updatetime: {
    type: z.string(),
    title: { en: "Updated at", "zh-CN": "更新时间" },
    description: {
      en: "Time when the forecast data was updated.",
      "zh-CN": "天气预报数据的更新时间。",
    },
  },
  uvi: {
    type: z.string(),
    title: { en: "UV index", "zh-CN": "紫外线指数" },
    description: {
      en: "Forecast ultraviolet index.",
      "zh-CN": "预报紫外线指数。",
    },
  },
  windDegreesDay: {
    type: z.string(),
    title: { en: "Day wind direction degrees", "zh-CN": "白天风向角度" },
    description: {
      en: "Daytime wind direction in degrees.",
      "zh-CN": "白天风向角度。",
    },
  },
  windDegreesNight: {
    type: z.string(),
    title: { en: "Night wind direction degrees", "zh-CN": "夜间风向角度" },
    description: {
      en: "Nighttime wind direction in degrees.",
      "zh-CN": "夜间风向角度。",
    },
  },
  windDirDay: {
    type: z.string(),
    title: { en: "Day wind direction", "zh-CN": "白天风向" },
    description: { en: "Daytime wind direction.", "zh-CN": "白天风向。" },
  },
  windDirNight: {
    type: z.string(),
    title: { en: "Night wind direction", "zh-CN": "夜间风向" },
    description: { en: "Nighttime wind direction.", "zh-CN": "夜间风向。" },
  },
  windLevelDay: {
    type: z.string(),
    title: { en: "Day wind level", "zh-CN": "白天风力等级" },
    description: { en: "Daytime wind level.", "zh-CN": "白天风力等级。" },
  },
  windLevelNight: {
    type: z.string(),
    title: { en: "Night wind level", "zh-CN": "夜间风力等级" },
    description: { en: "Nighttime wind level.", "zh-CN": "夜间风力等级。" },
  },
  windSpeedDay: {
    type: z.string(),
    title: { en: "Day wind speed", "zh-CN": "白天风速" },
    description: { en: "Daytime wind speed.", "zh-CN": "白天风速。" },
  },
  windSpeedNight: {
    type: z.string(),
    title: { en: "Night wind speed", "zh-CN": "夜间风速" },
    description: { en: "Nighttime wind speed.", "zh-CN": "夜间风速。" },
  },
});
const toolOutputSchema = defineOutputSchema({
  data: {
    type: z.array(weatherItemOutputSchema),
    title: { en: "Weather Data", "zh-CN": "天气数据" },
    description: {
      en: "Weather data for the requested date range.",
      "zh-CN": "指定日期范围内的天气数据。",
    },
  },
});
const toolHandler = createToolHandler({
  inputSchema: toolInputSchema,
  outputSchema: toolOutputSchema,
  secretSchema: toolSecretSchema,
  handler: async (input, ctx) => {
    const parsedInput = await toolInputType.parseAsync({
      ...input,
      ...ctx.secrets,
    });
    const output = await toolTool(parsedInput);
    return toolOutputType.parseAsync(output);
  },
});

const toolSet = defineToolSet({
  manifest: {
    pluginId: "mojiWeather",
    name: {
      en: "Moji Weather",
      "zh-CN": "墨迹天气",
    },
    description: {
      en: "Moji Weather toolset providing weather query functionality for city and date-range weather forecasts.",
      "zh-CN": "墨迹天气工具集，提供按城市和日期范围查询天气预报的功能。",
    },
    version: "0.0.1",
    versionDescription: {
      en: "Initial release",
      "zh-CN": "初始版本",
    },
    tags: ["tools"],
  },
  secretSchema,
  children: [
    {
      id: "tool",
      name: {
        en: "Daily Weather",
        "zh-CN": "每日天气",
      },
      description: {
        en: "Get daily weather information for a specified city, including temperature, humidity, wind, and other forecast details.",
        "zh-CN": "获取指定城市的每日天气信息，包括温度、湿度、风力等预报详情。",
      },
      handler: toolHandler,
    },
  ],
});

export default toolSet;
