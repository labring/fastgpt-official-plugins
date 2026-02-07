import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  { apiKey, q, num }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const params = new URLSearchParams({
    api_key: apiKey,
    engine: "baidu",
    q,
    num: String(num),
  });

  const response = await fetch(
    `https://www.searchapi.io/api/v1/search?${params.toString()}`,
  );
  const data = (await response.json()) as { organic_results: any[] };

  return {
    result: data?.organic_results?.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      snippet_highlighted_words: item.snippet_highlighted_words,
    })),
  };
}
