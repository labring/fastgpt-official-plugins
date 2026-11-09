# Bocha Search

Bocha AI Search (Bocha Web Search) is a specialized web information retrieval service designed for Large Language Models (LLMs) and intelligent agent applications. This plugin brings real-time web search capabilities to FastGPT, featuring time range filtering, target domain inclusion/exclusion, and long-text web snippet extraction. It empowers AI agents to retrieve timely information, verify facts, and expand domain knowledge.

## Application Scenarios

- **Real-Time News and Trend Retrieval**: Search for breaking news, industry developments, and policy updates, combined with `freshness` time filters for time-sensitive data.
- **Fact-Checking and Knowledge Augmentation (RAG)**: Provide authoritative external sources and live web links for LLMs to effectively mitigate hallucinations.
- **Vertical Domain and Targeted Search**: Constrain queries to authoritative official websites, documentation portals, or industry platforms via `include` for high-confidence results.
- **Noise and Distraction Filtering**: Exclude low-quality aggregator sites, content farms, or irrelevant domains using `exclude` to improve result quality.

---

## Secret Configuration

Using this plugin requires an API key (`apiKey`) from the Bocha AI Open Platform.

### How to Obtain an API Key

1. Visit the [Bocha AI Open Platform](https://open.bochaai.com) (or official website at [https://bochaai.com](https://bochaai.com)) to register and log in.
2. Navigate to the **API Key Management** section in the console.
3. Create a new API Key and copy it securely.

### Configuration in FastGPT

Configure the following field under the plugin's **Secrets** settings in FastGPT:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `apiKey` | String (`string`) | Yes | Bocha AI Open Platform API key. Sent as a Bearer Token in request headers to authenticate against the Bocha Web Search API. |

---

## Input Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `query` | String (`string`) | None | Yes | **Search query**. Supports natural language questions or keyword combinations to search across the web. |
| `freshness` | Enum String (`string`) | `noLimit` | No | **Time range filter**. Supported options:<br>• `noLimit`: No time restriction (default)<br>• `oneDay`: Within the past 24 hours (1 day)<br>• `oneWeek`: Within the past 1 week<br>• `oneMonth`: Within the past 1 month<br>• `oneYear`: Within the past 1 year |
| `summary` | Boolean (`boolean`) | `true` | No | **Include text summaries**. When set to `true`, returns detailed long-text summaries extracted by the model; when `false`, returns basic snippets only. |
| `include` | String (`string`) | `""` | No | **Included website domains**. Restricts search results to specified domains. Separate multiple domains with vertical bars `\|` or commas `,` (up to 20 domains). Example: `qq.com\|m.163.com`. |
| `exclude` | String (`string`) | `""` | No | **Excluded website domains**. Excludes specified domains from search results. Separate multiple domains with vertical bars `\|` or commas `,` (up to 20 domains). Example: `csdn.net\|zhihu.com`. |
| `count` | Number (`number`) | `10` | No | **Result count**. Allowed range: `1` to `50`. Defaults to `10`. |

---

## Output Results

Upon successful execution, the plugin returns a top-level object containing a `result` array. When an error occurs, an `error` message string is returned.

| Field | Type | Description |
| --- | --- | --- |
| `result` | Array of Objects (`Array<Object>`) | List of web search results. |
| `error` | String (`string`) | Optional. Error description if execution failed. |

### `result` Item Structure

Each item in the `result` array contains the following fields:

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string \| null` | Unique identifier for the search result (if available). |
| `name` | `string \| null` | Title of the web page. |
| `url` | `string \| null` | Full URL link to the target web page. |
| `snippet` | `string \| null` | Short text snippet showing context around query matches. |
| `summary` | `string \| null` | Detailed long-text summary of the page content (when `summary: true` is enabled). |
| `siteName` | `string \| null` | Name of the source website (e.g., "GitHub", "Wikipedia"). |
| `siteIcon` | `string \| null` | Favicon URL of the source website. |
| `datePublished` | `string \| null` | Publication date of the page (ISO 8601 or standard date string). |
| `dateLastCrawled` | `string \| null` | Timestamp when the page was last crawled and indexed. |
| `language` | `string \| null` | Primary language code of the page (e.g., `zh-CN`, `en`). |
| `isNavigational` | `boolean \| null` | Whether the result represents an official homepage or navigational link. |

### Example Response

```json
{
  "result": [
    {
      "id": "https://api.bochaai.com/v1/web-search#1",
      "name": "FastGPT - LLM-based Knowledge Base Q&A System",
      "url": "https://fastgpt.in",
      "snippet": "FastGPT is a knowledge base platform based on LLMs, offering out-of-the-box data processing, model orchestration, and agent workflow capabilities...",
      "summary": "FastGPT is an open-source AI platform built on large language models, supporting multi-channel data ingestion, vectorized retrieval, visual workflows, and API integrations.",
      "siteName": "FastGPT Official",
      "siteIcon": "https://fastgpt.in/favicon.ico",
      "datePublished": "2024-01-15T08:00:00Z",
      "dateLastCrawled": "2025-02-20T12:00:00Z",
      "language": "zh-CN",
      "isNavigational": true
    }
  ]
}
```

---

## Usage Scenarios and Examples

### Scenario 1: Search for Tech News in the Past 24 Hours

```json
{
  "query": "Latest LLM releases and open source developments",
  "freshness": "oneDay",
  "summary": true,
  "count": 5
}
```

### Scenario 2: Targeted Search in Official Documentation and Repositories

Search for plugin development guides restricted to `github.com` and `doc.fastgpt.in`:

```json
{
  "query": "FastGPT plugin SDK integration guide",
  "freshness": "noLimit",
  "include": "github.com|doc.fastgpt.in",
  "summary": true,
  "count": 5
}
```

### Scenario 3: Troubleshooting Technical Issues While Excluding Distracting Sites

Filter out noise domains or content scrapers during a technical search:

```json
{
  "query": "Docker deploy PostgreSQL memory limit issue fix",
  "freshness": "oneYear",
  "exclude": "spam-site.com|lowquality.org",
  "count": 10
}
```

---

## Troubleshooting

| Status Code / Symptom | Possible Cause | Resolution |
| --- | --- | --- |
| `HTTP 401 Unauthorized` | API Key is missing, invalid, or expired | Verify that `apiKey` is correctly entered in FastGPT's Secrets configuration and that the key remains active in the Bocha console. |
| `HTTP 400 Bad Request` | Invalid request parameter format or value out of bounds | Check parameter values:<br>• `count` must be an integer between `1` and `50`;<br>• `freshness` must be a valid enum string;<br>• `include` / `exclude` must contain at most 20 domains. |
| `HTTP 429 Too Many Requests` | Exceeded concurrency or account rate limits | Review quota and QPS limits in the Bocha AI console. Consider upgrading your plan or throttling requests in your agent workflow. |
| `HTTP 500 / 502 / 503` | Bocha search server internal error or transient upstream network issue | Transient server issue; configure retry logic or exception handling in your workflow. |
| Network Connection Timeout | The deployment environment cannot connect to Bocha API | Ensure the host network can reach `https://api.bochaai.com`. Verify routing, proxy, or firewall policies. |

---

## Local Development and Verification

Run the following commands inside `packages/tools/bocha`:

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm run test

# Build the plugin bundle
pnpm run build

# Validate plugin standards and artifacts
npx @fastgpt-plugin/cli check --entry .

# Package into a .pkg bundle
pnpm run pack
```
