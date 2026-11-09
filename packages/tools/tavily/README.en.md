# Tavily Tool Set

Tavily is an AI-native search and content extraction API designed specifically for LLM applications and autonomous agents.

## API Key Setup

1. Register an account at [Tavily](https://tavily.com).
2. Retrieve your API key from the [Dashboard](https://app.tavily.com).
3. The API key format starts with `tvly-`.

## Tools

### 📊 AI Search

AI-driven web search providing relevance-ranked results and optional AI-generated answers.

**Key Features:**
- Semantic relevance ranking and filtering
- Optional AI-generated direct answer summaries
- Basic (1 credit) and Advanced (2 credits) search depth
- Configurable result counts (1-20 items)
- Built-in 60s timeout protection

### 📝 Content Extract

Extracts structured, cleaned content from web pages, supporting Markdown and plain text output.

**Key Features:**
- Batch URL processing
- Automatic HTML boilerplate removal and markdown conversion
- Extracts page image URLs
- Multi-URL input separated by newlines
- Detailed per-URL error reporting

### 🕷️ Web Crawler

Graph-based parallel web crawler for exploring deep website structures and sitemaps.
