import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { createRedisClient, handleRedisError } from "../../../client";
import type { Input, Output } from "./schemas";

export async function handler(
  { redisUrl, key, value, ttl }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  let client = null;

  try {
    client = await createRedisClient(redisUrl);

    if (ttl > 0) {
      // SET with expiration time
      await client.setex(key, ttl, value);
    } else {
      // Permanent SET
      await client.set(key, value);
    }

    return { success: true };
  } catch (error) {
    return Promise.reject(handleRedisError(error));
  } finally {
    if (client) {
      await client.quit();
    }
  }
}
