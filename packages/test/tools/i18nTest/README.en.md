# I18n Metadata Test

A FastGPT test plugin for localized plugin metadata, tool descriptions, JSON Schema labels, and legacy compatibility. It only echoes input and does not call external services.

## Coverage

- Plugin name, description, tool description, and version description in English, Simplified Chinese, and Traditional Chinese.
- `defineInputSchema()` and `defineOutputSchema()` generate compatible plain labels and `x-i18n` metadata.
- `text` has bilingual titles and descriptions that include model-facing guidance; `fallbackText` uses `isToolParam: false` to verify that false values are preserved.
- `fallbackText` and `fallbackEcho` intentionally omit Traditional Chinese to exercise locale fallback.
- `legacyText` and `legacyEcho` use plain Zod `.meta()` strings without `x-i18n`.
- Optional secret `testSecret` verifies localized secret-field metadata and is not sent to an external service.

## Input

```json
{
  "text": "Hello FastGPT",
  "fallbackText": "Fallback value",
  "legacyText": "Legacy value"
}
```

- `text`: required; echoed unchanged.
- `fallbackText`: optional; tests localized input fallback.
- `legacyText`: optional; tests legacy string metadata.

## Output

- `echo`: unchanged `text`.
- `fallbackEcho`: `fallbackText`, or an empty string when omitted.
- `legacyEcho`: `legacyText`, or an empty string when omitted.
