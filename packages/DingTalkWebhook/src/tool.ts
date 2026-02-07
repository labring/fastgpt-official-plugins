import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import * as crypto from "crypto";
import * as querystring from "querystring";
import type { Input, Output } from "./schemas";

const createHmac = (algorithm: string, secret: string) => {
  const timestamp = Date.now().toString();
  const stringToSign = `${timestamp}\n${secret}`;

  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(stringToSign, "utf8");
  const signData = hmac.digest();

  const sign = querystring.escape(
    Buffer.from(new Uint8Array(signData)).toString("base64"),
  );

  return {
    timestamp,
    sign,
  };
};

export async function handler(
  { webhookUrl, secret, message }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { sign, timestamp } = createHmac("sha256", secret!);
  const url = new URL(webhookUrl!);
  url.searchParams.append("timestamp", timestamp);
  url.searchParams.append("sign", sign);

  await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msgtype: "text",
      text: {
        content: message!,
      },
    }),
  });

  return {};
}
