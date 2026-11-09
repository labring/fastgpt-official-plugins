# Perplexity Tool Set

Perplexity is an industry-leading conversational AI search engine and information retrieval platform. This tool set equips FastGPT agents and workflows with real-time web search and precise snippet summarization capabilities. Powered by Perplexity's robust search APIs, it retrieves time-sensitive information, authoritative web sources, and fact-based context with citations, significantly improving answer accuracy and mitigating LLM hallucinations.

---

## Typical Application Scenarios

- **Pre-Retrieval for Real-Time Q&A**: When answering queries regarding breaking news, recent events, or unknown domains, the agent invokes Perplexity first to retrieve up-to-date facts from the live web.
- **Tech and Current News Retrieval**: Quickly track bleeding-edge tech advancements, industry trends, open-source developments, and policy updates to obtain first-hand references.
- **High-Quality Cited Source Acquisition**: Automatically extracts page titles, full URLs, and contextual snippets, enabling downstream LLMs to generate answers with verifiable source citations.
- **Knowledge Base RAG Augmentation**: Serves as an external web search source for hybrid retrieval and supplementary knowledge when the private vector knowledge base lacks sufficient confidence or coverage.

---

## Secret Configuration

Using this tool set requires a Perplexity API Key (`apiKey`).

### How to Obtain an API Key

1. Visit the [Perplexity API Settings](https://www.perplexity.ai/settings/api).
2. Sign in or register a Perplexity account.
3. In the **API Settings** page, set up payment/billing information if required.
4. Under the **API Keys** section, click **Generate** to create a new API Key (typically in `pplx-...` format).
5. Copy and securely store your API Key.

### Configuration in FastGPT

Configure the following field under the plugin's **Secrets** section in FastGPT:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | String (`string`) | Yes | Perplexity API Key. Used for bearer authentication when calling Perplexity official search endpoints. |

---

## Sub-tools List

| Sub-tool ID | Sub-tool Name | Description |
| :--- | :--- | :--- |
| `findResults` | Network Search | Real-time web search and precise snippet retrieval. Search the web with Perplexity and return structured results with citations. |

---

## Parameters and Output

### Network Search (`findResults`)

Searches the live web via Perplexity based on the given query, returning relevance-ranked page titles, URLs, and text snippets.

#### Input Parameters

| Parameter | Type | Required | Default | Allowed Range | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `query` | String (`string`) | Yes | None | Length > 0 | **Search Query**. The keyword or natural language question to search for on the web. |
| `max_results` | Number (`number`) | No | `10` | `1` ~ `20` | **Maximum Results**. Maximum number of search results to return. Defaults to 10; up to 20. |

#### Output Results

| Field | Type | Description |
| :--- | :--- | :--- |
| `result` | Array of Objects (`Array<Object>`) | List of structured search results returned by Perplexity web search. |

**`result` Item Structure:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | String (`string`) | Search result page title. |
| `url` | String (`string`) | Full URL link to the target web page. |
| `snippet` | String (`string`) | Short excerpt / context snippet of the web page content. |

#### Output Example (`result`)

```json
{
  "result": [
    {
      "title": "FastGPT - LLM-based Knowledge Base Platform",
      "url": "https://fastgpt.in",
      "snippet": "FastGPT is a knowledge base platform built on large language models, providing out-of-the-box data processing, workflow orchestration..."
    },
    {
      "title": "FastGPT Official Documentation & Plugins",
      "url": "https://doc.fastgpt.in",
      "snippet": "Learn more about the FastGPT plugin system and tool node orchestration, supporting integrations with Perplexity, Tavily, Google, and more..."
    }
  ]
}
```

---

## Typical Workflow Orchestration Example

This tool set is commonly used to construct a "Web-augmented RAG (Retrieval-Augmented Generation)" pipeline:

```
[User Query]
   │
   ▼
[LLM Node: Intent Recognition & Keyword Extraction]
   │ (Outputs extracted query)
   ▼
[Perplexity Tool Node: findResults]
   │ (Outputs search results)
   ▼
[Downstream LLM Node: Citation-backed Response]
   │
   ▼
[Output Final Answer]
```

### Orchestration Steps

1. **LLM Intent & Query Extraction**:
   - Receive the user's inquiry (e.g., "What are the latest key features in recent FastGPT releases?").
   - A front-end LLM assesses whether external web retrieval is required and refines the question into an optimized search keyword (e.g., `query: "FastGPT release notes updates"`).

2. **Perplexity Search Tool Node**:
   - Add the **Network Search (`findResults`)** node under the **Perplexity Tool Set**.
   - Parameter configuration:
     - `query`: Bound to the search query variable generated by the preceding LLM.
     - `max_results`: Set between `5` and `10` to balance comprehensiveness with token consumption.

3. **Downstream LLM with Citations**:
   - Pass `findResults.result` as context into the downstream LLM node.
   - Example prompt template:

```text
You are a professional AI assistant. Please answer the user's question based strictly on the following reference sources retrieved via Perplexity.

### Reference Sources:
{{findResults.result}}

### Response Guidelines:
1. Ground your answers strictly on the reference sources above; do not fabricate unmentioned facts.
2. Structure your response clearly with key takeaways highlighted.
3. After stating key facts or data points, provide verifiable source citations using Markdown links, formatted as: [Title](URL).
4. If the references do not contain enough information to answer the question, state so honestly.

User Question: {{input.question}}
```

---

## Considerations & Notes

1. **API Billing & Quota**:
   - Using the Perplexity API consumes credits according to Perplexity's official pricing policy. Ensure your account balance is sufficient or linked to a valid payment method.
   - Appropriately tune `max_results` (e.g., 5 to 10) in your workflow to avoid excessive token overhead and unnecessary costs.
2. **Network Connectivity Requirements**:
   - Perplexity API endpoints are hosted at `https://api.perplexity.ai`. The host or container running FastGPT must have outbound internet connectivity to this domain.
   - If deploying in an isolated network environment, ensure an egress proxy or gateway is properly configured.
3. **Parameter Constraints**:
   - `max_results` must fall within the range `1` to `20`. Supplying a value outside this range will trigger input validation errors.
4. **Secret Security**:
   - API keys are sensitive credentials. Store them exclusively in FastGPT's Secrets management, and avoid exposing them in public prompts or execution logs.
