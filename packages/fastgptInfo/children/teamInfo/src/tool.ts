import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(_: Input, ctx: ToolContextType): Promise<Output> {
  const { data, msg } = await ctx.emitter.invoke({
    type: "getTeamInfo",
    data: {},
  });
  if (data) {
    return data;
  }
  return Promise.reject(msg);
}
