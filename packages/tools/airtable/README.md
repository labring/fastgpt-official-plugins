# Airtable

Use Airtable Web API v0 to list, create, and update records in a selected base and table.

## Secrets

- `token`: Airtable Personal Access Token. It is only sent as `Authorization: Bearer <token>` to `https://api.airtable.com/v0`.

## Tools

- `listRecords`: list records from `baseId` and `tableIdOrName`. Supports `maxRecords`, `pageSize`, `filterByFormula`, `view`, and `sort`.
- `createRecord`: create one record with a bounded `fields` object. Optional `typecast`.
- `updateRecord`: update one record by `recordId` with a bounded `fields` object. Optional `typecast`.

## Safety Limits

- API host is fixed to `api.airtable.com`.
- No delete, webhook, or arbitrary URL operation is exposed.
- List results are capped at 100 records per call.
- Create and update only send one record per call.
- `fields` must be a JSON object, cannot be empty, and is limited by key count and JSON size.
- Error summaries keep Airtable status/type/message and redact PAT/Bearer token patterns.
