import { z } from "zod";
import {
  createTavilyClient,
  handleTavilyError,
  validateApiKey,
} from "../../../client";
import type { SearchRequest, SearchResponse } from "../../../types";

const SearchDepthSchema = z.enum(["basic", "advanced"]);
const SearchTopicSchema = z.enum(["general", "news", "finance"]);
const IncludeAnswerSchema = z.union([
  z.boolean(),
  z.enum(["basic", "advanced"]),
]);
const IncludeRawContentSchema = z.union([
  z.enum(["none", "text", "markdown"]),
  z.boolean(),
]);
const TimeRangeSchema = z.enum([
  "none",
  "day",
  "week",
  "month",
  "year",
  "d",
  "w",
  "m",
  "y",
]);
const DomainListSchema = z.union([z.array(z.string()), z.string()]);

// 输入类型 (包含父级密钥)
export const InputType = z
  .object({
    tavilyApiKey: z.string().min(1, "Tavily API key is required"),
    query: z.string().min(1, "Search query cannot be empty"),
    autoParameters: z.boolean().optional(),
    auto_parameters: z.boolean().optional(),
    searchDepth: SearchDepthSchema.optional(),
    search_depth: SearchDepthSchema.optional(),
    chunksPerSource: z.number().int().min(1).max(3).optional(),
    chunks_per_source: z.number().int().min(1).max(3).optional(),
    maxResults: z.number().int().min(0).max(20).optional(),
    max_results: z.number().int().min(0).max(20).optional(),
    includeAnswer: IncludeAnswerSchema.optional(),
    include_answer: IncludeAnswerSchema.optional(),
    searchTopic: SearchTopicSchema.optional(),
    topic: SearchTopicSchema.optional(),
    includeRawContent: IncludeRawContentSchema.optional(),
    include_raw_content: IncludeRawContentSchema.optional(),
    timeRange: TimeRangeSchema.nullish(),
    time_range: TimeRangeSchema.nullish(),
    startDate: z.string().optional(),
    start_date: z.string().optional(),
    endDate: z.string().optional(),
    end_date: z.string().optional(),
    includeImages: z.boolean().optional(),
    include_images: z.boolean().optional(),
    includeImageDescriptions: z.boolean().optional(),
    include_image_descriptions: z.boolean().optional(),
    includeFavicon: z.boolean().optional(),
    include_favicon: z.boolean().optional(),
    includeDomains: DomainListSchema.optional(),
    include_domains: DomainListSchema.optional(),
    excludeDomains: DomainListSchema.optional(),
    exclude_domains: DomainListSchema.optional(),
    country: z.string().optional(),
  })
  .transform((data) => ({
    tavilyApiKey: data.tavilyApiKey,
    query: data.query,
    autoParameters: data.autoParameters ?? data.auto_parameters,
    searchDepth: data.searchDepth ?? data.search_depth ?? "basic",
    chunksPerSource: data.chunksPerSource ?? data.chunks_per_source,
    maxResults: data.maxResults ?? data.max_results ?? 5,
    includeAnswer: data.includeAnswer ?? data.include_answer ?? false,
    searchTopic: data.searchTopic ?? data.topic ?? "general",
    includeRawContent: normalizeRawContent(
      data.includeRawContent ?? data.include_raw_content,
    ),
    timeRange: data.timeRange ?? data.time_range ?? "none",
    startDate: data.startDate ?? data.start_date,
    endDate: data.endDate ?? data.end_date,
    includeImages: data.includeImages ?? data.include_images ?? false,
    includeImageDescriptions:
      data.includeImageDescriptions ?? data.include_image_descriptions ?? false,
    includeFavicon: data.includeFavicon ?? data.include_favicon ?? false,
    includeDomains: normalizeDomains(data.includeDomains ?? data.include_domains),
    excludeDomains: normalizeDomains(data.excludeDomains ?? data.exclude_domains),
    country: data.country,
  }));

// 输出类型
export const OutputType = z.object({
  answer: z.string().optional(),
  results: z
    .array(
      z.object({
        title: z.string().nullable(),
        url: z.string().nullable(),
        content: z.string().nullable(),
        raw_content: z.string().optional().nullable(),
      }),
    )
    .default([]),
});

export async function tool(
  input: z.input<typeof InputType> | z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  try {
    const {
      tavilyApiKey,
      query,
      autoParameters,
      searchDepth,
      chunksPerSource,
      maxResults,
      includeAnswer,
      searchTopic,
      includeRawContent,
      timeRange,
      startDate,
      endDate,
      includeImages,
      includeImageDescriptions,
      includeFavicon,
      includeDomains,
      excludeDomains,
      country,
    } = await InputType.parseAsync(input);

    // 1. 验证 API Key
    validateApiKey(tavilyApiKey);

    // 2. 创建客户端
    const client = createTavilyClient(tavilyApiKey);

    // 3. 构建请求
    const requestBody: SearchRequest = {
      api_key: tavilyApiKey,
      query,
      search_depth: searchDepth,
      max_results: maxResults,
      include_answer: includeAnswer,
      include_domains: includeDomains,
      exclude_domains: excludeDomains,
      include_images: includeImages,
      include_image_descriptions: includeImageDescriptions,
      include_favicon: includeFavicon,
      include_raw_content:
        includeRawContent === "none" ? false : includeRawContent,
      topic: searchTopic,
      ...(timeRange === "none" ? {} : { time_range: timeRange }),
      ...(autoParameters === undefined ? {} : { auto_parameters: autoParameters }),
      ...(chunksPerSource === undefined ? {} : { chunks_per_source: chunksPerSource }),
      ...(startDate === undefined ? {} : { start_date: startDate }),
      ...(endDate === undefined ? {} : { end_date: endDate }),
      ...(country === undefined ? {} : { country }),
    };

    // 4. 发送请求
    const response = await client.post<SearchResponse>("/search", requestBody);

    // 5. 格式化输出
    return {
      answer: response.data.answer || "",
      results: response.data.results || [],
    };
  } catch (error) {
    return Promise.reject(handleTavilyError(error));
  }
}

function normalizeRawContent(
  value: z.infer<typeof IncludeRawContentSchema> | undefined,
): "none" | "text" | "markdown" {
  if (value === undefined || value === false || value === "none") {
    return "none";
  }

  if (value === true) {
    return "markdown";
  }

  return value;
}

function normalizeDomains(value: z.infer<typeof DomainListSchema> | undefined): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
