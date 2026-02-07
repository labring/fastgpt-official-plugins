import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import axios, { type AxiosResponse } from "axios";
import type { Input, Output } from "./schemas";

export async function handler(
  { accessToken, docid, action, sheet_id, title, need_all_type_sheet }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = axios.create({
    baseURL: "https://qyapi.weixin.qq.com/cgi-bin",
    params: { access_token: accessToken },
  });

  let response: AxiosResponse;
  switch (action) {
    case "add":
      if (!title) throw new Error("title is required for add action");
      response = await client.post("/wedoc/smartsheet/add_sheet", {
        docid,
        properties: {
          title,
        },
      });
      break;
    case "delete":
      if (!sheet_id) throw new Error("sheet_id is required for delete action");
      response = await client.post("/wedoc/smartsheet/delete_sheet", {
        docid,
        sheet_id,
      });
      break;
    case "update":
      if (!sheet_id) throw new Error("sheet_id is required for update action");
      response = await client.post("/wedoc/smartsheet/update_sheet", {
        docid,
        properties: {
          sheet_id,
          ...(title ? { title } : {}),
        },
      });
      break;
    case "get":
      response = await client.post("/wedoc/smartsheet/get_sheet", {
        docid,
        ...(sheet_id ? { sheet_id } : {}),
        ...(typeof need_all_type_sheet === "boolean"
          ? { need_all_type_sheet }
          : {}),
      });
      break;
    default:
      throw new Error(`Unsupported action: ${action}`);
  }

  if (response.data.errcode !== 0) {
    throw new Error(
      `WeCom API Error [${response.data.errcode}]: ${response.data.errmsg}`,
    );
  }

  return {
    result: response.data,
  };
}
