import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { FeishuResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, tableName }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const response = await client.post<FeishuResponse<{ table_id: string }>>(
    `/bitable/v1/apps/${biTableId}/tables`,
    { table: { name: tableName } },
  );

  return {
    dataTableId: response.data.data.table_id,
  };
}
