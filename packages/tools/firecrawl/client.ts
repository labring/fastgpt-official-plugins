const FIRECRAWL_API_BASE = "https://api.firecrawl.dev";
const FIRECRAWL_ORIGIN = "fastgpt";
const REQUEST_TIMEOUT_MS = 120_000;

export interface FirecrawlResponse<T> {
  success: boolean;
  data?: T;
  warning?: string;
  error?: string;
}

export async function firecrawlRequest<T>(
  {
    apiUrl,
    apiKey,
  }: {
    apiUrl?: string | undefined;
    apiKey: string;
  },
  path: string,
  body: Record<string, unknown>,
): Promise<FirecrawlResponse<T>> {
  const baseUrl = (apiUrl || FIRECRAWL_API_BASE).replace(/\/+$/, "");

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, origin: FIRECRAWL_ORIGIN }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = (await response
    .json()
    .catch(() => null)) as FirecrawlResponse<T> | null;

  if (!response.ok || !data?.success) {
    throw new Error(
      `Firecrawl API error ${response.status}: ${data?.error || response.statusText || "Unknown error"}`,
    );
  }

  return data;
}
