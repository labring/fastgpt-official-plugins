# Google Search

The Google Search plugin is a high-performance web retrieval tool built upon the official Google Custom Search JSON API and Google Programmable Search Engine. It brings world-class real-time web search capabilities to FastGPT agents and workflows, empowering Large Language Models (LLMs) to overcome knowledge cutoff limitations and access authoritative, timely, and accurate internet information sources.

## Typical Application Scenarios

- **Global Multilingual Real-Time Retrieval**: Leverage Google's global web index and deep multilingual understanding to retrieve breaking international news, industry trends, scientific research developments, and multilingual technical documentation.
- **Authoritative Source Retrieval for Specific Industries & Sites**: Utilize the targeted filtering and scoping capabilities of Google Programmable Search Engine to constrain queries to authoritative industry portals, official documentation sites, or academic databases, eliminating noise from content farms and marketing spam.
- **Fact-Checking & Hallucination Mitigation for RAG**: Dynamically inject the latest verified web sources and traceable citations into FastGPT agent conversations, significantly mitigating model hallucinations and improving answer trustworthiness.

---

## Secrets & Configuration Guide

Using this plugin requires configuring your Google Cloud API key (`key`) and Google Programmable Search Engine ID (`cx`) under the FastGPT plugin's Secrets settings.

### Configuration Parameters

| Parameter | Type | Sensitive | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `key` | String (`string`) | Yes (`isSecret: true`) | Yes | Google Cloud Platform API key used for authenticating requests to the Google Custom Search JSON API. |
| `cx` | String (`string`) | No (`isSecret: false`) | Yes | Google Programmable Search Engine ID specifying the target search engine and its search scope. |

### How to Obtain Required Credentials

#### 1. Obtain a Google Cloud API Key (`key`)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and sign in.
2. Select an existing project or click **New Project** in the top navigation bar to create a dedicated project (e.g., `fastgpt-search`).
3. In the left navigation menu, go to **APIs & Services > Library**.
4. In the API Library search box, search for `Custom Search API`, locate the service, and click **Enable**.
5. Once enabled, navigate to **APIs & Services > Credentials** and click **+ CREATE CREDENTIALS > API key** at the top.
6. A dialog will display the generated API key. Copy this string to use as `key`.
7. *(Optional but strongly recommended)* To secure your key against unauthorized usage, click the generated key to edit its settings, choose **Restrict key** under **API restrictions**, select **Custom Search API** exclusively from the dropdown list, and save changes.

#### 2. Create and Obtain a Programmable Search Engine ID (`cx`)

1. Go to the [Google Programmable Search Engine Control Panel](https://programmablesearchengine.google.com/controlpanel/all) and sign in.
2. Click the **Add** button in the upper-left corner to create a new search engine instance.
3. Configure the search engine details:
   - **Name**: Enter an identifiable name (e.g., `FastGPT Web Search`).
   - **What to search**:
     - **For searching the entire web**: Enter a placeholder URL (e.g., `www.google.com`) under "Sites to search". After creation, open the search engine's **Overview** page, toggle the **Search the entire web** option to **ON**, and then delete the placeholder URL from the "Sites to search" section below.
     - **For targeted site search**: Enter the specific website domains you wish to search (e.g., `docs.fastgpt.in`, `github.com`) directly under "Sites to search". Multiple domains can be added.
4. Click **Create**.
5. Once created, locate the **Search engine ID** on the **Overview** page and copy the string (usually in a format like `a1b2c3d4e5f6g7h8i` or with custom prefixes). This value is your `cx`.

---

## Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `query` | String (`string`) | Yes | None | **Search query**. The search terms or phrases to look up on Google. Supports both natural language questions and advanced search operators. |

### Query Best Practices & Optimization

1. **Extract Core Keywords**: Avoid passing lengthy, conversational user prompts directly into `query`. In your FastGPT workflow, use an upstream LLM node to extract 2–4 concise, high-value keywords (e.g., rephrase *"How do I deploy FastGPT locally on Ubuntu using Docker Compose?"* into *"FastGPT Ubuntu Docker Compose deployment"*).
2. **Utilize Google Advanced Search Operators**: The engine supports Google's native search syntax for heightened precision:
   - `site:domain.com`: Restrict search results to a specific domain (e.g., `site:github.com fastgpt plugins`).
   - `filetype:pdf`: Filter for specific file extensions (e.g., `filetype:pdf LLM fine-tuning guide`).
   - `"exact match"`: Enclose phrases in quotes for literal, verbatim matching.
   - `-term`: Exclude results containing specific keywords (e.g., `Python tutorial -csdn`).
   - `OR` or `|`: Perform a logical OR query (e.g., `FastGPT Docker OR Kubernetes`).

---

## Output Results

Upon successful execution, the plugin returns a top-level object whose `result` property contains the raw response payload returned by the Google Custom Search JSON API.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `result` | Object (`Record<string, unknown>`) | The response object returned by Google Custom Search API, containing search metadata, execution time, and matched web page items. |

### Core `result` Structure Breakdown

The `result` object contains the following primary fields:

| Field Path | Type | Description |
| :--- | :--- | :--- |
| `searchInformation.searchTime` | Number (`number`) | The execution time of the search request (in seconds). |
| `searchInformation.totalResults` | String (`string`) | The estimated total number of matching web results found. |
| `items` | Array of Objects (`Array<Object>`) | The list of matching web search results. |

#### Key Attributes in Each `items` Entry

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `title` | String (`string`) | The title of the web page in plain text. |
| `htmlTitle` | String (`string`) | The web page title containing HTML highlighting tags for query matches. |
| `link` | String (`string`) | The full target URL of the web page. |
| `displayLink` | String (`string`) | The root domain name displayed for the result (e.g., `fastgpt.in`, `github.com`). |
| `snippet` | String (`string`) | Plain-text excerpt showing context around query matches within the web page. |
| `htmlSnippet` | String (`string`) | HTML-formatted context snippet containing `<b>` highlighting tags. |
| `pagemap` | Object (`Object`) | Structured rich snippet metadata embedded in the page, including thumbnails (`cse_thumbnail`), OpenGraph/Twitter meta tags (`metatags`), etc. |

### Example Response

```json
{
  "result": {
    "kind": "customsearch#search",
    "url": {
      "type": "application/json",
      "template": "https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json"
    },
    "searchInformation": {
      "searchTime": 0.241528,
      "formattedSearchTime": "0.24",
      "totalResults": "152000",
      "formattedTotalResults": "152,000"
    },
    "items": [
      {
        "kind": "customsearch#result",
        "title": "FastGPT - LLM-based Knowledge Base Platform",
        "htmlTitle": "<b>FastGPT</b> - LLM-based Knowledge Base Platform",
        "link": "https://fastgpt.in/",
        "displayLink": "fastgpt.in",
        "snippet": "FastGPT is an enterprise-grade knowledge platform based on LLMs, offering out-of-the-box data preprocessing, model orchestration, and agent workflow capabilities...",
        "htmlSnippet": "<b>FastGPT</b> is an enterprise-grade knowledge platform based on LLMs, offering out-of-the-box data preprocessing, model orchestration, and agent workflow capabilities...",
        "formattedUrl": "https://fastgpt.in/",
        "pagemap": {
          "metatags": [
            {
              "viewport": "width=device-width, initial-scale=1",
              "description": "FastGPT Official Platform"
            }
          ]
        }
      }
    ]
  }
}
```

---

## Typical Workflow Orchestration

In FastGPT's Advanced Orchestration, the Google Search tool is commonly combined with LLM nodes and Code Execution nodes:

### Workflow Diagram

```
[User Input]
   │
   ▼
[Intent Detection / Keyword Extraction (LLM Node)]
   │ Extracted search query
   ▼
[Google Search (Tool Node)] ──> Returns raw JSON payload
   │
   ▼
[Result Formatting (Code Execution Node)] ── (Optional: extract title/link/snippet, optimize tokens)
   │ Formatted reference text
   ▼
[Answer Generation (LLM Node)] ──> Search context injected into Prompt
   │
   ▼
[Final Response]
```

### Response Processing Example (Code Execution Node)

To prevent excessive raw metadata from consuming downstream LLM context tokens, place a Code Execution node after the search node to extract only the essentials:

```javascript
function main({ result }) {
  const items = result?.items || [];
  if (items.length === 0) {
    return {
      text: "No relevant search results found."
    };
  }

  // Extract top 5 results and format as Markdown
  const formatted = items.slice(0, 5).map((item, index) => {
    return `[${index + 1}] [${item.title}](${item.link})\nSummary: ${item.snippet}`;
  }).join("\n\n");

  return {
    text: formatted
  };
}
```

Then reference the formatted text in your downstream LLM node's system prompt:

```text
Please answer the user's question using the reference materials retrieved from Google below. If the materials are irrelevant, answer based on your existing knowledge and state so clearly.
When citing facts, please append the corresponding reference index numbers [1], [2] at the end of sentences.

Reference Materials:
{{formattedResults.text}}
```

---

## Important Considerations

1. **Daily Free Quota Limits**:
   - The Google Custom Search JSON API provides **100 free queries per day** (100 queries/day) per Google Cloud account.
   - If your application requires higher throughput, enable billing for your project in the Google Cloud Console. Subsequent usage costs approximately **$5 USD per 1,000 queries** (with an adjustable daily ceiling, typically defaulting to 10,000 queries/day).
   - We recommend placing an intent classification node upstream so search queries are triggered only when live internet information is genuinely required.
2. **Network Connectivity Requirements**:
   - The plugin communicates with Google's official API endpoint at `https://www.googleapis.com`.
   - In certain countries or regions (such as mainland China), access to this domain may be restricted. Ensure the host machine, container, or network running the FastGPT instance has stable international outbound connectivity (e.g., via HTTP/HTTPS proxy configuration or deployment on international servers).
3. **Programmable Search Engine (`cx`) Web-Wide Scope Configuration**:
   - If a newly created search engine does not have the "Search the entire web" setting toggled on, it will only query the initial URLs provided during setup, causing web-wide queries to return empty results. Make sure the **Search the entire web** toggle is switched to **ON** in the Programmable Search Engine control panel if you intend to search the global web.
4. **Built-in Freshness Constraint**:
   - The plugin's underlying request includes `dateRestrict: 'm[1]'` by default (restricting results to pages updated or indexed within the past month), prioritizing fresh and up-to-date content for time-sensitive information retrieval.
