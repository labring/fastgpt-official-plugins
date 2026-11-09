# MinerU 智能文档深度解析工具集 (MinerU Document Parsing Service)

MinerU 是一款面向学术文献、科技研报、教材试卷等多模态复杂文档的高性能深度解析工具，支持将 PDF、Office 文档（Word、PPT）、图片等非结构化文件高效精准地转换为机器可读的高质量 Markdown、HTML 及结构化 JSON 数据。

本插件为 FastGPT 提供了开箱即用的 MinerU 文档解析能力，同时支持 **SaaS 官方云端服务** 与 **私有化本地部署** 双重模式。基于深度学习 OCR 与布局分析技术，插件可自动重构文档阅读流，精准还原双栏/多栏排版，无损提取行内与块级 LaTeX 数学公式以及复杂嵌套表格，并将文档内嵌图表自动转存至 FastGPT 对象存储生成可访问直链，为 FastGPT 智能体工作流、大模型阅读理解以及 RAG 知识库检索提供高保真的文档预处理支撑。

---

## 典型应用场景

- **复杂学术论文与科技报告高精度 OCR**：精准解析计算机、数学、物理、生化等领域学术论文与前沿技术报告，消除多栏错行、乱码与阅读顺序错乱。
- **多栏排版与复杂嵌套表格抽取**：完美支持双栏/三栏期刊、财务报表、行业白皮书等复杂排版，自动重构自然阅读流，并将跨行跨列、带表头分层的复杂表格转换为规范 Markdown 或 HTML。
- **包含 LaTeX 数学公式的科技文档提取**：高精度检测和识别科技文档中的行内数学符号（`$...$`）与独立块级公式（`$$...$$`），完整保留矩阵、积分、偏导等数学语义。
- **多模态文档配图抽取与 RAG 知识库入库**：自动裁剪提取文档中的高清图表、示意图、流程图并转存托管，在 Markdown 中保留富文本图片链接；为 FastGPT 智能体工作流、大模型阅读理解以及 RAG 知识库检索提供高保真的文档切片与多模态数据支撑。

---

## 部署模式与密钥配置说明

使用本插件支持两种部署模式，需在 FastGPT 插件配置中根据实际使用场景填写相应的密钥信息：

| 字段名 (`Secret Key`) | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `base_url` | 字符串 (`string`) | 否 | `https://mineru.net` (SaaS) | MinerU 服务地址。<br>• **SaaS 官方在线服务**：留空无需填写，默认请求 `https://mineru.net`；<br>• **私有化本地部署**：填写本地或内网 MinerU API 服务根地址，例如 `http://127.0.0.1:8000` 或 `http://mineru.internal:8000`。 |
| `token` | 字符串 (`string`) | 条件必填 | 空 | MinerU 服务的身份鉴权凭证。<br>• **SaaS 官方在线服务**：**必填**，前往 [MinerU 开放平台控制台](https://mineru.net/apiManage/docs) 注册并获取 API Token；<br>• **私有化本地部署**：若本地 MinerU 实例开启了鉴权则填写对应 Bearer Token，未开启鉴权可留空。 |

### 配置方式建议

1. **SaaS 在线服务模式**：
   - `base_url`：保持留空即可（内部会自动回退到 `https://mineru.net`）。
   - `token`：在 [MinerU 开发者文档](https://mineru.net/apiManage/docs) 申请并填入 API Token。
2. **私有化本地部署模式**：
   - `base_url`：填入本地或私有算力服务器暴露的 MinerU API v2 地址，如 `http://127.0.0.1:8000`。
   - `token`：根据本地服务是否开启鉴权选填。

---

## 子工具列表

本工具集包含以下两个子工具：

- **`parseLocal`（本地部署解析 / Local Deployment Parse）**：通过私有化或本地部署的 MinerU API v2 接口（`/file_parse`）进行文档直接解析，支持单/多文件并发上传与处理，支持丰富的模型后端（Pipeline、VLM 等）与自定义语言配置。
- **`parseRemote`（MinerU SaaS 官方在线解析 / MinerU SaaS Parse）**：通过 MinerU 官方 SaaS 云端服务进行分布式异步排队批量解析，支持 PDF、Word (.doc/.docx)、PowerPoint (.ppt/.pptx)、图片等多格式文档，支持标准 Pipeline 与端到端 VLM 模型版本。

---

## 子工具：parseLocal (本地部署解析)

适用于团队内部搭建了私有化 MinerU GPU 服务节点，或在本地部署了 MinerU API v2 服务的场景。

### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `files` | 字符串数组 (`Array<string>`) | 是 | 无 | **待解析的文件 URL 列表**。支持传入单个或多个文件下载直链，支持 PDF、PNG、JPG、JPEG 等常见格式。通常连接 FastGPT 文件上传节点或上游变量。 |
| `parse_method` | 字符串枚举 (`enum`) | 否 | `auto` | **解析方法**。可选值：<br>• `auto`：自动检测文档类型（有文字层优先提取，扫描件自动走 OCR）；<br>• `ocr`：强制对整篇文档执行深度 OCR 识别；<br>• `txt`：纯文本直接提取模式（仅针对自带文字层的电子 PDF）。 |
| `formula_enable` | 布尔值 (`boolean`) | 否 | `true` | **是否开启公式识别**。设为 `true` 时自动将行内与块级公式转化为 LaTeX 格式。 |
| `table_enable` | 布尔值 (`boolean`) | 否 | `true` | **是否开启表格识别**。设为 `true` 时抽取表格并结构化输出。 |
| `return_content_list` | 布尔值 (`boolean`) | 否 | `false` | **是否返回结构化 JSON**。设为 `true` 时，在输出的 `contentList` 字段中返回按段落、标题、公式、表格、图片切分的结构化块列表。 |
| `lang_list` | 字符串 (`string`) | 否 | `ch` | **文档语言代码**。多个语言用逗号分隔（如 `ch,en`）。默认 `ch`（中英混排），其他支持语言参考 PaddleOCR 语言列表（如 `en`, `japan`, `korean` 等）。 |
| `backend` | 字符串枚举 (`enum`) | 否 | `pipeline` | **MinerU 解析计算后端**。可选值：<br>• `pipeline`：传统深度学习流水线；<br>• `vlm-transformers`：基于 Transformers 的视觉语言模型；<br>• `vlm-sglang-engine`：SGLang 本地推理引擎；<br>• `vlm-sglang-client`：连接独立部署的 SGLang 推理服务（需配合 `sglang_server_url`）；<br>• `vllm-async-engine`：vLLM 异步推理引擎；<br>• `vllm-engine`：vLLM 同步推理引擎；<br>• `http-client`：HTTP 外部客户端调用。 |
| `sglang_server_url` | 字符串 (`string`) | 否 | 空 | **SGLang 推理服务地址**。当 `backend` 设置为 `vlm-sglang-client` 时必填，例如 `http://127.0.0.1:30000`。 |

---

## 子工具：parseRemote (MinerU SaaS 官方在线解析)

适用于直接调用 MinerU 官方公有云 SaaS 服务的场景，免除本地 GPU 算力部署维护成本，支持更广泛的文件格式（包含 Word 和 PPT）。

### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `files` | 字符串数组 (`Array<string>`) | 是 | 无 | **待解析的文件 URL 列表**。支持公网可访问的文件直链，支持 `.pdf`、`.doc`、`.docx`、`.ppt`、`.pptx`、`.png`、`.jpg`、`.jpeg` 格式。 |
| `model_version` | 字符串枚举 (`enum`) | 否 | `pipeline` | **解析模型版本**。可选值：<br>• `pipeline`：经典端到端深度学习流水线，兼顾速度与稳定性；<br>• `vlm`：基于视觉语言大模型（VLM）的新一代端到端解析，复杂图文理解与多模态排版还原效果更佳。 |
| `is_ocr` | 布尔值 (`boolean`) | 否 | `false` | **是否强制执行 OCR**。默认为 `false`（优先根据文字层智能解析），设为 `true` 时强制进行光学字符识别。 |
| `enable_formula` | 布尔值 (`boolean`) | 否 | `true` | **是否开启公式识别**。识别文档中的数学符号并转为标准 LaTeX 语法。 |
| `enable_table` | 布尔值 (`boolean`) | 否 | `true` | **是否开启表格识别**。将图表与表格转换为 Markdown 表格。 |
| `language` | 字符串 (`string`) | 否 | `ch` | **文档主要语言**。默认 `ch`（中文/中英混排），可选英文 `en` 等。 |
| `extra_formats` | 字符串数组 (`Array<string>`) | 否 | `[]` | **额外输出格式**。支持传入 `["html"]`，解析完成后将在文件的 `html` 字段中返回对应的 HTML 排版代码。 |

---

## 输出结果说明

无论是 `parseLocal` 还是 `parseRemote`，均返回统一标准化的输出对象：

### 顶层输出字段

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| `result` | 字符串 (`string`) | **合并后的 Markdown 正文**。按输入文件顺序拼接所有文件的 Markdown 解析结果，文件间使用 `\n\n---\n\n` 分隔。正文中的配图相对路径已自动替换为 FastGPT 对象存储的直链 URL。 |
| `files` | 对象数组 (`Array<object>`) | **各文件的独立解析结果详情列表**。包含每个文件的具体内容、提取图片、结构化数据及错误状态。 |

### `files` 数组元素结构

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| `filename` | 字符串 (`string`) | 解析文件的原始文件名（如 `attention_is_all_you_need.pdf`）。 |
| `markdown` | 字符串 (`string`) | 当前文件解析出的 Markdown 正文。公式规范化为 LaTeX，排版还原为标准 Markdown，图片路径已自动替换为直链。 |
| `html` | 字符串 (`string`) | （可选）当前文件解析后的 HTML 富文本排版内容。在 `parseRemote` 中传入 `extra_formats: ["html"]` 时返回。 |
| `images` | 字符串数组 (`Array<string>`) | （可选）从当前文件中提取的所有内嵌插图/表格截图在 FastGPT 文件存储服务中的**直链访问 URL 列表**。 |
| `contentList` | 对象数组 (`Array<object>`) | （可选）当前文件解析后的**结构化数据块列表**（包含文本段落 `text`、标题 `heading`、表格 `table`、公式 `equation`、图片 `image` 等类型的分块元数据），在 `parseLocal` 中开启 `return_content_list: true` 时返回。 |
| `errorMsg` | 字符串 (`string`) | （可选）若当前文件解析失败，返回具体的错误描述或原因（如 Token 鉴权失败、文件读取超时、格式不支持等）。 |

### 输出示例

```json
{
  "result": "# Attention Is All You Need\n\n## Abstract\n\nThe dominant sequence transduction models are based on complex recurrent or convolutional neural networks...\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\n![Figure 1: The Transformer model architecture](https://fastgpt.internal/api/files/download/model_arch_6a8f12.png)\n\n| Model | BLEU (EN-DE) | Training Cost (FLOPs) |\n| :--- | :--- | :--- |\n| Transformer (base model) | 27.3 | 3.3e18 |\n| Transformer (big model) | 28.4 | 2.3e19 |",
  "files": [
    {
      "filename": "attention_is_all_you_need.pdf",
      "markdown": "# Attention Is All You Need\n\n## Abstract\n\nThe dominant sequence transduction models are based on complex recurrent or convolutional neural networks...\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\n![Figure 1: The Transformer model architecture](https://fastgpt.internal/api/files/download/model_arch_6a8f12.png)\n\n| Model | BLEU (EN-DE) | Training Cost (FLOPs) |\n| :--- | :--- | :--- |\n| Transformer (base model) | 27.3 | 3.3e18 |\n| Transformer (big model) | 28.4 | 2.3e19 |",
      "images": [
        "https://fastgpt.internal/api/files/download/model_arch_6a8f12.png",
        "https://fastgpt.internal/api/files/download/attention_visual_9b3c45.png"
      ],
      "html": "<h1>Attention Is All You Need</h1><h2>Abstract</h2><p>The dominant sequence transduction models...</p>",
      "contentList": [
        {
          "type": "title",
          "text": "Attention Is All You Need"
        },
        {
          "type": "text",
          "text": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks..."
        },
        {
          "type": "equation",
          "text": "$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$"
        },
        {
          "type": "image",
          "img_path": "https://fastgpt.internal/api/files/download/model_arch_6a8f12.png"
        },
        {
          "type": "table",
          "table_body": "| Model | BLEU (EN-DE) | Training Cost (FLOPs) |\n| :--- | :--- | :--- |\n| Transformer (base model) | 27.3 | 3.3e18 |\n| Transformer (big model) | 28.4 | 2.3e19 |"
        }
      ]
    }
  ]
}
```

---

## 典型工作流编排示例

### 场景一：配合文件上传节点实现高精度学术论文/研报研读对话

1. **添加文件上传与输入节点**：在 FastGPT 应用编排中添加「用户文件上传」或「对话输入」前置节点。
2. **连接 MinerU 解析节点**：
   - 选用 **`parseRemote`（SaaS 模式）** 或 **`parseLocal`（私有部署模式）** 节点。
   - 将上游文件输出变量（例如 `{{fileUrls}}`）绑定至本工具节点的 `files` 参数。
   - 开启公式识别（`enable_formula: true` / `formula_enable: true`）与表格识别（`enable_table: true` / `table_enable: true`）。
   - （可选）若选用 `parseRemote`，可将 `model_version` 设置为 `vlm` 体验新一代视觉大模型高保真图文解析。
3. **连接大模型处理节点**：
   - 将 MinerU 节点的输出变量 `result` 连接至「AI 对话 / LLM 处理」节点的系统提示词或上下文引用。
   - 编写针对性提示词：“你是一名资深科研论文专家，请根据上述解析出的论文 Markdown（包含完整的 LaTeX 数学公式和实验表格），详细梳理该研究的方法架构、核心公式推导，并客观评价其实验指标。”
4. **效果**：对话时不仅能精准输出带有数学公式推导的回答，还能在 FastGPT 前端直接查看论文提取的高清架构图与图表。

### 场景二：企业高保真多模态知识库 RAG 入库预处理

1. **批量获取待入库文件直链**：整理企业内网中的技术规范、审计财报、学术教材或专利文献下载地址。
2. **结构化提取与切片**：
   - 调用 `parseLocal`（设置 `return_content_list: true`）或 `parseRemote` 工具。
   - 提取规范格式的 Markdown 文本与独立的 `images` 直链列表。
3. **知识库切分入库**：
   - 将清洗且排版整齐的 Markdown 文档导入 FastGPT 知识库。
   - 得益于 MinerU 对公式（规范为 LaTeX）、复杂表格（还原为 Markdown 矩阵）和层级标题的还原，知识库切片时不会产生断句混乱或表格字符撕裂，极大提升向量化召回的精确度。

---

## 注意事项

1. **文件网络可达性与直链要求**：传入的 `files` 必须为外部网络或 FastGPT 服务网络可直接免登录下载的有效 URL 直链。请避免传入需要鉴权 Cookie 或前端重定向的网页链接。
2. **异步排队解析机制与耗时**：
   - `parseRemote`（SaaS 模式）采用云端分布式异步排队任务管线，任务提交后会以 5 秒为间隔自动轮询结果，最大重试次数为 100 次（整体超时约为 8.3 分钟）。
   - 针对数十页甚至上百页的长篇 PDF、超高分辨率扫描件，解析耗时可能在数十秒至数分钟不等，请确保应用流程或代理超时时间充足。
   - 多文件将批量提交，整体耗时取决于任务队列排队状态与各单篇文件的最大解析耗时。
3. **SaaS 服务配额与 Token 鉴权**：
   - SaaS 在线解析需要消耗 MinerU 官方账户的点数或额度。若遇到错误代码 `A0202`（Token 错误）或 `A0211`（Token 过期），请登录 [MinerU 开放平台](https://mineru.net/apiManage/docs) 重新获取有效 Token 并更新插件密钥。
4. **私有化本地部署算力与环境要求**：
   - 使用 `parseLocal` 时，需确保私有服务器上已经部署并正常运行 MinerU API v2 服务（提供 `/file_parse` 接口）。
   - 若选择 `vlm-*` 等视觉大模型推理后端，需配置充足的 GPU 显存（建议单卡 24GB 或以上），或通过 `sglang_server_url` 连接独立的分布式推理集群。
5. **图片自动转存托管机制**：
   - 节点在解析完成后，会将文档中抽取的各内嵌图片自动调用 FastGPT 宿主环境的 `uploadFile` 接口上传至对象存储，并自动将 Markdown 正文中的相对引用（`images/xxx.png`）替换为有效访问直链。在无宿主支持的测试环境调用时，将自动退化为 Base64 Data URL。

---

## 本地开发与测试

```bash
# 安装依赖
pnpm install

# 运行单元测试
pnpm run test

# 构建产物
pnpm run build

# 校验插件规范
npx @fastgpt-plugin/cli check --entry .
```

