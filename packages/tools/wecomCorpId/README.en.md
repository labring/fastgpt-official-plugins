# WeChat Work Auth Tool (wecomCorpId)

## Overview

Retrieve WeChat Work (WeCom) authorization tokens for use in downstream FastGPT workflow nodes.

⚠️ Note: Only registered WeChat Work enterprise accounts/teams are supported.

## Features

- Retrieve WeChat Work access tokens via Enterprise ID (`corpId`).
- Returns `access_token` and token expiration duration.

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| corpId | string | Yes | WeChat Work Enterprise ID |

## Outputs

| Field | Type | Description |
|---|---|---|
| access_token | string | WeChat Work access token |
| expires_in | number | Token expiration duration in seconds |

## Example Usage

### Workflow Integration

1. Add the "WeChat Work Auth Tool" node.
2. Enter the Enterprise ID (`corpId`).
3. Pass the returned `access_token` to downstream WeChat Work API nodes.

### Configuration Example

```json
{
  "corpId": "ww1234567890abcdef"
}
```

### Response Example

```json
{
  "access_token": "abc123xyz456token",
  "expires_in": 7200
}
```
