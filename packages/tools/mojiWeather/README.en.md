# Moji Weather Toolset (Moji Weather)

The Moji Weather Toolset is a high-precision meteorological data service plugin tailored for FastGPT. Powered by professional weather forecasting services from Moji Weather, it supports fine-grained regional weather queries across multi-level administrative divisions in mainland China (provinces, cities, districts, and counties), as well as flexible multi-day date-range weather forecast retrieval.

This plugin delivers out-of-the-box weather intelligence for FastGPT agent workflows. By intelligently fuzzy matching city and district codes, it provides comprehensive meteorological metrics in a single query—including daytime/nighttime weather conditions, maximum/minimum temperatures, relative humidity, wind direction and force, precipitation probability, quantitative precipitation forecasts, UV index, sunrise/sunset, and moon phases. This robust data foundation supports intelligent travel planning, smart home automations, outdoor event preparation, and everyday life assistants.

---

## Typical Application Scenarios

- **Smart Travel and Tourism Itinerary Assistant**: Based on user travel plans (e.g., "Planning a 3-day trip to West Lake in Hangzhou over the holiday"), the LLM automatically extracts origin/destination cities and date ranges, queries future weather conditions, and dynamically adjusts indoor vs. outdoor activity itineraries to suit the forecast.
- **Daily Morning Weather Broadcast and Life Advisor**: Integrated with scheduled triggers and enterprise messaging bots (DingTalk, Feishu, WeCom), the workflow fetches target district weather every morning. The LLM translates UV index (`uvi`), diurnal temperature range, and precipitation probability (`pop`) into friendly, personalized clothing and umbrella reminders.
- **Outdoor Construction and Event Weather Warning**: In construction projects, outdoor athletic competitions, music festivals, or wedding planning, the system tracks wind levels (`windLevelDay`), precipitation amounts (`qpf`), and thunderstorm alerts. When critical thresholds are exceeded, automated risk mitigation or suspension workflows are triggered.
- **Smart Home and Climate/Drying Automation**: Serves as a forward-looking environmental sensor for smart home hubs. Based on forecasted relative humidity (`humidity`) and precipitation probability over the next 24–48 hours, the system automates indoor dehumidification, climate control adjustments, and smart clothes rack retraction.

---

## Secret Configuration

To use this plugin, you must configure an API key (`apiKey`) for the Moji Weather commercial data service.

### How to Obtain an API Key

Under the hood, this plugin queries Moji Weather's 15-day national weather forecast API via the HTTP header `Authorization: APPCODE <apiKey>`.

1. Visit the **[Alibaba Cloud Marketplace](https://market.aliyun.com/)** or the **[Moji Weather Open Platform](https://developer.moji.com/)**.
2. Search for and select **"Moji Weather 15-day National Weather Forecast API"** (墨迹天气 全国天气预报 15 天查询) or an equivalent weather API service.
3. Register or log in to your account and subscribe to the service (a free trial tier or quota package is typically available).
4. Navigate to the Alibaba Cloud Console -> "Marketplace" -> "Purchased Services", find your subscription, and copy the **AppCode**.
5. Fill this AppCode into the `apiKey` setting in FastGPT.

### Configuration in FastGPT

In the FastGPT Toolset Secrets settings or node configuration panel, enter the following field:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `apiKey` | String (`string`) | Yes | Moji Weather API key (Alibaba Cloud Marketplace AppCode). Used for Bearer/AppCode authorization in upstream request headers. |

---

## Sub-Tools List

This tool suite provides the following sub-tool:

- **`tool` (Daily Weather)**: Queries detailed daily weather forecast data for a specified province, city, and district/county across a defined date range.

---

## Sub-Tool: Daily Weather (`tool`)

### Input Parameters

| Parameter | Type | Required | Default | Description and Examples |
| --- | --- | --- | --- | --- |
| `province` | String (`string`) | Conditional | None | **Province name**. E.g., `"Zhejiang Province"`, `"Beijing"`, `"Guangdong"`. Automatically normalizes suffixes like "省", "自治区", or "特别行政区" for fuzzy matching. |
| `city` | String (`string`) | Conditional | None | **City name**. E.g., `"Hangzhou"`, `"Beijing"`, `"Guangzhou"`. Automatically strips suffixes like "市", "地区", "自治州", or "盟". |
| `towns` | String (`string`) | Conditional | None | **District or county name**. E.g., `"Yuhang District"`, `"Chaoyang District"`, `"Tianhe District"`. Strips suffixes like "区", "县", "旗", or "市辖区". |
| `start_time` | String (`string`) | Yes | None | **Forecast query start date**. Format must strictly follow `YYYY-MM-DD`, e.g., `"2025-05-01"`. Results will include days greater than or equal to this date. |
| `end_time` | String (`string`) | Yes | None | **Forecast query end date**. Format must strictly follow `YYYY-MM-DD`, e.g., `"2025-05-03"`. Results will include days less than or equal to this date. |

> **Notes**:
> - At least one of `province`, `city`, or `towns` **must be provided**.
> - It is recommended to provide both `city` and `towns` (or `province` and `city`) to prevent ambiguity between identically named districts (e.g., "Chaoyang District" in Beijing vs. "Chaoyang District" in Changchun).

### Output Results

Upon successful execution, the tool returns an object containing an array of weather forecast entries: `{ "data": [ ... ] }`. Each item in the array represents daily meteorological data:

| Field | Type | Meaning | Description and Examples |
| --- | --- | --- | --- |
| `predictDate` | String (`string`) | Forecast Date | Target forecast date in `YYYY-MM-DD` format, e.g., `"2025-05-01"`. |
| `conditionDay` | String (`string`) | Daytime Weather | Daytime weather condition description, e.g., `"Sunny"`, `"Cloudy"`, `"Thunderstorm"`, `"Moderate Rain"`, `"Overcast"`. |
| `conditionNight` | String (`string`) | Nighttime Weather | Nighttime weather condition description, e.g., `"Cloudy"`, `"Overcast"`, `"Showers"`, `"Clear"`. |
| `conditionIdDay` | String (`string`) | Daytime Condition Code | Weather condition numeric code during the day, e.g., `"0"` (Sunny), `"1"` (Cloudy), `"2"` (Overcast). |
| `conditionIdNight` | String (`string`) | Nighttime Condition Code | Weather condition numeric code at night. |
| `tempDay` | String (`string`) | Daytime Max Temperature | Forecast daytime peak temperature (in °C), e.g., `"26"`. |
| `tempNight` | String (`string`) | Nighttime Min Temperature | Forecast nighttime minimum temperature (in °C), e.g., `"16"`. |
| `humidity` | String (`string`) | Relative Humidity | Forecast average relative humidity percentage (%), e.g., `"65"`. |
| `pop` | String (`string`) | Precipitation Probability | Probability of precipitation (%), e.g., `"20"` indicates a 20% chance of rain. |
| `qpf` | String (`string`) | Quantitative Precipitation | Forecast precipitation amount (in mm), e.g., `"0.0"` or `"15.2"`. |
| `uvi` | String (`string`) | UV Index | Ultraviolet radiation index (0–15), e.g., `"7"` (High). |
| `windDirDay` | String (`string`) | Daytime Wind Direction | Dominant wind direction during the day, e.g., `"Southeast"`, `"Breeze"`, `"North"`. |
| `windDirNight` | String (`string`) | Nighttime Wind Direction | Dominant wind direction at night, e.g., `"South"`, `"Variable"`. |
| `windLevelDay` | String (`string`) | Daytime Wind Force Level | Wind force scale level during the day, e.g., `"3"` (Beaufort scale 3). |
| `windLevelNight` | String (`string`) | Nighttime Wind Force Level | Wind force scale level at night, e.g., `"2"`. |
| `windSpeedDay` | String (`string`) | Daytime Wind Speed | Daytime wind speed (in m/s), e.g., `"4.2"`. |
| `windSpeedNight` | String (`string`) | Nighttime Wind Speed | Nighttime wind speed (in m/s), e.g., `"2.8"`. |
| `windDegreesDay` | String (`string`) | Daytime Wind Degrees | Wind direction angle during the day (0°–360°), e.g., `"135"`. |
| `windDegreesNight` | String (`string`) | Nighttime Wind Degrees | Wind direction angle at night (0°–360°), e.g., `"180"`. |
| `sunrise` | String (`string`) | Sunrise Time | Local sunrise time in `HH:mm` format, e.g., `"05:18"`. |
| `sunset` | String (`string`) | Sunset Time | Local sunset time in `HH:mm` format, e.g., `"18:52"`. |
| `moonphase` | String (`string`) | Moon Phase | Moon phase name for the forecast date, e.g., `"Waxing Gibbous"`, `"Full Moon"`, `"New Moon"`. |
| `moonrise` | String (`string`) | Moonrise Time | Local moonrise time, e.g., `"14:20"`. |
| `moonset` | String (`string`) | Moonset Time | Local moonset time, e.g., `"02:35"`. |
| `updatetime` | String (`string`) | Data Update Time | Timestamp when the observatory issued the forecast, e.g., `"2025-05-01 07:00:00"`. |

### Example Response

```json
{
  "data": [
    {
      "predictDate": "2025-05-01",
      "conditionDay": "Cloudy",
      "conditionNight": "Overcast",
      "conditionIdDay": "1",
      "conditionIdNight": "2",
      "tempDay": "24",
      "tempNight": "15",
      "humidity": "62",
      "pop": "10",
      "qpf": "0.0",
      "uvi": "6",
      "windDirDay": "Southeast",
      "windDirNight": "East",
      "windLevelDay": "3",
      "windLevelNight": "2",
      "windSpeedDay": "3.8",
      "windSpeedNight": "2.1",
      "windDegreesDay": "135",
      "windDegreesNight": "90",
      "sunrise": "05:18",
      "sunset": "18:52",
      "moonphase": "Waxing Crescent",
      "moonrise": "07:45",
      "moonset": "21:30",
      "updatetime": "2025-05-01 06:00:00"
    },
    {
      "predictDate": "2025-05-02",
      "conditionDay": "Light Rain",
      "conditionNight": "Light to Moderate Rain",
      "conditionIdDay": "7",
      "conditionIdNight": "8",
      "tempDay": "20",
      "tempNight": "14",
      "humidity": "85",
      "pop": "80",
      "qpf": "8.5",
      "uvi": "3",
      "windDirDay": "Northeast",
      "windDirNight": "North",
      "windLevelDay": "4",
      "windLevelNight": "3",
      "windSpeedDay": "5.6",
      "windSpeedNight": "3.4",
      "windDegreesDay": "45",
      "windDegreesNight": "0",
      "sunrise": "05:17",
      "sunset": "18:53",
      "moonphase": "First Quarter",
      "moonrise": "08:50",
      "moonset": "22:40",
      "updatetime": "2025-05-01 06:00:00"
    }
  ]
}
```

---

## Typical Workflow Orchestration Example

### Scenario: Travel Weather Assistant with Clothing and Umbrella Recommendations

Orchestrating this workflow in FastGPT creates a seamless pipeline from natural language inquiries to structured queries and personalized recommendations:

```
[User Question]
  │ (e.g., "I plan to visit Yuhang, Hangzhou for two days this weekend. What will the weather be like, and should I bring warm clothes or an umbrella?")
  ▼
[LLM Information Extraction / Intent Recognition]
  │ Extracts parameters:
  │ - city: "Hangzhou"
  │ - towns: "Yuhang District"
  │ - start_time: "2025-05-10"
  │ - end_time: "2025-05-11"
  ▼
[Moji Weather Tool Node (mojiWeather -> tool)]
  │ Receives parameters and queries the Moji Weather API
  │ Outputs structured forecast array `data`
  ▼
[AI Summary and Life Advisor Node]
  │ Injects weather data into system prompt context and instructs the model:
  │ 1. Summarize weekend daytime temperatures and diurnal temperature range (using tempDay, tempNight)
  │ 2. Provide clear umbrella guidance based on conditions (conditionDay/Night) and precipitation probability (pop)
  │ 3. Suggest sun protection measures based on UV index (uvi)
  ▼
[Output Response to User]
```

#### Workflow Configuration Highlights:
1. **Intent Extraction Node**: Guide the upstream model to produce valid JSON parameters, converting colloquial dates into standard `YYYY-MM-DD` strings.
2. **Weather Tool Node**: Bind the extracted `city`, `towns`, `start_time`, and `end_time` variables to the tool node's inputs.
3. **Response Generation Node**: Pass `mojiWeather.data` as reference context to the downstream LLM node, taking advantage of its natural language reasoning to generate concise, friendly, and practical advice.

---

## Important Considerations

1. **Date Format Requirements**: Both `start_time` and `end_time` must strictly adhere to the `YYYY-MM-DD` format (e.g., `2025-05-01`). Invalid or omitted date strings will cause date filtering to fail or schema validation errors.
2. **15-Day Forecast Range Limit**: The underlying service provides up to a 15-day forecast window (`forecast15days`). Dates beyond 15 days from the query date cannot be retrieved and will result in an empty filtered array.
3. **Administrative Division Matching**:
   - The plugin contains a comprehensive built-in offline database mapping administrative divisions across mainland China. It automatically trims suffixes such as "省", "市", "区", "县", "自治州", etc., before performing bidirectional fuzzy matching.
   - If a region name cannot be found in the database, the tool throws a `Can not find city` error. Prompts should guide upstream LLMs to output standard district/county and municipal names.
4. **Service Key and Quotas**: Ensure that the provided `apiKey` is valid and has sufficient remaining quota on the platform. Invalid, expired, or depleted credentials will prevent weather data retrieval.

---

## Local Development and Verification

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm run test

# Build package artifacts
pnpm run build

# Validate plugin specifications
npx @fastgpt-plugin/cli check --entry .
```
