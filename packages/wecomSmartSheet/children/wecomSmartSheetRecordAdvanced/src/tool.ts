import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import axios, { type AxiosResponse } from "axios";
import type { Input, Output } from "./schemas";

export async function handler(
  {
    accessToken,
    docid,
    sheet_id,
    action,
    records,
    record_ids,
    query_params,
    key_type,
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
      if (!records) throw new Error("records array is required for add action");
      response = await client.post("/wedoc/smartsheet/add_records", {
        docid,
        sheet_id,
        key_type: key_type || "CELL_VALUE_KEY_TYPE_FIELD_TITLE",
        records,
      });
      break;
    }
    case "update": {
      if (!records)
        throw new Error("records array is required for update action");
      response = await client.post("/wedoc/smartsheet/update_records", {
        docid,
        sheet_id,
        key_type: key_type || "CELL_VALUE_KEY_TYPE_FIELD_TITLE",
        records,
      });
      break;
    }
    case "del": {
      if (!record_ids)
        throw new Error("record_ids array is required for del action");
      response = await client.post("/wedoc/smartsheet/delete_records", {
        docid,
        sheet_id,
        record_ids,
      });
      break;
    }
    case "list": {
      response = await client.post("/wedoc/smartsheet/get_records", {
        docid,
        sheet_id,
        key_type: key_type || "CELL_VALUE_KEY_TYPE_FIELD_TITLE",
        ...query_params,
      });
      break;
    }
  }

  return { result: response?.data || {} };
}
