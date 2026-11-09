# Feed Reader

Parse and read RSS, Atom, RDF/RSS 1.0, and JSON Feed subscriptions, extracting feed metadata, recent entries, and Markdown summaries.

## Inputs

- `feedUrl`: Feed URL, supports `http`, `https`, `feed`, `rss`, and `atom` protocols.
- `maxItems`: Maximum number of entries to return (1-50, default 10).
- `includeContent`: Whether to return full entry content (default `false`).

## Outputs

- `feed`: Feed title, description, site URL, canonical feed URL, language, updated time, and format.
- `items`: Entry title, link, author, publication date, update date, summary, content, ID, and categories.
- `markdown`: Formatted Markdown summary of the feed and entries.

## Security Boundaries

- Only public `http` and `https` URLs are permitted.
- `feed://`, `rss://`, and `atom://` schemes are normalized to `https://`.
- Rejects localhost, private IP addresses, link-local addresses, and cloud metadata hosts.
- Maximum feed response size capped at 5MB.

## Development

```bash
pnpm install
pnpm run build
pnpm run test
```
