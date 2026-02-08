import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  _input: Input,
  ctx: ToolContextType,
): Promise<Output> {
  const result = await ctx.emitter.invoke({
    type: "getWecomCorpToken",
    data: {},
  });

  if (!result.data.access_token) {
    throw new Error("Invalid response: missing access_token");
  }

  return {
    access_token: result.data.access_token,
    expires_in: result.data.expires_in,
  };
}
