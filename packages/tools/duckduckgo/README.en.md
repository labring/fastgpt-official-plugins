# DuckDuckGo Search Tool Suite

The DuckDuckGo Service is a versatile, privacy-focused search tool suite for FastGPT. It integrates DuckDuckGo's web, image, news, and video search capabilities, providing AI agents and workflows with a real-time, comprehensive channel to access external information.

## Core Advantages & Use Cases

### Core Advantages
- **No API Key & Zero Configuration**: Ready to use out of the box with no registration or API keys required.
- **Privacy Protection & No Tracking**: DuckDuckGo does not track user searches or personal data, safeguarding search privacy for individuals and enterprises.
- **Comprehensive Multimodal Search**: Includes 4 dedicated tools (web, image, news, and video) covering diverse search scenarios.
- **Built-in Resilience & Backoff**: Includes up to 3 automatic retries with randomized backoff delay (0-5s) to handle intermittent network fluctuations.
- **Default Strict SafeSearch**: Strict filtering is enabled by default (`SafeSearchType.STRICT`) to filter adult and sensitive content, delivering safe and reliable results.

### Use Cases
- **AI Web Search Grounding (RAG)**: Dynamically fetch fresh web pages, facts, and reference materials during question answering or content generation.
- **Real-Time News Tracking**: Track breaking industry news, policy updates, and technological advancements via the news search tool.
- **Multimodal Content Discovery**: Equip agents with the capability to search for high-resolution images or videos based on conversational context.
- **Cost-Free Search Alternative**: Serve as a cost-effective alternative to commercial search engine APIs, ideal for prototyping, testing, and low-to-medium traffic applications.

---

## Tool Suite Overview

| Tool ID | Tool Name | Description |
| :--- | :--- | :--- |
| `search` | DuckDuckGo Network Search | Search the web using DuckDuckGo to obtain relevant page titles, links, and snippets |
| `searchImg` | DuckDuckGo Image Search | Search images on DuckDuckGo to retrieve direct image URLs and titles |
| `searchNews` | DuckDuckGo News Search | Search up-to-date news articles on DuckDuckGo to get article titles, excerpts, and URLs |
| `searchVideo` | DuckDuckGo Video Search | Search video resources on DuckDuckGo to get video titles, descriptions, and watch links |

---

## Parameter & Output Specification

### 1. Web Search (`search`)

Searches the web via DuckDuckGo, returning up to 10 relevant results from the past year.

#### Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | string | Yes | - | Terms to search for. |

#### Output Results

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `result` | string | Results returned by the web search, formatted as a JSON string array. |

**Output Example (parsed `result`):**
```json
[
  {
    "title": "FastGPT - Knowledge Base Platform based on LLM",
    "link": "https://fastgpt.in",
    "snippet": "FastGPT is an enterprise-grade LLM-based knowledge platform providing ready-to-use data preprocessing, workflow orchestration..."
  }
]
```

---

### 2. Image Search (`searchImg`)

Searches images on DuckDuckGo, returning up to 10 relevant image items.

#### Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | string | Yes | - | Terms to search for images. |

#### Output Results

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `result` | string | Results returned by the image search, formatted as a JSON string array. |

**Output Example (parsed `result`):**
```json
[
  {
    "title": "FastGPT Architecture Overview",
    "image": "https://example.com/images/fastgpt-architecture.png"
  }
]
```

---

### 3. News Search (`searchNews`)

Searches news articles published by major news outlets on DuckDuckGo, returning up to 10 recent stories.

#### Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | string | Yes | - | Terms to search for news. |

#### Output Results

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `result` | string | Results returned by the news search, formatted as a JSON string array. |

**Output Example (parsed `result`):**
```json
[
  {
    "title": "Latest Open Source LLM Releases and Ecosystem Evolution",
    "excerpt": "Open-source AI communities today unveiled next-generation lightweight reasoning models...",
    "url": "https://example.com/news/open-source-llm-breakthrough"
  }
]
```

---

### 4. Video Search (`searchVideo`)

Searches video hosting platforms via DuckDuckGo, returning up to 10 video items.

#### Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | string | Yes | - | Terms to search for videos. |

#### Output Results

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `result` | string | Results returned by the video search, formatted as a JSON string array. |

**Output Example (parsed `result`):**
```json
[
  {
    "title": "FastGPT 5-Minute Quickstart Tutorial: Building a Knowledge Base",
    "description": "Step-by-step guide to deploying FastGPT, connecting vector knowledge bases, and configuring workflow plugins...",
    "url": "https://www.youtube.com/watch?v=example"
  }
]
```

---

## Usage Example & Workflow Integration

### Using in FastGPT Tool Nodes
Add a Tool node in FastGPT's Advanced Orchestration and select the desired DuckDuckGo child tool (e.g., `DuckDuckGo Network Search`):

1. **Input Configuration**: Bind the LLM-extracted search keywords (e.g., `"FastGPT plugin development guide"`) to `query`.
2. **Context for LLM**: After execution, the `result` field yields JSON stringified search results, which can be fed into a downstream LLM node with a prompt such as:
   ```text
   Please answer the user's question based on the following web search reference results from DuckDuckGo:
   {{search.result}}
   ```
3. **Structured Parsing (Optional)**: If you need to present specific images or URLs in an interactive card, use a "Code Execution" node with `JSON.parse(result)` to extract properties like `image` or `url`.

---

## Important Notes

1. **Network Connectivity & Region Availability**:
   - DuckDuckGo services may be inaccessible in certain countries and regions (such as mainland China). Ensure that the deployment environment hosting FastGPT or the plugin container has direct network access to DuckDuckGo endpoints.
2. **Key-Free Usage & Rate Limiting**:
   - This tool suite queries public web endpoints without requiring an API key. However, high-frequency concurrent requests can trigger upstream rate limiting (HTTP 429 / 403). Avoid burst concurrent queries in production workloads.
3. **Error Handling & Automatic Retries**:
   - The plugin includes 3 built-in retry attempts with randomized backoff delays (0-5s) per request. If all retries fail, an error text is returned in `result` rather than crashing the workflow instance.
4. **SafeSearch Policy**:
   - All child tools enable `SafeSearchType.STRICT` by default, effectively filtering adult and sensitive content for enterprise-grade safety.
5. **Result Limit & Token Optimization**:
   - Each query caps returned items at 10 to maintain an optimal balance between rich search context and LLM token budget.
