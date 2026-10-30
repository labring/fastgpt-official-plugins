export const DEEPSEEK_API_BASE = "https://api.deepseek.com";

export interface DeepSeekErrorResponse {
  error?: {
    message?: string;
    type?: string;
    param?: unknown;
    code?: string;
  };
}

export class DeepSeekApiError extends Error {
  status: number;
  code?: string | undefined;
  type?: string | undefined;

  constructor(message: string, status: number, code?: string, type?: string) {
    super(message);
    this.name = "DeepSeekApiError";
    this.status = status;
    if (code !== undefined) {
      this.code = code;
    }
    if (type !== undefined) {
      this.type = type;
    }
  }
}

export interface DeepSeekSearchResultItem {
  rerank_score?: number | undefined;
  title: string;
  url: string;
  snippet: string;
  summary: string;
  content?: string | undefined;
  site_name?: string | null | undefined;
  site_icon?: string | null | undefined;
  date?: string | null | undefined;
  authority?: number | undefined;
}

export interface DeepSeekSearchResponse {
  results: DeepSeekSearchResultItem[];
}

export interface DeepSeekFetchResponse {
  title: string;
  content: string;
}

/**
 * Send an authenticated JSON POST request to DeepSeek API
 */
export async function postDeepSeek<T>(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<T> {
  const cleanApiKey = apiKey.trim();
  if (!cleanApiKey) {
    throw new DeepSeekApiError("DeepSeek API key cannot be empty", 401);
  }

  const url = `${DEEPSEEK_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cleanApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    let errorCode: string | undefined;
    let errorType: string | undefined;

    try {
      const errJson = (await response.json()) as DeepSeekErrorResponse;
      if (errJson?.error?.message) {
        errorMessage = errJson.error.message;
        errorCode = errJson.error.code;
        errorType = errJson.error.type;
      }
    } catch {
      // Fallback to default status text if response is not JSON
    }

    throw new DeepSeekApiError(
      errorMessage,
      response.status,
      errorCode,
      errorType,
    );
  }

  return (await response.json()) as T;
}

/**
 * Format search results into a clean markdown document for LLMs
 */
export function formatSearchResultsText(
  results: DeepSeekSearchResultItem[],
): string {
  if (!results || results.length === 0) {
    return "No search results found.";
  }

  return results
    .map((item, index) => {
      const lines: string[] = [];
      lines.push(
        `### ${index + 1}. [${item.title || "Untitled"}](${item.url})`,
      );

      const metadata: string[] = [];
      if (item.site_name) {
        metadata.push(`来源: ${item.site_name}`);
      }
      if (item.date) {
        metadata.push(`时间: ${item.date}`);
      }
      if (typeof item.authority === "number" && item.authority >= 0) {
        metadata.push(`权威度: ${item.authority}/4`);
      }
      if (typeof item.rerank_score === "number") {
        metadata.push(`相关度: ${item.rerank_score.toFixed(2)}`);
      }
      if (metadata.length > 0) {
        lines.push(`*${metadata.join(" | ")}*`);
      }

      if (item.summary) {
        lines.push(`\n**摘要**: ${item.summary}`);
      } else if (item.snippet) {
        lines.push(`\n**摘要**: ${item.snippet}`);
      }

      if (item.content?.trim()) {
        lines.push(`\n**正文内容**:\n${item.content}`);
      }

      return lines.join("\n");
    })
    .join("\n\n---\n\n");
}
