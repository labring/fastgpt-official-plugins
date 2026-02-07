import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { BitableApp, FeishuResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, biTableId }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // 获取访问令牌
  const client = await createFeishuClient(appId, appSecret);

  const response = await client.get<FeishuResponse<{ app: BitableApp }>>(
    `/bitable/v1/apps/${biTableId}`,
  );

  const app = response.data.data.app;

  return {
    name: app.name || "",
  };
}
