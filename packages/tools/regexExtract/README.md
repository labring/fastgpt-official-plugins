# regexExtract

Extract text content with regular expressions.

## Inputs

- `text`: Source text.
- `pattern`: JavaScript regular expression pattern without wrapping slashes.
- `flags`: Optional regular expression flags. Supports `gimsuyd`; `g` is applied automatically.
- `group`: Optional capture group selector. Use a number such as `1` or a named group such as `email`.

## Outputs

- `matches`: Extracted values.
- `firstMatch`: First extracted value.
- `count`: Number of extracted values.
- `error`: Error message when the regular expression is invalid.
