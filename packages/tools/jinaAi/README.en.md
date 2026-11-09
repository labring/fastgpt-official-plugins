# Jina AI Intelligent Search & Web Content Extraction (Jina AI Tool Set)

`jinaAi` is an official FastGPT plugin suite integrating Jina AI's intelligent search and deep web content extraction capabilities. By unifying Jina AI Reader (headless browser web parsing and clean Markdown conversion) and Jina AI Search (LLM-optimized global web search), this tool set provides Large Language Models (LLMs) and autonomous agents with clean, structured web content and real-time internet knowledge.

## Application Scenarios

- **Deep Scraping of Modern SPAs & Dynamic Webpages**: Executes JavaScript and handles asynchronous hydration using cloud-based headless browsers, flawlessly parsing single-page applications built with React, Vue, Next.js, and Angular into clean, LLM-friendly Markdown.
- **Headless Browser Snapshots & Visual Analysis**: Captures full-page snapshots (`pageshot`) or viewport screenshots (`screenshot`) with a single call, enabling direct integration with Vision LLMs (e.g., GPT-4o, Claude 3.5 Sonnet) for UI/UX audits, chart interpretation, and visual verification.
- **LLM-Optimized Intelligent Web Search**: Built specifically for AI agents to process natural language queries with deep semantic relevance and low noise, supporting multi-region and multi-language customization.
- **Deep Internet Retrieval-Augmented Generation (Agent RAG)**: Combines web search with on-the-fly deep content extraction (`readFullContent`) to crawl and parse complete page bodies directly during search, eliminating LLM hallucinations and knowledge cutoff limitations.

---

## Secret Configuration

Using this tool set requires an API key (`apiKey`) from the Jina AI Developer Platform.

### How to Obtain an API Key & Free Quota

1. Visit the [Jina AI Reader Official Site](https://jina.ai/reader/) or access the [Jina AI Developer Platform](https://jina.ai).
2. Register and log in to your personal or organization account.
3. In the console's **API Keys** management dashboard, generate and copy your API key starting with `jina_` (e.g., `jina_xxxxxxxxxxxxxxxxxxxxxxxx`).
4. **Quota Information**: Jina AI provides a generous free token allocation upon registration (typically 1,000,000 free tokens). Usage can be monitored in real time on the dashboard, with flexible top-up options available.

### Configuration in FastGPT

Configure the following field under the plugin's **Secrets** settings in FastGPT:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | String (`string`) | Yes | Jina AI API key in the format `jina_xxxxxxxxxxxxxxxx`. Sent as a Bearer Token in HTTP headers for authentication. |

---

## Sub-tools Overview

This tool set provides two tightly integrated sub-tools:

1. **`jinaAiReader` (Jina AI Web Parser)**: Powered by Jina Reader, renders dynamic and static web pages via cloud headless browsers, strips away ads, banners, and boilerplate elements, and outputs clean Markdown, HTML, plain text, or screenshot image URLs.
2. **`jinaAiSearch` (Jina AI Search)**: Powered by the Jina Search engine, designed for LLM semantic understanding with global regional and language localization, supporting one-stop search results with optional full page content retrieval.

---

## Sub-tool 1: Jina AI Web Parser (`jinaAiReader`)

### Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `url` | String (`string`) | Yes | None | **Target webpage URL**. The address of the web page to fetch and parse. Must include the `http://` or `https://` protocol prefix. |
| `returnFormat` | Enum String (`string`) | No | `default` | **Format for the returned page content**. Supported options:<br>• `default`: Standard Markdown text (default, equivalent to `markdown`)<br>• `markdown`: Standard Markdown body<br>• `html`: Rendered and cleaned HTML code<br>• `text`: Extracted plain text content<br>• `screenshot`: Image URL of the webpage's visible viewport screenshot<br>• `pageshot`: Image URL of the webpage's full-page scrolling screenshot |

### Output Results

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `title` | String (`string`) | Extracted webpage title. Returns an empty string if not declared. |
| `description` | String (`string`) | Meta description or key summary of the webpage. |
| `content` | String (`string`) | Extracted main body content. Depending on `returnFormat`, returns Markdown text, HTML source, plain text, or a hosted screenshot image URL. |

#### Output Example 1: Default Markdown Format

```json
{
  "title": "FastGPT - Open Source AI Knowledge Base Platform",
  "description": "FastGPT is an enterprise AI knowledge base platform built on LLMs, offering out-of-the-box data processing, model invocation, and workflow orchestration.",
  "content": "# FastGPT\n\nFastGPT is an enterprise-grade AI knowledge base and agent orchestration platform.\n\n## Core Features\n- **Visual Workflow**: Drag-and-drop nodes to orchestrate complex task pipelines.\n- **Hybrid Search**: Fuses vector similarity, keyword full-text search, and reranking models.\n- **Plugin Ecosystem**: Supports official and community plugin extensions."
}
```

#### Output Example 2: Screenshot Mode (`returnFormat: "screenshot"`)

```json
{
  "title": "FastGPT Official Homepage",
  "description": "FastGPT official website and product showcase",
  "content": "https://image.jina.ai/screenshot/snapshot_20250220_abc123.jpg"
}
```

---

## Sub-tool 2: Jina AI Search (`jinaAiSearch`)

### Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | String (`string`) | Yes | None | **Search query or keywords**. Supports natural language questions or keyword combinations to find relevant webpages across the internet. |
| `country` | Enum String (`string`) | No | None | **Search country or region code**. Biases or filters results to the specified region. Supported options:<br>• `CN`: China<br>• `US`: United States<br>• `GB`: United Kingdom<br>• `JP`: Japan<br>• `KR`: South Korea<br>• `FR`: France |
| `language` | Enum String (`string`) | No | None | **Search language code**. Restricts results to the primary language. Supported options:<br>• `zh-cn`: Simplified Chinese<br>• `en`: English<br>• `ja`: Japanese<br>• `ko`: Korean<br>• `fr`: French |
| `readFullContent` | Boolean (`boolean`) | No | `false` | **Read full content of search results**.<br>• `false` (default): Returns only titles, descriptions, and URLs. Fast response time and minimal token usage.<br>• `true`: Jina's engine automatically visits each landing page, scrapes the full Markdown content, and populates the `content` field. |

### Output Results

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `result` | Array of Objects (`Array<Object>`) | List of structured search results sorted by relevance. |

#### Item Structure in `result` Array:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `title` | String (`string`) | Webpage title of the search result. |
| `description` | String (`string`) | Summary or snippet of the search result. |
| `url` | String (`string`) | Direct URL link to the target webpage. |
| `content` | String (`string`) | Optional. Complete Markdown content of the webpage when `readFullContent: true`; omitted (`undefined`) when `false`. |

#### Output Example 1: Basic Search Mode (`readFullContent: false`)

```json
{
  "result": [
    {
      "title": "FastGPT Official Documentation - Quick Start Guide",
      "description": "FastGPT is an enterprise-grade AI knowledge base and workflow orchestration platform based on LLMs...",
      "url": "https://doc.fastgpt.in/docs/intro"
    },
    {
      "title": "labring/FastGPT - GitHub Repository",
      "description": "FastGPT is a knowledge-based platform built on LLMs, offering a comprehensive suite of out-of-the-box capabilities...",
      "url": "https://github.com/labring/FastGPT"
    }
  ]
}
```

#### Output Example 2: Full Content Search Mode (`readFullContent: true`)

```json
{
  "result": [
    {
      "title": "FastGPT Official Documentation - Quick Start Guide",
      "description": "FastGPT is an enterprise-grade AI knowledge base system based on LLMs...",
      "url": "https://doc.fastgpt.in/docs/intro",
      "content": "# Quick Start with FastGPT\n\nFastGPT allows users to ingest documents, website URLs, and APIs...\n\n## Deployment\nRecommended deployment method is Docker Compose..."
    }
  ]
}
```

---

## Comparison & Selection Guide (Jina AI vs. fetchUrl)

Both `jinaAi` and `fetchUrl` in the official FastGPT plugin catalog provide webpage fetching and Markdown conversion. Choose the right tool based on your requirements:

| Feature | Jina AI (`jinaAiReader`) | Webpage Extractor (`fetchUrl`) |
| :--- | :--- | :--- |
| **Underlying Mechanism** | Cloud headless browser with full JavaScript/DOM execution | Server-side HTTP GET request fetching raw HTML |
| **Dynamic SPA Support** | **Full support** (Executes React, Vue, Next.js, and client scripts) | Not supported (Client-rendered SPAs usually yield empty containers) |
| **Page Snapshots & Screenshots** | **Supported** (`screenshot` viewport and `pageshot` full-page) | Not supported |
| **Web Search Integration** | **Built-in** `jinaAiSearch` (supports full content extraction) | No search capability; URL-only |
| **API Key & External Dependency** | Requires Jina AI `apiKey` and subject to cloud quotas | **No API key needed**; executed directly by service host |
| **Response Latency** | Typically 1–3 seconds due to browser rendering and AI filtering | Extremely fast (tens to hundreds of milliseconds) |
| **Network Boundaries** | Fetched via Jina public cloud; **cannot reach intranet/localhost** | Features strict SSRF defense; can access local subnets if configured |
| **Recommended Scenarios** | Complex frontend apps, dynamic SPAs, visual screenshots, deep research | Static documentation, news portals, lightweight blog scraping |

---

## Typical Workflow Orchestration & Best Practices

### Scenario 1: Dynamic SPA Webpage Scraping and LLM Summarization

Overcomes traditional scraper limitations on client-rendered React/Vue sites by using `jinaAiReader` to obtain fully rendered Markdown for downstream AI summarization.

```
[User Query / URL] ──> [Jina AI Web Parser (jinaAiReader)] ──> [AI Chat (LLM Summary)] ──> [Response]
```

#### Orchestration Steps:
1. **Add "Jina AI Web Parser" Node**:
   - Bind user-provided webpage link (e.g., `{{url}}`) to the `url` parameter.
   - Set `returnFormat` to `default` (or `markdown`).
2. **Connect to Downstream "AI Chat" Node**:
   - Reference `{{title}}` and `{{content}}` in the System Prompt.
3. **Prompt Template**:
   ```markdown
   You are an expert web content analyst. Please analyze and summarize the following webpage content parsed via a headless browser:

   [Page Title]: {{title}}
   [Page Content]:
   {{content}}

   [Task Requirements]:
   1. Summarize the core topic or technology discussed (within 200 words).
   2. List 3-5 key takeaways and conclusions.
   3. Maintain objectivity and answer strictly based on the provided text.
   ```

---

### Scenario 2: Agent Real-Time Web Search & Fact Verification (RAG)

Leverages `jinaAiSearch` with `readFullContent: true` to retrieve verified web facts and full page texts in a single step for up-to-date question answering.

```
[User Query] ──> [Jina AI Search (readFullContent: true)] ──> [AI Chat (Synthesize & Answer)] ──> [Response]
```

#### Orchestration Steps:
1. **Configure "Jina AI Search" Node**:
   - Map user question to the `query` parameter.
   - Set `readFullContent` to `true`.
   - Configure `language` and `country` according to target audience (e.g., `en`, `US`).
2. **Configure Downstream "AI Chat" Node**:
   - Inject the `result` array from `jinaAiSearch` as reference context into the prompt.
3. **Prompt Template**:
   ```markdown
   You are an authoritative research assistant with real-time internet search capabilities. Below are live search results and full webpage contents:

   {{result}}

   Using the provided reference materials, answer the user's query rigorously and objectively. Cite relevant sources with their titles and URLs.
   ```

---

### Scenario 3: Webpage Snapshot Capture & Multimodal Visual Analysis (Vision Agent)

Generates live screenshots with `jinaAiReader` (`returnFormat: "screenshot"`) and feeds the image URL into a Vision LLM for visual evaluation.

```
[User URL] ──> [Jina AI Web Parser (returnFormat: screenshot)] ──> [Vision LLM (UI Audit)] ──> [Evaluation]
```

- Pass the output `content` (image URL) from `jinaAiReader` into the vision model node (e.g., GPT-4o, Claude 3.5 Sonnet).
- The prompt can instruct the model to evaluate visual hierarchy, identify responsive design flaws, or conduct web accessibility audits.

---

## Notes & Limitations

1. **API Quotas and Rate Limits**:
   - Jina AI enforces requests-per-minute (RPM) and monthly token quotas. Exceeding limits returns HTTP 429 errors. Regulate invocation concurrency in batch or high-throughput workflows.
2. **Page Rendering Timeouts**:
   - `jinaAiReader` launches cloud headless browsers and waits for network idle. Extremely large pages or sites with blocking scripts may take longer to load. Internal timeouts are set between 30 and 120 seconds to prevent hanging.
3. **Inaccessible Intranet & Localhost**:
   - Requests originate from Jina AI's public cloud infrastructure. **Private network IPs (e.g., `192.168.x.x`, `10.x.x.x`) and local services (e.g., `http://localhost:3000`) cannot be reached**. For intranet scraping, use local FastGPT fetching tools.
4. **Image Hosting Validity**:
   - `screenshot` and `pageshot` formats return temporary hosted URLs on Jina's CDN. If long-term retention or auditing is required, persist images to your own object storage (S3, OSS, etc.).
5. **Strict Anti-Bot Defenses**:
   - While Jina AI handles modern SPA rendering and evasive techniques, pages guarded by aggressive challenges (such as interactive CAPTCHAs or Cloudflare Turnstile blocks) may still be restricted.

---

## Local Development & Validation

Run the following commands in `packages/tools/jinaAi` for local build, validation, and testing:

```bash
# Install dependencies (run from repository root)
pnpm install

# Build and bundle
pnpm run build

# Validate plugin specifications and artifact structure
npx @fastgpt-plugin/cli check --entry .

# Run unit tests
pnpm run test
```
