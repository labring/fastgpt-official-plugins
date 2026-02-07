import citiesData from "./cities.json";
import type { WeatherApiResponse, WeatherItem } from "./types";

export interface CityInfo {
  province: string | undefined;
  city: string | undefined;
  towns: string | undefined;
}

// normalize the city name
function normalize(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  const suffixes = [
    "特别行政区",
    "自治州",
    "自治区",
    "地区",
    "盟",
    "市辖区",
    "自治县",
    "旗",
    "州",
    "区",
    "县",
    "市",
    "省",
  ];

  const foundSuffix = suffixes.find((suffix) => trimmed.endsWith(suffix));
  return foundSuffix
    ? trimmed.slice(0, trimmed.length - foundSuffix.length)
    : trimmed;
}

// fuzzy match city
function fuzzyMatch(input: string, target: string): boolean {
  const a = normalize(input);
  const b = normalize(target);
  // Null values match each other
  if (!a && !b) return true;
  // The null value does not match the non-null value
  if (!a || !b) return false;
  // The value matches if it is equal to the target or contains the target
  return a === b || a.includes(b) || b.includes(a);
}

// search city
export function searchCity(cityInfo: CityInfo): string | null {
  const inProv = cityInfo.province || "";
  const inCity = cityInfo.city || "";
  const inTowns = cityInfo.towns || "";

  for (const city of citiesData.cities) {
    const provOk = inProv ? fuzzyMatch(inProv, city.province) : true;
    const cityOk = inCity ? fuzzyMatch(inCity, city.city) : true;
    const townsOk = inTowns ? fuzzyMatch(inTowns, city.towns) : true;
    if (provOk && cityOk && townsOk) {
      return city.cityId;
    }
  }
  return null;
}

export async function getWeatherIn15Days(
  cityId: string,
  apiKey: string,
): Promise<WeatherItem[]> {
  const baseUrl = "http://aliv18.data.moji.com";
  const path = "/whapi/json/alicityweather/forecast15days";

  const formData = new FormData();
  formData.set("cityId", cityId);

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `APPCODE ${apiKey}`,
    },
    body: formData,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(
      `Weather API request failed with status ${response.status}`,
    );
  }

  const res = (await response.json()) as WeatherApiResponse;
  const weatherData = res.data.forecast;
  return weatherData;
}
