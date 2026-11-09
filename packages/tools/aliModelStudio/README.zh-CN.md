# 阿里百炼大模型工具集 (aliModelStudio)

这是阿里云百炼（Model Studio）大模型工具集，支持阿里云百炼平台提供的多样化模型服务。

## 通义千问图像编辑 (qwenTx2Img)

在工具集的 `apiKey` 密钥配置中填入阿里云百炼平台的 API Key（华北2·北京地域）。

子工具 `qwenTx2Img` 接收必填的 `prompt`（提示词）和 `image1`（参考图1），支持可选的 `image2` 和 `image3`（公网图片直链或 Base64 Data URL），以及可选的 `negative_prompt`（负面提示词）和 `seed`（随机种子）。执行完成后在 `image` 字段中返回生成的图片链接（链接有效期 24 小时）。

可选的模型 `model` 参数包括：

- `qwen-image-2.0-pro`（默认推荐）
- `qwen-image-2.0-pro-2026-06-22`
- `qwen-image-2.0-pro-2026-04-22`
- `qwen-image-2.0-pro-2026-03-03`
- `qwen-image-2.0`
- `qwen-image-2.0-2026-03-03`

未显式传入 `model` 的工作流将默认自动采用 `qwen-image-2.0-pro`。提示词支持中英文，最长支持 1300 Tokens。

接口采用同步多模态生成端点，在 `parameters` 中传入 `n: 1`、`negative_prompt` 与 `seed`。

官方文档参考：https://help.aliyun.com/zh/model-studio/qwen-image-edit-api
