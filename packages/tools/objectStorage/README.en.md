# Object Storage

S3-compatible object storage toolset for FastGPT official plugins.

## Features

- List objects from a configured bucket.
- Upload UTF-8 text content to an object key.
- Read an object as UTF-8 text with a configurable size limit.
- Create read-only presigned URLs for object download.

## Configuration

| Field | Required | Description |
| --- | --- | --- |
| `endpoint` | Yes | S3/OSS compatible endpoint URL, such as `https://s3.amazonaws.com`, `https://oss-cn-hangzhou.aliyuncs.com`, or a MinIO endpoint. |
| `region` | Yes | Storage region, such as `us-east-1` or `oss-cn-hangzhou`. |
| `accessKeyId` | Yes | Access key ID. Marked as secret. |
| `secretAccessKey` | Yes | Secret access key. Marked as secret. |
| `bucket` | Yes | Default bucket used by all child tools. |
| `forcePathStyle` | No | Enable for MinIO and other path-style compatible services. |

## Tools

### listObjects

Lists objects from the configured bucket.

Inputs:

- `prefix`: Optional object key prefix.
- `maxKeys`: Optional max result count, 1-1000. Defaults to 100.

### uploadTextObject

Uploads UTF-8 text content. It does not read local files.

Inputs:

- `key`: Relative object key.
- `text`: Text content to upload.
- `contentType`: Optional content type. Defaults to `text/plain; charset=utf-8`.
- `maxTextSize`: Optional max text size in bytes. Defaults to 1 MiB.

### getObjectText

Downloads an object as UTF-8 text.

Inputs:

- `key`: Relative object key.
- `maxTextSize`: Optional max text size in bytes. Defaults to 1 MiB.

### createPresignedUrl

Creates a read-only presigned URL for object download.

Inputs:

- `key`: Relative object key.
- `expiresIn`: Optional expiration in seconds. Defaults to 900 and is capped at 604800.

## Guardrails

- Object keys are normalized to forward-slash relative keys.
- Empty keys, absolute-path-like keys, Windows drive paths, and `..` path segments are rejected.
- Upload and download text size limits are enforced.
- Errors are redacted for access keys, secret keys, credentials, and request signatures.
- The MVP intentionally does not include bucket-wide delete or object delete operations.

## Validation

Unit tests mock S3 client behavior. Live credential smoke tests are not run unless credentials are provided by the operator.
