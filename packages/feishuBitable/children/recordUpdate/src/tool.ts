import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { BitableRecord, FeishuResponse } from "../../../types";
import { parseJsonSafely } from "../../../utils";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, dataTableId, recordId, fields }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const fieldsData = parseJsonSafely(fields);

  const response = await client.put<FeishuResponse<{ record: BitableRecord }>>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}/records/${recordId}`,
    { fields: fieldsData },
  );

  const record = response.data.data.record;

  return {
    success: true,
  };
}
