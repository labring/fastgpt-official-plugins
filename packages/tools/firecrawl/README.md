# firecrawl

The context API to search, scrape, and interact with the web at scale. Search the web and turn any page into clean markdown or HTML for your AI apps.

## API key

Get a Firecrawl API key at [firecrawl.dev/app/api-keys](https://www.firecrawl.dev/app/api-keys?utm_source=fastgpt&utm_medium=integration). Leave the API Url empty to use the official service.

## Tools

- `search`: search the web. Inputs: `query`, `limit` (1-20, default 5), `includeContent` (also return each result page as markdown). Returns `url`, `title` and `description` for each result.
- `scrape`: scrape a single page. Inputs: `url`, `format` (`markdown` or `html`), `faster` (allow a cached copy up to 1 hour old).

Docs: [Search](https://docs.firecrawl.dev/features/search?utm_source=fastgpt&utm_medium=integration), [Firecrawl Search](https://www.firecrawl.dev/search?utm_source=fastgpt&utm_medium=integration)
