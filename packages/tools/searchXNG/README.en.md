# searchXNG

Use a configured SearXNG instance for web search.

## Configuration

Set the SearXNG instance URL in the tool Secret configuration. The plugin does
not provide a default public instance because the SearXNG project does not
operate an official hosted search service.

The configured instance must enable JSON responses in `settings.yml`:

```yaml
search:
  formats:
    - html
    - json
```

## Behavior

- Configure the instance under the Secret key `url`. Only `http` and `https`
  URLs are accepted. The `query` input must be non-empty.
- Requests use the instance's `/search` endpoint. If the configured path does
  not already end in `/search`, the plugin appends it. Existing query
  parameters are cleared, then `q`, `format=json`, and `language=auto` are
  added.
- Results are returned as `{ result: [{ title, link, snippet }] }`, with at
  most 10 items. Missing or `null` result fields become empty strings. Empty
  result sets, HTTP errors, malformed JSON or result payloads, and responses
  larger than 2 MiB fail the tool call.

See the [SearXNG Search API documentation](https://docs.searxng.org/dev/search_api.html)
and the [public instance directory](https://searx.space/) for more information.
