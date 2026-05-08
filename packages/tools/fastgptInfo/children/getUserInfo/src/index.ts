import type { ToolHandlerContext } from "@fastgpt-plugin/sdk-factory";
import { z } from "zod";

export const InputType = z.object({});

export const OutputType = z.object({
  username: z.string(),
  memberName: z.string().nullish(),
  contact: z.string().nullish(),
  orgs: z.array(
    z.object({
      pathId: z.string(),
      name: z.string(),
    }),
  ),
  groups: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});

export async function tool(
  _input: z.infer<typeof InputType>,
  ctx: ToolHandlerContext<any>,
): Promise<z.infer<typeof OutputType>> {
  const [result, err] = await ctx.invoke.userInfo();
  if (err) {
    return Promise.reject(err);
  }
  return result;
}
