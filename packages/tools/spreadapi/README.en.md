# SpreadAPI Spreadsheet Calculation

SpreadAPI transforms Excel workbooks into secure REST APIs. This FastGPT tool suite calls published SpreadAPI service endpoints to execute spreadsheet calculations or inspect service metadata.

Official Documentation: https://spreadapi.io/docs

## Configuration

Configure in the tool secrets:

- `spreadapiApiKey`: Optional SpreadAPI API Key. Sent as `Authorization: Bearer <key>`.
- `serviceUrl`: Published SpreadAPI service URL. Supports dashboard/share links (e.g. `https://spreadapi.io/d/{serviceId}`), service detail URLs, or direct execution endpoints.

## Tools

### executeCalculation

Executes spreadsheet calculations via the published service endpoint.

Inputs:
- `method`: `POST` or `GET` (default `POST`).
- `inputs`: Spreadsheet input key-value object.
- `query`: Additional query parameters.
- `timeout`: Timeout in milliseconds.
- `serviceToken`: Optional service-level token if required by metadata.
- `includeTokenMode`: Controls token injection location (`none`, `query`, or `body`).

Outputs:
- `result`: Outputs object from the response, or full response payload.
- `status`: HTTP status code.
- `data`: Raw SpreadAPI response data.

### getServiceInfo

Retrieves service metadata and schema definition.

Inputs:
- `infoPath`: Optional sub-path or full URL.
- `query`: Additional query parameters.
- `timeout`: Timeout in milliseconds.
- `serviceToken`: Optional service-level token.

Outputs:
- `info`: SpreadAPI service metadata.
- `status`: HTTP status code.
- `data`: Raw SpreadAPI response data.
