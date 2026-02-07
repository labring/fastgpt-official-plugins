import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  { ms }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return {};
}
