# MongoDB 文档数据库操作工具集

面向 FastGPT 插件体系的 MongoDB 数据库操作工具集。

## 子工具列表

- `find`：从指定的集合中查询文档列表。
- `insert`：插入单条或批量插入多条文档。
- `update`：更新单条或批量更新多条文档。
- `delete`：删除单条或批量删除多条文档。
- `aggregate`：执行 MongoDB 聚合管道（Aggregation Pipeline）。

## 连接配置与密钥 (Secrets)

- `connectionUri`：MongoDB 连接字符串，例如 `mongodb://user:password@host:27017`。
- `database`：目标数据库名称。
- `connectTimeoutMS`：可选的连接建立超时时间（毫秒）。
- `socketTimeoutMS`：可选的 Socket 网络超时时间（毫秒）。

JSON 输入支持 MongoDB 扩展 JSON 语法（Extended JSON），例如：

```json
{"_id":{"$oid":"656000000000000000000000"}}
```

出于安全考量，`update` 和 `delete` 默认拒绝空查询条件（Filter）。若确实需要全表操作，请显式传入 `allowEmptyFilter: true`。
