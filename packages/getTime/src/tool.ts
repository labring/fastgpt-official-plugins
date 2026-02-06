import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { z } from "zod";
import type { InputType, OutputType } from "./schemas";

export async function tool(
  _: z.infer<typeof InputType>,
  ctx: ToolContextType,
): Promise<z.infer<typeof OutputType>> {
  const { systemVar } = ctx;

  return { time: systemVar.time };
}
