import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import Perplexity from "@perplexity-ai/perplexity_ai";
import type { Input, Output } from "./schemas";

export async function handler(
  { apiKey, query, max_results }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = new Perplexity({ apiKey });

  const search = await client.search.create({
    query,
    max_results,
  });

  return {
    result: search.results.map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.snippet,
    })),
  };
}
