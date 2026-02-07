import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

/**
 * Convert base64 encoded data to text
 * Supports both data URL format (with MIME type) and raw base64
 */
export async function handler(
  { base64 }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  // Remove data URL prefix if present (e.g., "data:text/plain;base64,")
  const cleanBase64 = base64.replace(/^data:[^;]*;base64,/, "");

  // Decode base64 to text using Buffer (Node.js) or atob (browser)
  const decodedText =
    typeof Buffer !== "undefined"
      ? Buffer.from(cleanBase64, "base64").toString("utf-8")
      : decodeURIComponent(escape(atob(cleanBase64)));

  return {
    text: decodedText,
  };
}
