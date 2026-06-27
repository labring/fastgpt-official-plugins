# DataForB2B

B2B data toolset for FastGPT — search and enrich people and companies for lead generation, sales prospecting and recruiting.

Powered by the [DataForB2B API](https://docs.dataforb2b.ai). Base URL: `https://api.dataforb2b.ai`.

## Tools

| Tool | Endpoint | Purpose |
| --- | --- | --- |
| Search People | `POST /search/people` | Search people/decision-makers with up to 5 structured filter slots + advanced JSON filters |
| Search Companies | `POST /search/companies` | Search companies/accounts with the same filter model |
| Reasoning Search | `POST /search/reasoning` | Natural-language search; handles `needs_input` clarification turns via `session_id` + `answers` |
| Typeahead | `GET /typeahead` | Resolve the exact stored value for a filter |
| Enrich LinkedIn Profile | `POST /enrich/profile` | Full profile + work/personal email + phone + GitHub |
| Enrich Company | `POST /enrich/company` | Full company profile |

## Secret configuration

| Key | Required | Description |
| --- | --- | --- |
| `apiKey` | yes | DataForB2B API key, sent as the `api_key` request header. Get it from [app.dataforb2b.ai](https://app.dataforb2b.ai) (Settings → API Keys). |

## Inputs & outputs

- **Search People / Companies** — inputs: `match` (and/or), `filter_1..5_column/operator/value`, `advanced_filters` (JSON), `count`, `offset`, `enrich_live`. Outputs: `total`, `count`, `results[]`.
- **Reasoning Search** — inputs: `query`, `category` (people/companies), `session_id`, `answers` (JSON), `max_results`, `enrich_live`. Outputs: `status`, `session_id`, `questions[]`, `total`, `results[]`.
- **Typeahead** — inputs: `type`, `q`, `limit` (1-20). Outputs: `values[]`, `results[]`.
- **Enrich LinkedIn Profile** — inputs: `profile_identifier` + flags (`enrich_profile`, `enrich_work_email`, `enrich_personal_email`, `enrich_phone`, `enrich_github`). Output: `result`.
- **Enrich Company** — input: `company_identifier`. Output: `result`.

## Build

```bash
pnpm --filter fastgpt-tools-dataforb2b test
pnpm --filter fastgpt-tools-dataforb2b build
pnpm --filter fastgpt-tools-dataforb2b pack
```
