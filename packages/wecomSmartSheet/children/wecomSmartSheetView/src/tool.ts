import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import axios, { type AxiosResponse } from "axios";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    accessToken,
    docid,
    sheet_id,
    action,
    view_title,
    view_id,
    view_type,
  }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = axios.create({
    baseURL: "https://qyapi.weixin.qq.com/cgi-bin",
    params: { access_token: accessToken },
  });

  let response: AxiosResponse;
  switch (action) {
    case "add": {
      if (!view_title || !view_type) {
        throw new Error("view_title and view_type are required for add action");
      }
      response = await client.post("/wedoc/smartsheet/add_view", {
        docid,
        sheet_id,
        view_title,
        view_type,
      });
      break;
    }
    case "del": {
      if (!view_id) {
        throw new Error("view_id is required for del action");
      }
      response = await client.post("/wedoc/smartsheet/delete_views", {
        docid,
        sheet_id,
        view_ids: [view_id],
      });
      break;
    }
    case "update": {
      if (!view_id) {
        throw new Error("view_id is required for update action");
      }
      response = await client.post("/wedoc/smartsheet/update_view", {
        docid,
        sheet_id,
        view_id,
        view_title: view_title || undefined,
      });
      break;
    }
    case "list": {
      response = await client.post("/wedoc/smartsheet/get_views", {
        docid,
        sheet_id,
        view_ids: view_id ? [view_id] : undefined,
      });
      break;
    }
  }

  return { result: response?.data || {} };
}
