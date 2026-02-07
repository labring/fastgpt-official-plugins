import Redis from "ioredis";

/**
 * Create a Redis client connection
 */
export async function createRedisClient(redisUrl: string): Promise<Redis> {
  const client = new Redis(redisUrl, {
    retryStrategy: (times: number) => {
      if (times > 3) {
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000); // Retry interval
    },
    connectTimeout: 10000, // 10 second connection timeout
    commandTimeout: 5000, // 5 second command timeout
    lazyConnect: true,
  });

  // Test connection
  await client.connect();
  await client.ping();

  return client;
}

/**
 * Error handling
 */
export function handleRedisError(error: unknown): string {
  let errorMessage = "Unknown error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Distinguish error types
  if (errorMessage.includes("ECONNREFUSED")) {
    return "Redis connection refused. Please check Redis URL and ensure Redis is running.";
  } else if (errorMessage.includes("ETIMEDOUT")) {
    return "Redis connection timeout. Please check network and Redis availability.";
  } else if (errorMessage.includes("NOAUTH")) {
    return "Redis authentication failed. Please check connection string.";
  }

  return errorMessage;
}
