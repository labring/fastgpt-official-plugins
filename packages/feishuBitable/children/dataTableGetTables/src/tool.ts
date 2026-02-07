import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { FeishuResponse, PagedResponse, Table } from "../../../types";
import { buildPaginationParams } from "../../../utils";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, pageSize = 20, pageToken }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const params = buildPaginationParams(pageSize, pageToken);

  const response = await client.get<FeishuResponse<PagedResponse<Table>>>(
    `/bitable/v1/apps/${biTableId}/tables`,
    { params },
  );

  const data = response.data.data;

  return {
    tables:
      data.items?.map((table) => ({
        tableId: table.table_id,
        name: table.name,
        revision: table.revision,
      })) || [],
    hasMore: data.has_more,
    pageToken: data.page_token,
    total: data.total || data.items?.length || 0,
  };
}
