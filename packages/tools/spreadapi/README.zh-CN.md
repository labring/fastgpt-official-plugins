# SpreadAPI 表格计算

SpreadAPI 可以把 Excel 文件发布成安全的 REST API。这个 FastGPT tool-suite 用于调用已经发布的 SpreadAPI service endpoint,执行表格计算或读取服务信息。

官方文档: https://spreadapi.io/docs

## 配置

在插件密钥中配置:

- `spreadapiApiKey`: 可选的 SpreadAPI API Key。填写后会以 `Authorization: Bearer <key>` 发送。
- `serviceUrl`: SpreadAPI 发布的服务 URL。该配置不是密钥,用于所有子工具调用。支持 dashboard/share URL,例如 `https://spreadapi.io/d/{serviceId}`；也支持服务详情 URL `https://spreadapi.io/api/v1/services/{serviceId}` 或执行 endpoint `https://spreadapi.io/api/v1/services/{serviceId}/execute`。

## 子工具

### executeCalculation

调用已发布的 SpreadAPI service endpoint 执行计算。

主要输入:

- `method`: `POST` 或 `GET`,默认 `POST`。
- `inputs`: 表格输入对象。POST 时会放入 body 的 `inputs` 字段,GET 时会展开到 query。
- `query`: 附加 query 参数。
- `timeout`: 请求超时时间,单位毫秒。
- `serviceToken`: 可选的服务级 token。如果服务 metadata 中 `requiresToken` 为 `false`,留空即可。
- `includeTokenMode`: 控制 `serviceToken` 的注入位置,可选 `none`、`query`、`body`。

输出:

- `result`: 优先返回响应里的 `outputs`,否则返回完整响应数据。
- `status`: HTTP 状态码。
- `data`: SpreadAPI 原始响应数据。

### getServiceInfo

读取服务信息。对 SpreadAPI `/d/{serviceId}`、`/api/v1/services/{serviceId}`、`/api/v1/services/{serviceId}/execute` 地址,默认请求 `/api/v1/services/{serviceId}`。

主要输入:

- `infoPath`: 信息路径,默认留空。支持相对路径或完整 URL。
- `query`: 附加 query 参数。
- `timeout`: 请求超时时间,单位毫秒。
- `serviceToken`: 可选的服务级 token。如果服务 metadata 中 `requiresToken` 为 `false`,留空即可。
- `includeTokenMode`: 控制 `serviceToken` 是否放入 query。

输出:

- `info`: SpreadAPI 服务信息,等同于响应数据。
- `status`: HTTP 状态码。
- `data`: 原始响应数据。

## 示例

POST 计算:

```json
{
  "method": "POST",
  "inputs": {
    "a1": 100
  }
}
```

GET 计算:

```json
{
  "method": "GET",
  "inputs": {
    "a1": 100
  }
}
```

## 导入/导出说明

SpreadAPI 官方文档描述的 Excel 文件导入流程是在 dashboard 中上传或创建 spreadsheet，然后选择输入/输出单元格并发布服务；公开 REST 文档只提供调用已发布服务的执行接口，没有提供通过 API 上传 Excel 文件创建服务，或导出/下载 Excel 文件的 endpoint。

因此本插件实现的是调用已发布服务的计算和服务信息读取能力。文件级导入/导出需要在 SpreadAPI 控制台完成。
