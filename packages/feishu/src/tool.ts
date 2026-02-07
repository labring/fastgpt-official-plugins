import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

// support json or plaintext:
// if json, just return it (for supporting customized message)
// if plaintext, wrap it with json
function format(content: string) {
  try {
    return JSON.parse(content);
  } catch (err) {
    return {
      msg_type: "text",
      content: {
        text: content,
      },
    };
  }
}

export async function handler(
  { content, hook_url }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const data = format(content);
  const response = await fetch(hook_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return {
    result: await response.json(),
  };
}
