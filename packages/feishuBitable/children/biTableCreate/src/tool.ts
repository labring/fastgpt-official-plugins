import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createFeishuClient } from "../../../client";
import type { BitableApp, FeishuResponse } from "../../../types";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, appSecret, name, folderToken }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = await createFeishuClient(appId, appSecret);

  const requestBody: any = { name };
  if (folderToken) {
    requestBody.folder_token = folderToken;
  }

  const response = await client.post<FeishuResponse<{ app: BitableApp }>>(
    "/bitable/v1/apps",
    requestBody,
  );
  console.log(response.data);
  const app = response.data.data.app;

  return {
    id: app.app_token,
    url: app.url,
  };
}
