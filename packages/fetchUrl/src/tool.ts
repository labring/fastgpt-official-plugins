import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { title, markdown } = await _ctx.emitter.cherrio2md({
    fetchUrl: input.url,
    selector: "body",
  });

  return {
    title,
    result: markdown,
  };
}
