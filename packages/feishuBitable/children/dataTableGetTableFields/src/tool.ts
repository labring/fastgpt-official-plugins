import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { FeishuResponse, Field, PagedResponse } from "../../../types";
import { buildPaginationParams } from "../../../utils";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, dataTableId }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const params = buildPaginationParams(100);

  const response = await client.get<FeishuResponse<PagedResponse<Field>>>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}/fields`,
    { params },
  );

  const data = response.data.data;

  return {
    fields: data.items.map((field) => ({
      fieldId: field.field_id,
      fieldName: field.field_name,
      type: field.type,
      isPrimary: field.is_primary,
      description: field.description,
    })),
  };
}
