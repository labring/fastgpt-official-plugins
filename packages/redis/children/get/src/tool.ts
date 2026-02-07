import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createRedisClient, handleRedisError } from "../../../client";
import type { Input, Output } from "./schemas";

export async function handler(
  { redisUrl, key }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  let client = null;

  try {
    client = await createRedisClient(redisUrl);
    const value = await client.get(key);

    return {
      value,
      exists: value !== null,
    };
  } catch (error) {
    return Promise.reject(handleRedisError(error));
  } finally {
    if (client) {
      await client.quit();
    }
  }
}
