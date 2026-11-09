# Webpage Content Extractor (fetchUrl)

`fetchUrl` is an official FastGPT plugin designed for fetching web page content and converting it into Markdown format. By providing a target website URL, it quickly retrieves the static HTML content, cleans out irrelevant noise, and transforms it into structured Markdown text optimized for Large Language Model (LLM) comprehension, while extracting the page title.

## Application Scenarios

- **Webpage Summarization & Long Article Extraction**: Fetch technical blogs, official documentation, or in-depth articles, and summarize key insights and bullet points using downstream LLMs.
- **External Real-Time Knowledge Retrieval (RAG)**: Dynamically fetch reference web pages during question-answering workflows to provide real-time context to AI agents, eliminating hallucinations caused by model knowledge cutoff dates.
- **News & Media Article Analysis**: Automatically collect public static news and industry reports to extract body text for sentiment analysis, topic categorization, or multi-source fact-checking.
- **Web Document Ingestion**: Convert external technical docs or specifications into standard Markdown format for ingestion into knowledge bases or secondary data processing.

> **Note**: This tool retrieves raw HTML by directly sending an HTTP GET request from the server, and **only supports statically rendered web pages**. For single-page applications (SPAs built with React, Vue, Angular, etc.) or pages heavily reliant on client-side JavaScript execution, it may not retrieve the fully rendered body content. For dynamic SPA scraping, consider using tools with headless browser capabilities (such as Jina AI, Firecrawl, etc.).

## Security Mechanisms & Features

### 1. Built-in Strict SSRF Defense
To prevent Server-Side Request Forgery (SSRF) risks and protect private network and cloud infrastructure, the plugin includes multi-tiered active defense filtering rules:
- **Block Localhost & Self-Inspection**: Validates requests against the service's `HOSTNAME` and `PORT` environment variables, strictly prohibiting requests to the service itself and the local loopback network.
- **Block Cloud Provider Metadata Endpoints**: Intercepts probing attacks targeting public cloud instance metadata services, covering major cloud platforms:
  - **AWS EC2**: `http://169.254.169.254/latest/meta-data/`
  - **Azure Virtual Machines**: `http://169.254.169.254/metadata/instance?api-version=2021-02-01`
  - **Google Cloud Platform (GCP)**: `http://metadata.google.internal/computeMetadata/v1/`
  - **Alibaba Cloud**: `http://100.100.100.200/latest/meta-data/`
  - **Tencent Cloud**: `http://metadata.tencentyun.com/latest/meta-data/`
  - **Huawei Cloud**: `http://169.254.169.254/latest/meta-data/`
- **Private & Internal IP Range Blocking (Configurable via Environment Variable)**: When internal IP checking is enabled (`CHECK_INTERNAL_IP=true`), resolved IPv4 addresses are matched against strict rules to block non-public and private IP ranges:
  - Loopback & Unspecified: `127.0.0.0/8`, `0.0.0.0/8`
  - Link-Local (APIPA): `169.254.0.0/16`
  - Private Intranets (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
  - Multicast & Reserved: `224.0.0.0/4`, `240.0.0.0/4`
  - Carrier-Grade NAT (CGNAT): `100.64.0.0/10`
  - Special Reserved Ranges: `9.0.0.0/8`, `11.0.0.0/8`, etc.
- **Invalid URL Rejection**: Any URL that fails parsing is considered potentially unsafe and rejected immediately. If a target triggers an internal blocking rule, the plugin safely outputs `Cannot fetch internal url`.

### 2. Intelligent Content Sanitization & High-Performance Markdown Conversion
- **Noise & Risky Tag Stripping**: Automatically strips `<script>`, `<style>`, and other non-content or potentially hazardous tags.
- **Semantic Paragraph & Structure Conversion**: Intelligently converts HTML tags such as `p`, `div`, `h1`–`h6`, `li`, and `<br>` line breaks into Markdown headers and paragraph breaks, while properly decoding common HTML entities (such as `&nbsp;`, `&amp;`, `&lt;`, `&gt;`).
- **Worker Multithreading Acceleration**: Features a worker pool architecture for concurrent streaming processing, offloading CPU-intensive parsing from the main thread during high concurrency.

## Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `url` | string | Yes | None | The complete URL of the target webpage to fetch (must include the `http://` or `https://` protocol prefix). |

## Output Results

Upon execution, the plugin returns a structured object containing webpage metadata and converted content:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `title` | string | Optional. The webpage title extracted from the `<title>` tag; returns an empty string if no title is defined. |
| `result` | string | The cleaned webpage body converted into Markdown format. If blocked by SSRF rules, it outputs a safety interception notice (e.g., `Cannot fetch internal url`). |

### Output Example

```json
{
  "title": "FastGPT Official Documentation - Build AI Agents Fast",
  "result": "# FastGPT Official Documentation\n\nFastGPT is a knowledge base platform based on LLM, offering out-of-the-box data processing, model invocation, and workflow orchestration.\n\n## Core Features\n- Visual workflow orchestration\n- Rich ecosystem of official and third-party plugins\n- Hybrid retrieval and reranking capabilities"
}
```

## Typical Workflow Orchestration & Best Practices

### Example: Webpage Content Extraction and LLM Summarization

This example illustrates the most common workflow combining webpage fetching with AI summarization in FastGPT:

```
[User Query / Trigger] ──> [Fetch Url (fetchUrl)] ──> [AI Chat (LLM Summary)] ──> [Response]
```

#### Configuration Steps:
1. **Add the "Fetch Url" Node**:
   - Connect the URL entered by the user (or extracted via a Regex node) to the `url` input parameter of the `fetchUrl` node.
2. **Connect to Downstream "AI Chat" Node**:
   - Pass the output variables `title` (page title) and `result` (Markdown body) into the prompt template of the downstream "AI Chat" node.
3. **Configure System Prompt for the AI Chat Node**:
   ```markdown
   You are an expert webpage content analyst and summarizer. Review the provided webpage title and content below, and generate a concise summary.

   [Page Title]: {{title}}
   [Page Content]:
   {{result}}

   [Requirements]:
   1. Extract the core points into 3-5 concise bullet points with clear logic.
   2. Identify the intended audience and key takeaways of the article.
   3. Maintain objectivity and do not fabricate facts not mentioned in the text.
   ```

## Notes & Limitations

1. **Static Pages Only**:
   - The plugin only fetches raw HTML through an HTTP GET request and does not execute client-side JavaScript. For dynamic single-page applications (SPAs built with React, Vue, Angular, etc.), it may only return an empty shell or container.
2. **Request Timeout**:
   - The default HTTP request timeout is **30 seconds (30000ms)**. If the target website responds slowly, experiences network issues, or triggers anti-bot rate limits, the request will throw an error.
3. **Content Size Limit**:
   - The maximum allowable content size for a single request is **20 MB** (`serviceRequestMaxContentLength = 20 * 1024 * 1024`). Requests exceeding this limit are rejected to prevent server out-of-memory errors.
4. **Anti-Scraping & Authentication Restrictions**:
   - Websites protected by strict anti-scraping mechanisms (e.g., Cloudflare Turnstile/5-second challenge, CAPTCHA, strict User-Agent validation) or requiring login authentication may return 403 Forbidden or challenge pages.
