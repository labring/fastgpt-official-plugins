import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { BitableRecord, FeishuResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, dataTableId, recordId }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const response = await client.get<FeishuResponse<{ record: BitableRecord }>>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}/records/${recordId}`,
  );

  const record = response.data.data.record;

  return {
    recordId: record.record_id,
    fields: record.fields,
  };
}
