import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

function getErrText(err: any, def = ""): string {
  const msg: string =
    typeof err === "string"
      ? err
      : err?.response?.data?.message ||
        err?.response?.message ||
        err?.message ||
        err?.response?.data?.msg ||
        err?.response?.msg ||
        err?.msg ||
        def;
  return msg;
}

export async function handler(
  {
    apiKey,
    query,
    freshness = "noLimit",
    summary = true,
    include = "",
    exclude = "",
    count = 10,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  try {
    const response = await fetch("https://api.bochaai.com/v1/web-search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        freshness,
        summary,
        include,
        exclude,
        count,
      }),
    });

    if (!response.ok) {
      return Promise.reject({
        error: `HTTP错误: ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();

    const searchResults = data?.data?.webPages?.value || [];

    return {
      result: searchResults,
    };
  } catch (error) {
    return Promise.reject({
      error: getErrText(error),
    });
  }
}
