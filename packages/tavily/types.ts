/**
 * 搜索请求参数
 */
export interface SearchRequest {
  api_key: string;
  query: string;
  auto_parameters?: boolean | undefined;
  topic?: "general" | "news" | "finance" | undefined;
  search_depth?: "basic" | "advanced" | undefined;
  chunks_per_source?: number | undefined;
  max_results?: number | undefined;
  time_range?:
    | "day"
    | "week"
    | "month"
    | "year"
    | "d"
    | "w"
    | "m"
    | "y"
    | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
  include_answer?: boolean | "basic" | "advanced" | undefined;
  include_raw_content?: boolean | "markdown" | "text" | undefined;
  include_images?: boolean | undefined;
  include_image_descriptions?: boolean | undefined;
  include_favicon?: boolean | undefined;
  include_domains?: string[] | undefined;
  exclude_domains?: string[] | undefined;
  country?: string | undefined;
}

/**
 * 搜索结果项
 */
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string | undefined;
}

/**
 * 搜索响应
 */
export interface SearchResponse {
  query: string;
  answer?: string | undefined;
  results: SearchResult[];
  images?: Array<{
    url: string;
    description: string;
  }>;
  response_time: number;
  request_id: string;
}

/**
 * 提取请求参数
 */
export interface ExtractRequest {
  api_key: string;
  urls: string | string[];
  format?: "markdown" | "text" | undefined;
  extract_depth?: "basic" | "advanced" | undefined;
  include_images?: boolean | undefined;
  include_favicon?: boolean | undefined;
  timeout?: number | undefined;
}

/**
 * 提取结果项
 */
export interface ExtractResult {
  url: string;
  raw_content: string;
  images?: string[] | undefined;
}

/**
 * 提取响应
 */
export interface ExtractResponse {
  results: ExtractResult[];
  failed_results?: Array<{
    url: string;
    error: string;
  }>;
  response_time: number;
  request_id: string;
}

/**
 * 爬取请求参数
 */
export interface CrawlRequest {
  api_key: string;
  url: string;
  instructions?: string | undefined;
  max_depth?: number | undefined;
  max_breadth?: number | undefined;
  limit?: number | undefined;
  select_paths?: string[] | undefined;
  select_domains?: string[] | undefined;
  exclude_paths?: string[] | undefined;
  exclude_domains?: string[] | undefined;
  allow_external?: boolean | undefined;
  include_images?: boolean | undefined;
  extract_depth?: "basic" | "advanced" | undefined;
  format?: "markdown" | "text" | undefined;
  include_favicon?: boolean | undefined;
  timeout?: number | undefined;
}

/**
 * 爬取结果项
 */
export interface CrawlResult {
  url: string;
  raw_content: string;
  favicon?: string | undefined;
}

/**
 * 爬取响应
 */
export interface CrawlResponse {
  base_url: string;
  results: CrawlResult[];
  response_time: number;
  request_id: string;
}

/**
 * 映射请求参数
 */
export interface MapRequest {
  api_key: string;
  url: string;
  instructions?: string | undefined;
  max_depth?: number | undefined;
  max_breadth?: number | undefined;
  limit?: number | undefined;
  select_paths?: string[] | undefined;
  select_domains?: string[] | undefined;
  exclude_paths?: string[] | undefined;
  exclude_domains?: string[] | undefined;
  allow_external?: boolean | undefined;
  timeout?: number | undefined;
}

/**
 * 映射响应
 */
export interface MapResponse {
  base_url: string;
  results: string[];
  response_time: number;
  request_id: string;
}
