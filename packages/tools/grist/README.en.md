# Grist Tool Set

The Grist tool set allows FastGPT workflows to call the Grist REST API, supporting file imports, exporting documents in `.grist`/`xlsx`/tabular text formats, as well as querying, adding, and updating table records.

## Preparation

1. Log in to Grist and visit Profile or Team Site settings to retrieve your API Key.
2. Fill in `gristApiKey` in the FastGPT tool secret configuration.
3. The default service endpoint is `https://docs.getgrist.com`. For self-hosted instances, configure `gristBaseUrl` (not secret).

API Documentation: https://support.getgrist.com/api/

## Tools

### Import Document (`documentImport`)

Calls `POST /api/docs` via multipart/form-data upload to create a new Grist document from Excel, CSV, `.grist`, or other supported files.

Inputs:
- `workspaceId` (number, required): Grist workspace ID
- `fileUrl` (string, required): Downloadable file URL
- `fileName` (string, optional): Upload file name, inferred from URL if omitted
- `documentName` (string, optional): New Grist document name
- `timezone` (string, optional): Document timezone (e.g. `America/New_York`)

### Export Document (`documentExport`)

Downloads Grist documents and returns a public URL via FastGPT's file upload capability. Supports `grist`, `xlsx`, `csv`, `tsv`, and `dsv` formats.

Inputs:
- `docId` (string, required): Grist document ID
- `format` (string, optional): Export format (`grist`, `xlsx`, `csv`, `tsv`, `dsv`, default `grist`)
- `tableId` (string, conditional): Required for `csv`/`tsv`/`dsv`; optional for `xlsx`
- `fileName` (string, optional): Output file name
- `header` (string, optional): Header format (`colId` or `label`)
- `nohistory` (boolean, optional): Remove document history to reduce file size

### Query Records (`recordsQuery`)

Calls `GET /api/docs/{docId}/tables/{tableId}/records` with filtering, sorting, and pagination.

### Add Records (`recordsCreate`)

Calls `POST /api/docs/{docId}/tables/{tableId}/records` to insert new records into a table.

### Update Records (`recordsUpdate`)

Calls `PATCH /api/docs/{docId}/tables/{tableId}/records` to update existing records by ID.
