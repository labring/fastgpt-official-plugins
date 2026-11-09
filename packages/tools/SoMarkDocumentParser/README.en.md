# SoMark Document Parser

The SoMark Document Parser tool parses PDFs, images, Office documents, and other files into structured results, returning full-text Markdown and JSON data. It is suitable for knowledge base ingestion, document Q&A preprocessing, contract/report analysis, table and formula extraction, and more.

The tool supports both the SoMark public API and self-hosted SoMark deployments. Both share the same interface paths, differing only in Base URL and authentication. Multi-file batch parsing is supported, sequentially invoking SoMark's asynchronous pipeline in input order.

## Secrets Configuration

| Field | Description |
| --- | --- |
| Base URL | Required. In **Mainland China**, use `https://somark.cn/api/v1`. Outside **Mainland China** (including Taiwan, China; Hong Kong, China; Macau, China; and overseas), use `https://somark.ai/api/v1`. For private self-hosted deployments, enter your local Base URL. |
| API Key | Required when using public SoMark APIs (`somark.cn` or `somark.ai`), must begin with `sk-`. Not required for private self-hosted deployments. |

API Key validation switches based on the Base URL:
- When the Base URL is `https://somark.cn/api/v1` or `https://somark.ai/api/v1`, the API Key must be non-empty and start with `sk-`.
- When using a custom Base URL, format validation is bypassed and the API Key is passed directly to the backend.

## Purchase

Service purchase is required before using the SoMark API:
- **Mainland China**: [https://somark.cn/workbench/purchase](https://somark.cn/workbench/purchase)
- **Outside Mainland China (including Taiwan, China; Hong Kong, China; Macau, China; and overseas)**: [https://somark.ai/studio/purchase](https://somark.ai/studio/purchase)

## Input Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| files | File Array | None | Required. Supports PDF, image, and Office formats. |
| Output Format | Multi-select | `json`, `markdown` | Choose to return JSON, Markdown, or both formats. |
| Image Format | Single-select | `url` | Return format for image elements: `url`, `base64`, or `none`. |
| Formula Format | Single-select | `latex` | Return format for formula elements: `latex`, `mathml`, or `ascii`. |
| Table Format | Single-select | `html` | Return format for table elements: `markdown`, `html`, or `image`. |
| Chemical Formula Format | Single-select | `image` | Currently only supports `image`. |
| Cross-page Text Stitching | Boolean | `false` | Merges cross-page text blocks into continuous paragraphs. |
| Cross-page Table Stitching | Boolean | `false` | Merges cross-page tables into a single complete table. |
| Heading Hierarchy Recognition | Boolean | `false` | Identifies H1, H2, H3, and other heading levels. |
| Return In-text Images | Boolean | `false` | Returns images embedded within text paragraphs. |
| Return Table Images | Boolean | `true` | Returns images inside table cells. |
| Image Understanding | Boolean | `true` | Performs semantic understanding and structured description for document images. |
| Preserve Header and Footer | Boolean | `false` | Preserves headers and footers when enabled. |

## Outputs

| Field | Type | Description |
| --- | --- | --- |
| `results` | Object Array | One entry per input file, returned in input order. |

Each `results[i]` contains:

| Field | Type | Description |
| --- | --- | --- |
| `markdown` | string | Full document content in Markdown format. Empty string if Markdown output was not selected. |
| `json` | object | Parsed result in JSON format. Empty object if JSON output was not selected. |

## Important Notes

- FastGPT file pickers pass file download URLs. The tool downloads the file first, then sends it via multipart form-data to SoMark.
- If the download URL includes a `filename` query parameter, the tool prioritizes that filename to prevent missing extensions (`.pdf`, `.docx`) from causing misclassification.
- Multiple files are parsed strictly sequentially to avoid occupying multiple SoMark concurrency slots. It automatically retries with backoff upon hitting QPS rate-limit error code `1124` within a 10-minute budget.
- Maximum polling budget is 10 minutes per file; total duration increases linearly with file count.

## Development

```bash
pnpm install
pnpm run test
pnpm run build
pnpm run pack
```
