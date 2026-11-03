# 多語言中繼資料測試

用於驗證 FastGPT 外掛多語言中繼資料、工具說明、JSON Schema 欄位本地化及舊欄位相容。工具只會原樣回顯輸入，不會呼叫外部服務。

## 測試項目

- 外掛名稱、描述、工具說明及版本說明提供英文、簡體中文和繁體中文。
- `defineInputSchema()` 與 `defineOutputSchema()` 會產生相容的普通欄位文案及 `x-i18n` 中繼資料。
- `text` 的雙語標題和描述包含模型側指引；`fallbackText` 以 `isToolParam: false` 驗證 false 值不會遺失。
- `fallbackText` 和 `fallbackEcho` 故意不提供繁體中文譯文，用於測試語言回退。
- `legacyText` 和 `legacyEcho` 只使用普通 Zod `.meta()` 字串，不含 `x-i18n`。
- 可選密鑰 `testSecret` 用於驗證密鑰欄位本地化，不會傳送至外部服務。

## 輸入

```json
{
  "text": "Hello FastGPT",
  "fallbackText": "Fallback value",
  "legacyText": "Legacy value"
}
```

- `text`：必填，工具會原樣回顯。
- `fallbackText`：可選，用於測試輸入欄位的語言回退。
- `legacyText`：可選，用於測試舊式字串 metadata。

## 輸出

- `echo`：原樣回傳 `text`。
- `fallbackEcho`：回傳 `fallbackText`；未提供時為空字串。
- `legacyEcho`：回傳 `legacyText`；未提供時為空字串。
