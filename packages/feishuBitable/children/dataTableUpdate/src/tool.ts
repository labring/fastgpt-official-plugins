import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { FeishuResponse, Table } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, dataTableId, name }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  await client.patch<FeishuResponse<{ table: Table }>>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}`,
    { name },
  );

  return {
    success: true,
  };
}
