# JSON Processor

JSON Processor is an official FastGPT toolset for processing, querying, transforming, and patching JSON data within workflows.

## Tools

- **JSONPath Query**: Query JSON structures using JSONPath expressions, returning matches, the first matched item, total count, and a serialized JSON string.
- **Structured Extraction**: Batch-extract fields via JSONPath mappings into a structured key-value object.
- **JSON Patch**: Apply RFC 6902 JSON Patch operations, supporting `add`, `remove`, `replace`, `move`, `copy`, and `test`.

## Input Notes

The `json` parameter accepts either a valid JSON string or pre-parsed objects and arrays.
For JSON Patch, `operations` supports an array of operation objects or a JSON string representation.
