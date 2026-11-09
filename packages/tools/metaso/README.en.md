# Metaso AI Search Tool Set

Metaso AI Search is a next-generation intelligent search engine developed by Shanghai Metaso Network Technology Co., Ltd., widely recognized for its "Ad-free, straight to results" philosophy and precise structured summaries. This plugin provides native Metaso AI search integration for FastGPT agents and workflows. It supports multi-dimensional vertical search across web pages, professional documents, academic publications, images, videos, and podcasts, along with high-quality AI-generated long-form summaries, delivering fresh, accurate, and traceable structured knowledge to downstream Large Language Models (LLMs).

## Typical Application Scenarios

- **Deep Academic & Research Report Retrieval**: By setting the search scope to `scholar` (academic papers) or `document` (research reports and whitepapers), agents can rapidly retrieve peer-reviewed journal papers, theses, and industry reports with structured author lists, publication dates, and key takeaways, empowering automated literature reviews and market research.
- **Cross-Domain Vertical Web Search**: Beyond standard web search, the plugin supports vertical multimedia retrieval including images (`image`), videos (`video`), and podcasts (`podcast`), meeting cross-media content sourcing, research, and analysis needs.
- **High-Quality Multi-Source Fact Checking**: Leveraging Metaso's rigorous content filtering against SEO spam and content farms, the plugin delivers authoritative links and citations for retrieval-augmented generation (RAG) and multi-angle verification, significantly reducing LLM hallucinations.
- **Enhanced Chinese Semantic Search**: Powered by proprietary models deeply optimized for Chinese natural language nuances, Metaso accurately captures complex long queries, implicit user intents, and domain-specific terminology, overcoming the limitations of traditional keyword matching on long-tail queries.

---

## Secret Configuration

To use this plugin, you must configure the Metaso API key (`apiKey`) under the plugin's **Secrets** settings in FastGPT.

### How to Obtain an API Key

1. Visit and log in to the [Metaso Official Website](https://metaso.cn) or Metaso Developer Open Platform.
2. Navigate to the Developer Console or API Credentials management page.
3. Apply for and create a new API Key, then copy the generated secret string.
4. Securely store the key and fill it into the `apiKey` field in the FastGPT plugin configuration or workflow node.

### Secret Configuration Fields

| Field Name | Type | Sensitive | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | String (`string`) | Yes (`isSecret: true`) | Yes | Metaso Open Platform API Key. Passed as a Bearer Token in the HTTP Authorization header (`Authorization: Bearer <apiKey>`) for request authentication. |

---

## Sub-tools List

This tool set contains the following child tool:

| Tool ID (`id`) | Tool Name | Description |
| :--- | :--- | :--- |
| `metasoSearch` | Metaso Search | Search the web using the Metaso API across multiple content scopes, optionally including AI-generated summaries. |

---

## Input Parameters (`metasoSearch`)

| Parameter | Type | Default | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | String (`string`) | None | Yes | **Search query**. The keywords, phrases, or natural language questions to search for. Leading and trailing whitespace will be automatically trimmed. |
| `scope` | Enum String (`string`) | `all` | No | **Content scope to search**. Available options:<br>• `all`: All content types (comprehensive search, default)<br>• `webpage`: General web pages and news articles<br>• `document`: Professional documents, industry reports, and public document repositories<br>• `scholar`: Academic papers, journals, and scholarly publications<br>• `image`: Image multimodal search<br>• `video`: Video content and multimedia streaming sources<br>• `podcast`: Podcasts and audio broadcast programs |
| `size` | Number (`number`) | `20` | No | **Result count**. Allowed range: integer between `1` and `20`. Defaults to `20`. |
| `includeSummary` | Boolean (`boolean`) | `true` | No | **Include AI summary**. Defaults to `true`. When enabled (`true`), the Metaso model generates a dense, comprehensive summary of the core content; when disabled (`false`), only basic contextual snippets are returned. |

---

## Output Results

Upon successful execution, the plugin returns a top-level object containing a `result` array. If the API returns an error or no matching results are found, an error will be thrown.

| Field | Type | Description |
| :--- | :--- | :--- |
| `result` | Array of Objects (`Array<Object>`) | List of structured search results. Attributes vary depending on the chosen `scope`. |

### `result` Item Structure Breakdown

Depending on the `scope` parameter, individual result objects contain the following fields:

| Field | Type | Applicable Scope (`scope`) | Description |
| :--- | :--- | :--- | :--- |
| `title` | String (`string`) | All (`all`, `webpage`, `document`, `scholar`, `image`, `video`, `podcast`) | Title or name of the search result resource. |
| `link` | String (`string`) | `all`, `webpage`, `document`, `scholar`, `video`, `podcast` | Original URL to access the web page, document, paper, or media entry. |
| `snippet` | String (`string`) | All except `image` | Plaintext snippet highlighting context around matched keywords. |
| `summary` | String (`string`) | `all`, `webpage`, `document`, `scholar` | AI-generated long-form core summary (returned when `includeSummary: true`). |
| `authors` | Array of Strings (`string[]`) | `all`, `webpage`, `scholar`, `video`, `podcast` | Authors, organizations, creators, or publishing channels. |
| `date` | String (`string`) | `all`, `webpage`, `scholar`, `video`, `podcast` | Publication date or release timestamp (e.g., `2024-05-18`). |
| `imageUrl` | String (`string`) | `image` | Direct image URL returned in image search mode. |
| `coverImage` | String (`string`) | `video` | Video thumbnail cover URL returned in video search mode. |

### Response Examples (JSON)

#### 1. Webpage / Academic / Document Search Example (`scope: "webpage" | "scholar" | "document"`)

```json
{
  "result": [
    {
      "title": "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
      "link": "https://arxiv.org/abs/2501.12948",
      "snippet": "We introduce DeepSeek-R1-Zero and DeepSeek-R1, trained via large-scale reinforcement learning...",
      "summary": "The DeepSeek-R1 paper details the methodology of unlocking complex reasoning capabilities in large language models through pure reinforcement learning (RL), achieving strong mathematical reasoning and code generation performance without extensive supervised fine-tuning data.",
      "authors": ["Daya Guo", "Dejian Yang", "Haowei Zhang", "Chenggang Zhao"],
      "date": "2025-01-22"
    }
  ]
}
```

#### 2. Multimedia Video Search Example (`scope: "video"`)

```json
{
  "result": [
    {
      "title": "In-Depth Breakdown of Embodied AI and Humanoid Robotics",
      "link": "https://www.youtube.com/watch?v=sample_video_id",
      "snippet": "This video explores end-to-end foundation models and real-time locomotion control algorithms in next-generation humanoid robots...",
      "authors": ["Tech Insights Lab"],
      "date": "2024-11-10",
      "coverImage": "https://example.com/thumbnails/robotics_cover.jpg"
    }
  ]
}
```

---

## Typical Workflow Orchestration Example

### Scenario: Generating an In-Depth Research Report with Downstream LLMs

In a FastGPT advanced orchestration workflow, Metaso Search can act as a high-confidence external knowledge source connected to a downstream reasoning model to compose structured research reports:

```
[User Question]
   ↓
[Intent Analysis & Query Rewriting (LLM Node)]
   ↓ (Output refined keywords and scope, e.g., query: "Solid-state battery commercialization bottlenecks", scope: "document")
[Metaso AI Search (metasoSearch Node)]
   ↓ (Retrieve authoritative reports and AI-generated core summaries)
[Report Generation LLM (LLM Node)]
   ↓ (Synthesize findings, credit authors & dates, cite sources, and generate structured report)
[Final Report Output (Response Node)]
```

#### Node Configuration and Prompt Reference

1. **Metaso Search Node Input Configuration**:
   - **`query`**: `{{IntentAnalysis.query}}` (e.g., `"Solid-state battery technology roadmap and mass production progress"`)
   - **`scope`**: `"document"` (or `"scholar"`)
   - **`size`**: `6`
   - **`includeSummary`**: `true`

2. **Report Generation LLM Node System Prompt**:
   ```markdown
   You are a senior industry research analyst. Please synthesize the following authoritative source materials retrieved via Metaso AI Search to write a structured, in-depth research report.

   [Source Materials]:
   {{#each metasoSearch.result}}
   [{{@index + 1}}] Title: {{title}}
   Link: {{link}}
   Date: {{date}} | Authors/Institutions: {{authors}}
   Key Summary: {{summary}}
   ---
   {{/each}}

   [Writing Guidelines]:
   1. The report must contain: Industry Overview, Technical Route Comparison, Key Commercialization Bottlenecks & Timeline, and Future Outlook.
   2. When citing specific figures or facts, include reference citations (e.g., [1], [2]).
   3. Provide a unified "References & Source Reports" section at the end.
   ```

---

## Important Notes

1. **API Key Security**: Securely store your `apiKey` in FastGPT's Secrets settings. Never commit or expose plain API keys to public repositories or unauthorized personnel.
2. **Rate Limits and Quotas**: The Metaso Open Platform imposes QPS (queries per second) limits and account balance quotas. In high-concurrency or batch-processing scenarios, ensure you throttle request rates and handle retries gracefully in your workflows.
3. **Network Connectivity**: The plugin calls the official Metaso OpenAPI endpoint (`https://metaso.cn/api/v1/search`). If FastGPT runs in private network environments or on-premise containers, ensure that outbound HTTPS traffic to `metaso.cn` (port 443) and public DNS resolution are available.
4. **Scope-Dependent Output Fields**: Returned fields vary depending on the selected `scope` (e.g., `image` returns `imageUrl`, whereas `video` returns `coverImage`). Adapt downstream extraction logic accordingly.
5. **Context Window & Token Management**: When `includeSummary` is set to `true` and `size` is set to a higher value (close to the maximum of 20), the returned summary data can be voluminous. Configure `size` reasonably (typically 5–10 items) to strike the right balance between retrieval depth and LLM context token usage.

---

## Local Development & Testing

Run the following commands within the plugin directory (`packages/tools/metaso`):

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm run test

# Build production artifacts
pnpm run build

# Validate plugin specification and bundle format
npx @fastgpt-plugin/cli check --entry .

# Package into a .pkg distribution archive
pnpm run pack
```
