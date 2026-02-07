import type { ToolContextType } from "@fastgpt-plugin/helpers";
import { handleGetAuthToken } from "../../../lib/handler";
import type { Input, Output } from "./schemas";

export async function handler(
  { appId, secret }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const data = await handleGetAuthToken({
    appid: appId,
    secret,
    grant_type: "client_credential",
  });

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}
