import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import * as cheerio from "cheerio";
import type { Input, Output } from "./schemas";

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { query, url } = input;

  try {
    const response = await fetch(
      `${url}?q=${encodeURIComponent(query)}&language=auto`,
    );
    const html = await response.text();
    const $ = cheerio.load(html, {
      xml: false,
    });

    const results: Output["result"] = [];

    $(".result").each((_: number, element) => {
      const $element = $(element);
      results.push({
        title: $element.find("h3").text().trim(),
        link: $element.find("a").first().attr("href") || "",
        snippet: $element.find(".content").text().trim(),
      });
    });

    if (results.length === 0) {
      return Promise.reject({
        error: "No search results",
      });
    }

    return {
      result: results.slice(0, 10),
    };
  } catch (error) {
    return Promise.reject({ error });
  }
}
