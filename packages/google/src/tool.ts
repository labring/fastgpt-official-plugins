import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { cx, query, key } = input;

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.append("key", key);
  url.searchParams.append("cx", cx);
  url.searchParams.append("q", query);
  url.searchParams.append("c2coff", "1");
  url.searchParams.append("start", "1");
  url.searchParams.append("end", "20");
  url.searchParams.append("dateRestrict", "m[1]");

  const response = await fetch(url.toString(), {
    method: "GET",
  });
  const json = await response.json();

  return {
    result: json,
  };
}
