import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  _input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { systemVar } = _ctx;
  const accessToken = systemVar.tool.accessToken;

  if (!accessToken) {
    throw new Error("Missing platform access token");
  }

  // 调用 FastGPT API 获取企业微信授权 token
  const prefix = systemVar.tool.prefix;
  const url = new URL(
    "/api/proApi/support/wecom/getCorpToken",
    prefix || "https://fastgpt.in",
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get auth token: ${response.statusText}`);
  }

  const result = (await response.json()) as {
    data: {
      access_token: string;
      expires_in: number;
    };
  };

  if (!result.data.access_token) {
    throw new Error("Invalid response: missing access_token");
  }

  return {
    access_token: result.data.access_token,
    expires_in: result.data.expires_in,
  };
}
