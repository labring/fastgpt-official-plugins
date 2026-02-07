import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import type { Input, Output } from "./schemas";

/**
 * Metaso 搜索工具主函数
 */
export async function handler(
  { query, apiKey, scope, includeSummary, size }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const response = await fetch("https://metaso.cn/api/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      q: query,
      scope,
      includeSummary,
      size: String(size),
    }),
  });

  if (!response.ok) {
    throw new Error(`Metaso API error: HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    errMsg?: string;
    webpages?: {
      title: string;
      link: string;
      snippet?: string;
      summary?: string;
      authors: string[];
      date: string;
    }[];
    documents?: {
      title: string;
      link: string;
      summary?: string;
      snippet?: string;
    }[];
    scholars: {
      title: string;
      link: string;
      snippet?: string;
      summary?: string;
      authors: string[];
      date: string;
    }[];
    images: {
      title: string;
      imageUrl: string;
    }[];
    videos: {
      title: string;
      link: string;
      snippet: string;
      authors: string[];
      date: string;
      coverImage: string;
    }[];
    podcasts: {
      title: string;
      link: string;
      snippet: string;
      authors: string[];
      date: string;
    }[];
  };

  if (data.errMsg) {
    throw new Error(data.errMsg);
  }

  const result = (() => {
    // Add webpages results
    if (data.webpages) {
      return data.webpages.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        summary: item.summary,
        authors: item.authors,
        date: item.date,
      }));
    }

    // Add documents results
    if (data.documents) {
      return data.documents.map((item) => ({
        title: item.title,
        link: item.link,
        summary: item.summary,
        snippet: item.snippet,
      }));
    }

    // Add scholars results
    if (data.scholars) {
      return data.scholars.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        summary: item.summary,
        authors: item.authors,
        date: item.date,
      }));
    }

    // Add images results
    if (data.images) {
      return data.images.map((item) => ({
        title: item.title,
        imageUrl: item.imageUrl,
      }));
    }

    // Add videos results
    if (data.videos) {
      return data.videos.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        authors: item.authors,
        date: item.date,
        coverImage: item.coverImage,
      }));
    }

    // Add podcasts results
    if (data.podcasts) {
      return data.podcasts.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        authors: item.authors,
        date: item.date,
      }));
    }

    console.log("No search results found", { data });
    throw new Error("No search results found");
  })();

  return {
    result,
  };
}
