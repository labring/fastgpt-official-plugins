# Volcano Engine SearchInfinity

Volcano Engine SearchInfinity is an advanced web search plugin built upon ByteDance's powerful search capabilities. Designed specifically for Large Language Models (LLMs) and FastGPT agent workflows, it provides massive index coverage, intelligent web retrieval, domain whitelist filtering, time-range controls, and deep AI-powered web summarization. It empowers AI agents to retrieve timely information, verify factual references, and significantly mitigate hallucinations.

---

## Typical Application Scenarios

- **Real-Time Web News and Trends Retrieval**: Quickly track breaking news, industry developments, and policy updates, combined with the `time_range` filter to acquire timely information.
- **Targeted Authoritative Source Search**: Restrict queries to government portals (`gov.cn`), educational and research institutions (`edu.cn`), or authoritative official media via the `sites` whitelist filter to ensure high reliability.
- **Knowledge Base RAG Fact Augmentation**: Integrate as an external search engine within Retrieval-Augmented Generation (RAG) pipelines to supplement verifiable facts when private knowledge bases have low confidence or lack coverage.
- **AI-Powered Deep Summaries**: Enable `web_summary` search mode to receive server-side AI-distilled deep text summaries, eliminating the need for downstream LLMs to parse lengthy web pages.

---

## Secret & Credential Configuration

This plugin supports **dual authentication modes**: direct `apiKey` authentication or Volcengine `AK/SK` pair authentication (**choose either one**).

Configure the credentials under the plugin's **Global Variables / Secrets** settings in FastGPT:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | String (`string`) | Optional (One of two) | SearchInfinity Open Platform API key. Required when using direct API key authentication; sent as a Bearer Token to the direct gateway. |
| `volcengineAccessKey` | String (`string`) | Optional (One of two) | Volcengine Access Key ID. Used in conjunction with `volcengineSecretKey` when authenticating against the Volcengine official gateway. |
| `volcengineSecretKey` | String (`string`) | Optional (One of two) | Volcengine Secret Access Key. Used in conjunction with `volcengineAccessKey` when authenticating against the Volcengine official gateway. |

### Dual Authentication Modes

1. **Mode 1: API Key Direct Authentication (Recommended for Lightweight Integration)**
   - **Configuration**: Fill in `apiKey` only; leave `volcengineAccessKey` and `volcengineSecretKey` empty.
   - **Gateway Endpoint**: `https://open.feedcoopapi.com/search_api/web_search`.
   - **Authentication Mechanism**: Passes `Authorization: Bearer <apiKey>` and `X-Traffic-Tag: fast_gpt_search_web` in the request headers.
   - **How to Obtain**: Contact the official partner channel or refer to the [Volcano Engine SearchInfinity Integration Wiki](https://bytedance.larkoffice.com/wiki/IBdwwBuBAiXlclkqExDcqdMinpg).

2. **Mode 2: Volcengine AK/SK Signature Authentication (Recommended for Enterprise Cloud-Native)**
   - **Configuration**: Fill in both `volcengineAccessKey` and `volcengineSecretKey`; leave `apiKey` empty.
   - **Gateway Endpoint**: Official Volcengine API Gateway `https://mercury.volcengineapi.com/?Action=WebSearch&Version=2025-01-01`.
   - **Authentication Mechanism**: Dynamically signs requests with standard AWS-like HMAC-SHA256 signatures (Service: `volc_torchlight_api`, Region: `cn-north-1`).
   - **Application Guide**:
     1. Register and sign in to the [Volcengine Console](https://console.volcengine.com/).
     2. Navigate to the [Identity and Access Management (IAM) - Key Management](https://console.volcengine.com/iam/keymanage/) page.
     3. Create or locate your Access Key ID and Secret Access Key.
     4. Ensure that the account or IAM user has been granted access to the SearchInfinity / Web Search service.

---

## Input Parameters

| Parameter | Type | Required | Default | Allowed Range | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `query` | String (`string`) | Yes | None | 1 ~ 100 chars | **Search query**. The natural language question or keyword phrase to search for. Must not exceed 100 characters. |
| `count` | Number (`number`) | No | `10` | `1` ~ `50` | **Result count**. Number of search results to return. Defaults to 10; up to 50. |
| `searchType` | Enum String (`enum`) | No | `web` | `web` \| `web_summary` | **Search type mode**:<br>• `web`: Standard web search mode returning core page content and contextual snippets;<br>• `web_summary`: Deep summary mode (NeedSummary enabled), returning high-density AI summaries extracted by the server-side model. |
| `sites` | String (`string`) | No | `""` | Up to 5 domains | **Domain whitelist filter**. Restricts search results to specified domains. Separate multiple domains with vertical bars `\|`. **Supports up to 5 domains** (excess domains are automatically truncated). Example: `qq.com\|m.163.com`. Do not include `http://` or `https://` prefixes. |
| `time_range` | Enum String (`enum`) | No | Unlimited | `OneDay` \| `OneWeek` \| `OneMonth` \| `OneYear` | **Time range filter**. Restricts search results to pages published within a specific time window:<br>• `OneDay`: Past 24 hours (1 day)<br>• `OneWeek`: Past 1 week<br>• `OneMonth`: Past 1 month<br>• `OneYear`: Past 1 year |

---

## Output Results

Upon successful execution, the plugin returns a top-level object containing a `result` array. When execution fails, an `error` description is returned.

| Field | Type | Description |
| :--- | :--- | :--- |
| `result` | Array of Objects (`Array<Object>`) | List of structured search result items. |
| `error` | String (`string`) | Optional. Error description if execution or validation fails. |

### `result` Item Structure

| Field | Type | Description |
| :--- | :--- | :--- |
| `Title` | String (`string`) | Title of the web page. |
| `Content` | String (`string`) | Main content of the result (merged in priority order: page Content > AI Summary > contextual Snippet). |
| `Url` | String (`string \| null`) | Full URL link to the target web page. |
| `SiteName` | String (`string \| null`) | Source website name (e.g., "Xinhua", "GitHub", "Reuters"). |
| `PublishTime` | String (`string \| null`) | Publication timestamp or formatted date string. |
| `LogoUrl` | String (`string \| null`) | Source website logo / icon URL. |
| `AuthInfoDes` | String (`string \| null`) | Source attribution, authority, or certification information (if available). |

### Output JSON Example

```json
{
  "result": [
    {
      "Title": "FastGPT - Next-Generation LLM Knowledge Base & Workflow Platform",
      "Content": "FastGPT is an AI platform built on Large Language Models, providing out-of-the-box data vectorization, complex visual workflow orchestration, and multi-source retrieval capabilities. It seamlessly connects with search engines like Volcano Engine and various third-party models to build enterprise-grade Q&A and AI agents.",
      "Url": "https://fastgpt.in",
      "SiteName": "FastGPT Official",
      "PublishTime": "2025-02-20 10:30:00",
      "LogoUrl": "https://fastgpt.in/favicon.ico",
      "AuthInfoDes": "Official Verification"
    },
    {
      "Title": "Volcano Engine Open Platform Integration Guide and Best Practices",
      "Content": "Volcano Engine provides enterprise customers with high-concurrency, low-latency SearchInfinity services. It supports API Key and IAM role signature authentications, covering mainstream authoritative portals and vertical information sources.",
      "Url": "https://www.volcengine.com/docs/search",
      "SiteName": "Volcano Engine",
      "PublishTime": "2025-02-18 16:45:00",
      "LogoUrl": "https://www.volcengine.com/favicon.ico",
      "AuthInfoDes": "Verified Enterprise"
    }
  ]
}
```

---

## Typical Workflow Orchestration Example

In FastGPT, `searchInfinity` is commonly used to construct high-reliability "Web RAG (Retrieval-Augmented Generation)" workflows:

```
[User Inquiry]
       │
       ▼
[Front-end LLM: Intent & Keyword Extraction]
       │ (Outputs refined query within 100 characters)
       ▼
[Volcano SearchInfinity Tool Node]
       │ (Inputs query, searchType, sites; outputs result)
       ▼
[Downstream LLM: Citation-Backed Response]
       │
       ▼
[Final Answer Output]
```

### Orchestration Steps

1. **Front-End LLM Intent & Query Extraction**:
   - Receive the user's inquiry (e.g., "What are the latest state council policies supporting the AI industry?").
   - The front-end LLM determines if web search is needed, extracts a concise query (e.g., `State Council Artificial Intelligence Policy`), and optionally injects a domain filter (e.g., `sites: "gov.cn"`).
   - **Note**: Because the search plugin enforces a 100-character limit on `query`, having an upstream LLM summarize or refine queries prevents validation errors on long inputs.

2. **Configure searchInfinity Tool Node**:
   - Add the **Volcano SearchInfinity** tool node.
   - Configure input parameters:
     - `query`: Bound to the query variable from the preceding LLM.
     - `searchType`: Select `web_summary` for higher-density AI summaries.
     - `count`: Set between `5` and `10` depending on context token limits.
     - `sites`: Optionally set to `gov.cn|xinhuanet.com` for authoritative sources.

3. **Downstream LLM Synthesis with Citations**:
   - Pass `searchInfinity.result` as context into the downstream LLM node.
   - Example prompt template:

```text
You are a professional AI research assistant. Please answer the user's question based strictly on the authoritative reference sources retrieved via Volcano Engine SearchInfinity.

### Reference Sources:
{{searchInfinity.result}}

### Guidelines:
1. Ground your answer strictly on the reference sources above; do not invent unmentioned facts or figures.
2. Structure your response logically with clear highlights.
3. When referencing key facts or statistics, cite the source using Markdown links in the format: [Title](Url).
4. If the references do not contain enough information to address the question, state so objectively.

User Question: {{input.question}}
```

---

## Important Considerations

1. **Dual Authentication Constraints**:
   - You must provide either `apiKey`, or both `volcengineAccessKey` and `volcengineSecretKey`. Missing all credentials will cause the plugin to abort with an authentication configuration error.
2. **Query Character Length Limitation**:
   - `query` is strictly constrained to **1 to 100 characters**. Exceeding this limit will cause Zod validation to fail immediately. Refine verbose inputs with an upstream LLM node.
3. **Domain Whitelist Limit and Formatting**:
   - `sites` supports a maximum of **5 domains**. Any excess domains will be automatically truncated.
   - Separate multiple domains with a vertical bar `|`. Provide pure domain names only (e.g., `xinhuanet.com|gov.cn`); do not prepend `http://` or `https://`, and do not append paths.
4. **Result Count Limits**:
   - `count` must be an integer between `1` and `50`. Defaults to `10`.
5. **Time Range Case Sensitivity**:
   - `time_range` is case-sensitive. Valid values are exclusively `OneDay`, `OneWeek`, `OneMonth`, and `OneYear`.
6. **Network Connectivity and Service Activation**:
   - When using the API Key mode, verify that the host environment can reach `https://open.feedcoopapi.com`.
   - When using Volcengine AK/SK mode, ensure outbound network access to `https://mercury.volcengineapi.com` and verify that the target SearchInfinity service is activated in your Volcengine account console.
