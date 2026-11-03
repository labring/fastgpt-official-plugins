# 多语言元数据测试

用于验证 FastGPT 插件多语言元数据、schema helper 和旧字段兼容。工具只回显输入，不调用外部服务。

## 测试项

- 插件名称、描述、工具说明和版本说明提供英文、简体中文、繁体中文。
- 输入、输出字段通过 `defineInputSchema()` / `defineOutputSchema()` 生成普通 Zod object 与 `x-i18n` 文案。
- `text` 的双语标题和描述包含工具的模型侧指引；`fallbackText` 用 `isToolParam: false` 验证 false 值不会丢失。
- `text.type` 上的 `.meta()` placeholder 应与 helper 生成的标题、描述合并并保留。
- `fallbackText`、`fallbackEcho` 故意不提供繁体中文译文，用于验证语言回退。
- `legacyText`、`legacyEcho` 通过底层 `.meta()` 只提供普通字符串字段，用于验证旧 schema 兼容。
- 可选密钥 `testSecret` 只用于检查密钥字段多语言 metadata，不会发送到外部服务。

## 调用参数

```json
{
  "text": "Hello FastGPT",
  "fallbackText": "Fallback value",
  "legacyText": "Legacy value"
}
```

- `text`：必填，工具会原样返回。
- `fallbackText`：可选，用于检查输入字段的语言回退。
- `legacyText`：可选，用于检查普通字符串 schema。

## 输出

- `echo`：`text` 的原样回显。
- `fallbackEcho`：`fallbackText` 的回显；未传时为空字符串。
- `legacyEcho`：`legacyText` 的回显；未传时为空字符串。

## 本地命令

- `pnpm run test`：运行 echo 与 schema metadata 回归测试。
- `pnpm run build`：构建插件并生成 `dist/manifest.json`。
- `pnpm run check`：验证构建产物。
- `pnpm run pack`：打包 `.pkg` 文件。
