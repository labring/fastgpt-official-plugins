import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import wiki from "wikijs";
import type { Input, Output } from "./schemas";

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, ms);
  });

const getErrText = (err: any, def = ""): string => {
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
};

const func = async (props: Input, retry = 3): Promise<Output> => {
  const { query } = props;

  try {
    const wikiInstance = wiki({
      apiUrl: "https://zh.wikipedia.org/w/api.php",
    }) as any;

    const searchResults = await wikiInstance.page(query).then((page: any) => {
      return page.summary();
    });

    return {
      result: searchResults,
    };
  } catch (error) {
    console.log(error);

    if (retry <= 0) {
      return {
        result: getErrText(error, "Failed to fetch data from wiki"),
      };
    }

    await delay(Math.random() * 5000);
    return func(props, retry - 1);
  }
};

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  return func(input);
}
