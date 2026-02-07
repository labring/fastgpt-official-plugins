import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { SafeSearchType, search } from "duck-duck-scrape";
import type { Input, Output } from "./schemas";

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, ms);
  });

const func = async (query: string, retry = 3): Promise<{ result: string }> => {
  try {
    const searchResults = await search(query, {
      safeSearch: SafeSearchType.STRICT,
      time: "y",
    });

    const result = searchResults.results
      .map((item) => ({
        title: item.title,
        link: item.url,
        snippet: item.description,
      }))
      .slice(0, 10);

    return {
      result: JSON.stringify(result),
    };
  } catch (error) {
    if (retry <= 0) {
      console.error("DuckDuckGo error", { error });
      const msg =
        typeof error === "string"
          ? error
          : (error as Error)?.message || "Failed to fetch data from DuckDuckGo";
      return {
        result: msg,
      };
    }

    await delay(Math.random() * 5000);
    return func(query, retry - 1);
  }
};

export async function handler(
  { query }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { result } = await func(query);
  return { result };
}
