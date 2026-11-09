# mongodb

MongoDB operations toolset for FastGPT Plugin.

## Tools

- `find`: Query documents from a collection.
- `insert`: Insert one document or multiple documents.
- `update`: Update one document or multiple documents.
- `delete`: Delete one document or multiple documents.
- `aggregate`: Execute an aggregation pipeline.

## Connection secrets

- `connectionUri`: MongoDB connection string, for example `mongodb://user:password@host:27017`.
- `database`: Database name.
- `connectTimeoutMS`: Optional connection timeout in milliseconds.
- `socketTimeoutMS`: Optional socket timeout in milliseconds.

JSON inputs support MongoDB Extended JSON, for example:

```json
{"_id":{"$oid":"656000000000000000000000"}}
```

`update` and `delete` reject an empty filter by default. Pass `allowEmptyFilter: true` when a full-collection operation is intentional.
