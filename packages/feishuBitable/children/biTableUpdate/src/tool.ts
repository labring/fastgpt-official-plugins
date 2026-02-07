import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { BitableApp, FeishuResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, name }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);
  console.log(biTableId, name, 2232);
  await client.put<FeishuResponse<{ app: BitableApp }>>(
    `/bitable/v1/apps/${biTableId}`,
    { name },
  );

  return {
    success: true,
  };
}
