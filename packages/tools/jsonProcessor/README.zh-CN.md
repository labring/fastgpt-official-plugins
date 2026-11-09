# JSON Processor

JSON Processor 是一个 FastGPT 官方工具套件，用于在工作流中处理 JSON 数据。

## 子工具

- JSONPath 查询：使用 JSONPath 表达式查询 JSON，返回匹配列表、首个匹配值、匹配数量和 JSON 字符串。
- 结构化提取：用字段映射批量提取 JSONPath 结果，输出结构化对象。
- JSON Patch：应用 RFC 6902 JSON Patch 操作，支持 `add`、`remove`、`replace`、`move`、`copy`、`test`。

## 输入说明

`json` 参数支持 JSON 字符串，也支持已经结构化的对象或数组。

JSON Patch 的 `operations` 支持对象数组，也支持 JSON 字符串形式的操作数组。
