import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { FeishuResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, dataTableId, recordId }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  await client.delete<FeishuResponse>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}/records/${recordId}`,
  );

  return {
    success: true,
  };
}
