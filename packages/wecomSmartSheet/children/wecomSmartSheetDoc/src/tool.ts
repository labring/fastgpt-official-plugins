import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import axios from "axios";
import type { Input, Output } from "./schemas";

export async function handler(
  { accessToken, doc_name, spaceid, fatherid, admin_users }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const client = axios.create({
    baseURL: "https://qyapi.weixin.qq.com/cgi-bin",
    params: {
      access_token: accessToken,
    },
  });

  const response = await client.post("/wedoc/smartsheet/create_doc", {
    doc_name,
    doc_type: 10, // 10: 智能表格
    spaceid: spaceid || undefined,
    fatherid: fatherid || undefined,
    admin_users: admin_users
      ? admin_users
          .split(",")
          .filter(Boolean)
          .map((u) => u.trim())
      : undefined,
  });

  const data = response.data;
  if (data.errcode !== 0) {
    throw new Error(`WeCom API error: ${data.errmsg} (${data.errcode})`);
  }

  return {
    docid: data.docid,
    url: data.url,
    result: data,
  };
}
