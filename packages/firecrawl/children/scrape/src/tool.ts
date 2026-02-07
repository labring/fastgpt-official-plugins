import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import FirecrawlApp from "@mendable/firecrawl-js";
import type { Input, Output } from "./schemas";

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { apiUrl, apiKey, url, format, faster } = input;

  const app = new FirecrawlApp({ apiUrl, apiKey });

  try {
    const scrapeResult = await app.scrape(url, {
      formats: [format],
      maxAge: faster ? 3600000 : 0, // 1 hour in milliseconds
    });

    const result = scrapeResult.markdown || scrapeResult.html;

    if (!result) {
      return Promise.reject("Can't fetch content from url");
    }
    return {
      result,
    };
  } catch (error) {
    if (error instanceof Error) {
      return Promise.reject(error.message);
    }
    return Promise.reject("Failed to scrape URL");
  }
}
