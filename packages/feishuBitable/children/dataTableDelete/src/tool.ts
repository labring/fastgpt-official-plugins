import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { FeishuResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId, dataTableId }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // 获取访问令牌
  const client = await createFeishuClient(appId, appSecret);

  await client.delete<FeishuResponse>(
    `/bitable/v1/apps/${biTableId}/tables/${dataTableId}`,
  );

  return {
    success: true,
  };
}
