import { z } from "zod";
import { firecrawlRequest } from "../../../client";

// The API can return long page excerpts as the description; keep tool output LLM-sized.
const MAX_DESCRIPTION_LENGTH = 500;

export const InputType = z.object({
  apiUrl: z.string().optional().default("https://api.firecrawl.dev"),
  apiKey: z.string(),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).optional().default(5),
  includeContent: z.boolean().optional().default(false),
});

export const SearchResultType = z.object({
  url: z.string().meta({
    title: "链接",
    "x-i18n": { title: { en: "URL", "zh-CN": "链接" } },
  }),
  title: z.string().meta({
    title: "标题",
    "x-i18n": { title: { en: "Title", "zh-CN": "标题" } },
  }),
  description: z.string().meta({
    title: "摘要",
    "x-i18n": { title: { en: "Description", "zh-CN": "摘要" } },
  }),
  markdown: z
    .string()
    .optional()
    .meta({
      title: "Markdown 内容",
      "x-i18n": { title: { en: "Markdown content", "zh-CN": "Markdown 内容" } },
    }),
});

export const OutputType = z.object({
  results: z.array(SearchResultType),
});

type SearchWebResult = {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
};

function truncate(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export async function tool({
  apiUrl,
  apiKey,
  query,
  limit,
  includeContent,
}: z.infer<typeof InputType>): Promise<z.infer<typeof OutputType>> {
  const searchResult = await firecrawlRequest<{ web?: SearchWebResult[] }>(
    { apiUrl, apiKey },
    "/v2/search",
    {
      query,
      limit,
      ...(includeContent ? { scrapeOptions: { formats: ["markdown"] } } : {}),
    },
  );

  return {
    results: (searchResult.data?.web || []).map((doc) => ({
      url: doc.url ?? "",
      title: doc.title ?? "",
      description: truncate(doc.description ?? "", MAX_DESCRIPTION_LENGTH),
      ...(doc.markdown ? { markdown: doc.markdown } : {}),
    })),
  };
}
