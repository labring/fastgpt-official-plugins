import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import axios, { type AxiosResponse } from "axios";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    accessToken,
    docid,
    sheet_id,
    action,
    fields,
    field_ids,
    view_id,
    offset,
    limit,
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
      if (!fields) throw new Error("fields array is required for add action");
      response = await client.post("/wedoc/smartsheet/add_fields", {
        docid,
        sheet_id,
        fields,
      });
      break;
    }
    case "del": {
      if (!field_ids)
        throw new Error("field_ids array is required for del action");
      response = await client.post("/wedoc/smartsheet/delete_fields", {
        docid,
        sheet_id,
        field_ids,
      });
      break;
    }
    case "update": {
      if (!fields)
        throw new Error("fields array is required for update action");
      response = await client.post("/wedoc/smartsheet/update_fields", {
        docid,
        sheet_id,
        fields,
      });
      break;
    }
    case "list": {
      response = await client.post("/wedoc/smartsheet/get_fields", {
        docid,
        sheet_id,
        view_id,
        offset,
        limit,
      });
      break;
    }
  }

  return { result: response?.data || {} };
}
