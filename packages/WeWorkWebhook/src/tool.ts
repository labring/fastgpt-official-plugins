import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

export async function handler(
  { webhookUrl, message }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const url = new URL(webhookUrl);
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      msgtype: "text",
      text: {
        content: message,
      },
    }),
  });
  if (res.status !== 200) {
    throw new Error(await res.text());
  }
  return {};
}
