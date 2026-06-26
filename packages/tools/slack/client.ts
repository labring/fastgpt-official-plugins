const SLACK_API_BASE = "https://slack.com/api";

export type SlackResponse<T> = T & {
  ok: boolean;
  error?: string;
  warning?: string;
  response_metadata?: {
    next_cursor?: string;
    warnings?: string[];
    messages?: string[];
  };
};

export interface SlackRequestOptions {
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
}

export async function slackApiRequest<T>(
  botToken: string,
  endpoint: string,
  options: SlackRequestOptions = {},
): Promise<SlackResponse<T>> {
  validateBotToken(botToken);
  validateEndpoint(endpoint);

  const url = new URL(`${SLACK_API_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const requestInit: RequestInit = {
    method: options.method ?? "GET",
    headers: buildHeaders(botToken, options.body !== undefined),
  };

  if (options.body !== undefined) {
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), requestInit);

  const data = (await response.json().catch(() => null)) as SlackResponse<T> | null;
  if (!response.ok) {
    throw new Error(`Slack API HTTP error ${response.status}: ${response.statusText}`);
  }
  if (!data) {
    throw new Error("Slack API returned an invalid JSON response");
  }
  if (data.ok !== true) {
    throw new Error(`Slack API error: ${data.error || "unknown_error"}`);
  }

  return data;
}

export function validateBotToken(botToken: string): void {
  if (!botToken || !botToken.startsWith("xoxb-")) {
    throw new Error('Slack bot token is required and should start with "xoxb-"');
  }
}

function validateEndpoint(endpoint: string): void {
  const allowedEndpoints = new Set([
    "chat.postMessage",
    "conversations.list",
    "conversations.history",
  ]);

  if (!allowedEndpoints.has(endpoint)) {
    throw new Error(`Unsupported Slack endpoint: ${endpoint}`);
  }
}

function buildHeaders(
  botToken: string,
  hasJsonBody: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${botToken}`,
    Accept: "application/json",
  };

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  return headers;
}
