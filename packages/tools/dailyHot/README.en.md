# Multi-Platform Trending News Tool (Daily Hot)

The Daily Hot plugin aggregates trending lists and real-time hot searches across major Chinese digital content platforms. It supports **36Kr**, **Zhihu**, **Weibo**, **Juejin**, and **Toutiao**, enabling FastGPT AI agents to rapidly gather multi-dimensional public sentiment trends, cutting-edge technology news, and industry insights.

This plugin is **ready to use out of the box with zero third-party API keys required**. Built with concurrent requests and fault-tolerant fallback mechanisms, an error in one platform source will not hinder data retrieval from others, ensuring stable and real-time news feeds for automated workflows and AI agents.

---

## Application Scenarios

- **Automated Morning News & Daily Briefing Generation**: Combined with FastGPT scheduled triggers, automatically retrieve tech venture capital news (36Kr), developer community trends (Juejin), and general trending events (Weibo/Toutiao) every morning. An LLM deduplicates, summarizes, and formats the items into a structured briefing pushed directly to enterprise chats like WeCom or DingTalk.
- **Industry & Cutting-Edge Tech Tracking**: Focus on tech business breakthroughs and developer discussions to spot AI announcements, open-source milestones, and venture investments, helping product and engineering teams stay ahead of emerging trends.
- **Social Media Public Sentiment & Event Monitoring**: Aggregate real-time Weibo hot searches, in-depth Zhihu discussions, and Toutiao breaking news to monitor emerging events, public discourse trends, and popular discussions for sentiment analysis or risk assessment.
- **Content Creation & Ideation Repository**: Provide digital media creators and marketers with a cross-platform topic pool. The AI agent recommends angles, article outlines, and audience-targeted discussion points based on current trends.

---

## Supported Trending Platforms

| Source Key (`sources`) | Platform Name | Category / Domain | Returned Fields | Content Highlights & Details |
| --- | --- | --- | --- | --- |
| `36kr` | 36Kr | Tech & Business / Venture Capital | `title`, `source`, `time` | High-impact tech, business, and venture investment events, providing accurate publication timestamps. |
| `zhihu` | Zhihu | In-Depth Q&A / Thoughtful Discussions | `title`, `description`, `source`, `time` | Top-ranked discussion questions on Zhihu, including excerpted context (`description`) and question creation timestamps. |
| `weibo` | Weibo | Social Media / Real-Time Hot Search | `title`, `source` | Real-time Weibo hot search board reflecting general public interest, highly responsive to breaking news and viral discussions. |
| `juejin` | Juejin | Developer / Technical Community | `title`, `source` | Trending technical articles covering frontend, backend, AI, cloud, and software architecture. |
| `toutiao` | Toutiao (Today's Headlines) | General News / Public Interests | `title`, `source` | Comprehensive trending board covering society, current affairs, lifestyle, and culture. |

---

## Input Parameters

| Parameter | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `sources` | Array (`Array<string>`) | `["36kr"]` | No | **List of trending news source platforms**. Select one or more platforms. Available enum values:<br>• `"36kr"`: 36Kr Trending List<br>• `"zhihu"`: Zhihu Hot List<br>• `"weibo"`: Weibo Real-Time Hot Search<br>• `"juejin"`: Juejin Developer Articles<br>• `"toutiao"`: Toutiao Hot Topics |

> **Note**: When `sources` is omitted or empty in FastGPT workflows, it defaults to `["36kr"]`. To fetch from multiple platforms simultaneously, provide an array such as `["36kr", "zhihu", "weibo"]`.

---

## Output Results

Upon execution, the plugin returns a top-level object containing a `hotNewsList` array:

| Field | Type | Description |
| --- | --- | --- |
| `hotNewsList` | Array (`Array<Object>`) | The aggregated list of trending news items retrieved from the selected platforms. |

### Data Structure of `hotNewsList` Items

Items within `hotNewsList` follow a **Union Schema** consisting of two types: **successful news items** and **platform-level error items**.

#### 1. Success Data Item

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | String (`string`) | No | The title of the trending news item, article, or search term. |
| `description` | String (`string`) | No | Supplementary description or excerpt (primarily returned by **Zhihu**). |
| `source` | String (`string`) | Yes | The localized platform name (e.g., `'36氪'`, `'知乎'`, `'微博'`, `'掘金'`, `'头条'`). |
| `time` | String (`string`) | No | Publication or creation timestamp formatted as a localized string (e.g., `2025/2/20 09:30:00`, provided by **36Kr** and **Zhihu**). |

#### 2. Error Data Item

When a specific platform fails due to upstream API errors or network timeouts, the fault tolerance mechanism records an error entry rather than failing the entire batch:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `source` | String (`string`) | Yes | The English source identifier of the failed platform (e.g., `'36kr'`, `'weibo'`). |
| `error` | String (`string`) | No | Error description, formatted like `Failed to get hot news from <source>`. |

> **Note**: The plugin only throws a top-level exception (`Failed to get hot news list`) if all requested platforms fail and no data can be returned.

---

### Output Example

```json
{
  "hotNewsList": [
    {
      "title": "OpenAI announces new reasoning models, breaking performance benchmarks",
      "source": "36氪",
      "time": "2025/2/20 08:30:15"
    },
    {
      "title": "How do you evaluate the architectural innovations in DeepSeek-R1?",
      "description": "DeepSeek-R1 provides significant insights into large-scale reinforcement learning and pure RL training strategies...",
      "source": "知乎",
      "time": "2025/2/20 09:15:00"
    },
    {
      "title": "National Technology & Innovation Conference 2025 opens today",
      "source": "微博"
    },
    {
      "title": "Building a high-performance TypeScript plugin framework from scratch",
      "source": "掘金"
    },
    {
      "title": "Nationwide cold wave alert issued across multiple regions",
      "source": "头条"
    }
  ]
}
```

---

## Workflow Orchestration & Usage Examples

### Workflow Topology

```
[Scheduled Trigger / User Query]
              │
              ▼
[Tool Node (dailyHot)] ──> Input sources: ["36kr", "juejin", "zhihu"]
              │
              ▼
[LLM Node] ──────────────> Apply Prompt for filtering, deduplication & categorization
              │
              ▼
[Notification / Reply] ──> Output curated briefing to chat, WeCom, or DingTalk group
```

---

### Example 1: Daily Tech & Venture Capital Briefing

#### 1. Tool Node Input Configuration

```json
{
  "sources": ["36kr", "juejin"]
}
```

#### 2. LLM Node Prompt Configuration

**System Prompt**:
```markdown
You are a senior technology and venture capital analyst. Your task is to organize raw trending news into a concise, well-structured "Daily Tech Briefing".

Guidelines:
1. News Selection: Filter out trivial updates; focus on Artificial Intelligence, frontier tech breakthroughs, major tech companies, and significant venture funding rounds.
2. Categorization: Organize findings under [Tech & Venture Focus] and [Developer Frontier].
3. Formatting:
   - Summarize each item into a single core takeaway (under 30 words).
   - Append the source tag (e.g., [36Kr], [Juejin]).
4. Tone: Professional, objective, and easy to read during a morning commute.
```

**User Prompt**:
```markdown
Here is today's trending news feed:
{{dailyHot.hotNewsList}}

Please generate today's "Daily Tech Briefing" based on the data above.
```

---

### Example 2: Social Media Public Sentiment & Trending Overview

#### 1. Tool Node Input Configuration

```json
{
  "sources": ["weibo", "zhihu", "toutiao"]
}
```

#### 2. LLM Node Prompt Configuration

**System Prompt**:
```markdown
You are an experienced media editor and public opinion analyst. Based on incoming trending news from multiple social platforms, summarize the top 5 most discussed topics of the day.

Requirements:
1. [Topic Overview]: Summarize each event with a crisp, compelling headline.
2. [Platform Focus]: Highlight differing discussion angles across Weibo, Zhihu, and Toutiao (e.g., Weibo reflects immediate public reactions, Zhihu features analytical breakdowns, Toutiao covers community impact).
3. [Public Interest]: Summarize the core viewpoints or debates among netizens in 2–3 sentences.
```

---

## Important Notes

1. **Network Connectivity**:
   - The plugin environment must be able to reach upstream API endpoints (`gateway.36kr.com`, `api.zhihu.com`, `m.weibo.cn`, `api.juejin.cn`, `www.toutiao.com`).
   - If deployed behind a firewall or restricted intranet, ensure appropriate outbound firewall rules are configured.
2. **Field Variations Across Platforms**:
   - Not all platforms provide `time` (timestamp) and `description` (summary excerpt).
   - Currently, only **36Kr** and **Zhihu** return publication timestamps, and only **Zhihu** returns excerpt descriptions. Workflows should treat these fields as optional.
3. **Request Rate & Stability**:
   - The plugin queries open endpoints. It is recommended to invoke it via scheduled batches (e.g., once an hour or once every morning) rather than making rapid burst queries that might trigger upstream rate limits.

---

## Local Development & Testing

Run the following commands within `packages/tools/dailyHot`:

```bash
# Run unit tests
pnpm run test

# Build the plugin bundle
pnpm run build

# Validate plugin specification and dist artifacts
npx @fastgpt-plugin/cli check --entry .

# Package into a .pkg bundle
pnpm run pack
```
