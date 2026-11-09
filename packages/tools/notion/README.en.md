# Notion Tool Set

Use the Notion API to search, read, query, and create Notion pages from FastGPT workflows.

## Secrets

- `integrationToken`: Notion Internal Integration Secret, usually starts with `ntn_`.

Share the target Notion pages, databases, or data sources with the integration before calling these tools.

## Tools

### Search

Search Notion pages, databases, or data sources.

Inputs:

- `query`: Optional search text.
- `objectType`: Optional `page`, `database`, or `data_source`.
- `pageSize`: 1-100, default 10.
- `cursor`: Pagination cursor.

### Get Page

Retrieve a Notion page by `pageId` and return metadata plus `properties_json`.

### Get Block Children

List child blocks for a page or block ID. The tool returns normalized block metadata and extracted plain text for rich-text blocks.

### Query Data Source

Query a Notion data source by `dataSourceId`.

Inputs:

- `filterJson`: Optional Notion filter JSON object.
- `sortsJson`: Optional JSON object shaped like `{"sorts":[...]}`.
- `pageSize`: 1-100, default 20.
- `cursor`: Pagination cursor.

### Create Page

Create a Notion page under a parent page or data source.

Inputs:

- `parentType`: `page_id` or `data_source_id`.
- `parentId`: Parent ID.
- `propertiesJson`: Required Notion properties JSON object.
- `childrenJson`: Optional Notion block children JSON array.

## Safety

The client only allows the fixed Notion endpoints used by this tool set. JSON inputs are parsed before request construction and are limited in size.
