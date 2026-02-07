import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type {
  BitableRecord,
  FeishuResponse,
  Field,
  PagedResponse,
} from "../../../types";
import { buildPaginationParams, parseJsonSafely } from "../../../utils";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, dataTableId, fields }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const addFieldData = parseJsonSafely(fields);

  // Get field
  const {
    data: { data: fieldsData },
  } = await client.get<FeishuResponse<PagedResponse<Field>>>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}/fields`,
    { params: buildPaginationParams(100) },
  );

  // Remove invalid field
  for (const key in addFieldData) {
    if (!fieldsData.items?.find((item) => item.field_name === key)) {
      delete addFieldData[key];
    }
  }

  const response = await client.post<FeishuResponse<{ record: BitableRecord }>>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}/records`,
    { fields: addFieldData },
  );

  const record = response.data.data.record;

  return {
    recordId: record.record_id,
  };
}
