import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type {
  BitableRecord,
  FeishuResponse,
  PagedResponse,
} from "../../../types";
import { buildPaginationParams, parseJsonSafely } from "../../../utils";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    appId,
    appSecret,
    biTableId,
    dataTableId,
    pageSize = 20,
    pageToken,
    filter,
    sort,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const params = buildPaginationParams(pageSize, pageToken);

  if (filter) {
    params.filter = filter;
  }

  if (sort) {
    const sortArray = parseJsonSafely(sort);
    params.sort = JSON.stringify(sortArray);
  }

  const response = await client.get<
    FeishuResponse<PagedResponse<BitableRecord>>
  >(`/bitable/v1/apps/${biTableId}/tables/${dataTableId}/records`, { params });

  const data = response.data.data;

  return {
    records:
      data.items?.map((record) => ({
        recordId: record.record_id,
        fields: record.fields,
      })) || [],
    hasMore: data.has_more,
    pageToken: data.page_token,
    total: data.total || data.items?.length || 0,
  };
}
