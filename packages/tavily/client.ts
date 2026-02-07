const TAVILY_API_BASE = "https://api.tavily.com";

/**
 * Tavily API 错误类型
 */
export enum TavilyErrorType {
  AUTH_ERROR = "AUTH_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  INVALID_REQUEST = "INVALID_REQUEST",
  SERVER_ERROR = "SERVER_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

/**
 * 发送 Tavily API 请求
 */
export async function tavilyRequest<T>(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${TAVILY_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const status = response.status;
    let errorMessage: string;
    try {
      const errorBody = (await response.json()) as { error?: string };
      errorMessage = errorBody.error || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }

    switch (status) {
      case 401:
        throw new Error(
          `Authentication failed: Invalid Tavily API key. ${errorMessage}`,
        );
      case 403:
        throw new Error(`Access forbidden: ${errorMessage}`);
      case 429:
        throw new Error(
          `Rate limit exceeded: ${errorMessage}. Please wait before making more requests.`,
        );
      case 400:
        throw new Error(`Invalid request: ${errorMessage}`);
      case 500:
      case 502:
      case 503:
        throw new Error(
          `Tavily server error: ${errorMessage}. Please try again later.`,
        );
      default:
        throw new Error(`Tavily API error (${status}): ${errorMessage}`);
    }
  }

  return (await response.json()) as T;
}

/**
 * 验证 API Key 格式
 */
export function validateApiKey(apiKey: string): void {
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("Tavily API key is required");
  }

  if (!apiKey.startsWith("tvly-")) {
    throw new Error(
      'Invalid Tavily API key format. Key should start with "tvly-"',
    );
  }

  if (apiKey.length < 20) {
    throw new Error("Invalid Tavily API key format. Key is too short");
  }
}

/**
 * 错误处理函数
 */
export function handleTavilyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error occurred while calling Tavily API";
}

/**
 * 获取错误类型
 */
export function getErrorType(error: unknown): TavilyErrorType {
  if (error instanceof Error) {
    const message = error.message;

    if (
      message.includes("Authentication failed") ||
      message.includes("Access forbidden")
    ) {
      return TavilyErrorType.AUTH_ERROR;
    }
    if (message.includes("Rate limit exceeded")) {
      return TavilyErrorType.RATE_LIMIT;
    }
    if (message.includes("Invalid request")) {
      return TavilyErrorType.INVALID_REQUEST;
    }
    if (message.includes("server error")) {
      return TavilyErrorType.SERVER_ERROR;
    }
    if (message.includes("timeout") || message.includes("aborted")) {
      return TavilyErrorType.TIMEOUT;
    }
    if (
      message.includes("network") ||
      message.includes("ECONNREFUSED") ||
      message.includes("ENOTFOUND")
    ) {
      return TavilyErrorType.NETWORK_ERROR;
    }
  }

  return TavilyErrorType.UNKNOWN;
}
