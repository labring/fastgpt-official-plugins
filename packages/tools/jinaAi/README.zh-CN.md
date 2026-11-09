# Jina AI 智能搜索与深度网页解析 (Jina AI Tool Set)

`jinaAi` 是 FastGPT 官方提供的 Jina AI 智能搜索与深度网页内容解析工具集。本工具集集成了 Jina AI Reader（无头浏览器深度网页解析与清洗）与 Jina AI Search（大模型优化的高精度互联网智能搜索）两大核心能力，专为现代大语言模型（LLM）与智能体（Agent）打造，助力轻松获取干净、结构化的高质量网页内容与实时全网信息。

## 典型应用场景

- **现代动态前端站点与单页应用 (SPA) 深度解析**：基于无头浏览器（Headless Browser）执行页面 JavaScript 与异步渲染，完美支持 React、Vue、Next.js 等现代前端框架构建的动态页面，将其深度提取并清洗为 LLM 最友好的标准 Markdown 格式。
- **无头浏览器网页快照与截图分析**：支持一键捕获目标网页的可视区域截图（`screenshot`）或整页全景快照（`pageshot`），直接对接多模态视觉大模型（Vision LLMs）进行网页 UI/UX 审查、图表解析或设计还原。
- **基于大语言模型的全网精准语义搜索**：专为智能体优化的网络搜索接口，能够理解复杂自然语言查询，返回高相关度、低噪声的搜索结果列表，支持指定国家地区与输出语言。
- **深度联网知识库检索增强 (Agent RAG)**：结合搜索与网页解析能力，可在搜索阶段直接深度抓取目标网页的完整正文（`readFullContent`），消除模型知识时效性盲区与事实幻觉，构建强有力的外部实时信息闭环。

---

## 密钥配置说明

使用本工具集需要配置 Jina AI 开放平台的 API 密钥（`apiKey`）。

### 获取渠道与免费配额

1. 访问 [Jina AI Reader 官网](https://jina.ai/reader/) 或进入 [Jina AI 开发者平台](https://jina.ai)。
2. 注册并登录个人或企业账户。
3. 在控制台的 **API Keys** 管理页面中生成并复制以 `jina_` 开头的 API 密钥（例如 `jina_xxxxxxxxxxxxxxxxxxxxxxxx`）。
4. **配额说明**：Jina AI 为新注册账户提供充裕的免费 Token 配额（通常为 100 万免费 Tokens），可在控制台实时查看用量，超额后支持灵活充值升级。

### 配置方式

在 FastGPT 插件配置的密钥（Secrets）区域中填写以下字段：

| 字段名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `apiKey` | 字符串 (`string`) | 是 | Jina AI API 密钥，格式为 `jina_xxxxxxxxxxxxxxxx`。请求时将作为 Bearer Token 随 HTTP Header 发送进行鉴权认证。 |

---

## 子工具列表

本工具集包含以下两个高内聚的核心子工具：

1. **`jinaAiReader`（Jina AI 网页解析）**：基于 Jina Reader 核心服务，通过云端无头浏览器渲染任何动态或静态网页，智能剥离广告、导航栏与干扰元素，输出干净的 Markdown、HTML、纯文本或网页截图 URL。
2. **`jinaAiSearch`（Jina AI 搜索）**：基于 Jina Search 智能搜索引擎，面向大模型语义理解优化，支持全球多地区与多语言定制，可直接一站式返回搜索条目与网页完整正文。

---

## 子工具 1：Jina AI 网页解析 (`jinaAiReader`)

### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `url` | 字符串 (`string`) | 是 | 无 | **目标网页 URL**。需要抓取和解析的网页地址，须包含 `http://` 或 `https://` 协议前缀。 |
| `returnFormat` | 枚举字符串 (`string`) | 否 | `default` | **指定内容返回的格式类型**。支持以下选项：<br>• `default`：标准 Markdown 格式（默认，等同于 `markdown`）<br>• `markdown`：标准 Markdown 格式正文<br>• `html`：经浏览器渲染清洗后的 HTML 代码<br>• `text`：纯文本格式内容<br>• `screenshot`：网页当前可视区域（视口）的屏幕截图图片链接<br>• `pageshot`：网页完整滚动的全长截图图片链接 |

### 输出结果

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `title` | 字符串 (`string`) | 提取出的网页标题文本。若页面无标题则为空字符串。 |
| `description` | 字符串 (`string`) | 网页元信息中的描述内容（Meta Description）或核心概括。 |
| `content` | 字符串 (`string`) | 提取出的网页主要内容。根据输入的 `returnFormat` 参数，返回对应的 Markdown 文本、HTML 源码、纯文本，或屏幕截图的图片 URL 链接。 |

#### 输出示例 1：默认 Markdown 格式

```json
{
  "title": "FastGPT - 基于 LLM 的开源 AI 知识库平台",
  "description": "FastGPT 是一个基于 LLM 大语言模型的知识库问答系统，提供开箱即用的数据处理、模型调用与可视化工作流编排能力。",
  "content": "# FastGPT\n\nFastGPT 是一款企业级 AI 知识库与智能体编排平台。\n\n## 核心特性\n- **可视化工作流**：支持节点拖拽连线，灵活编排复杂任务流程。\n- **混合检索**：融合向量相似度、全文检索与重排算法。\n- **插件生态**：支持官方与社区自定义插件接入。"
}
```

#### 输出示例 2：截图模式 (`returnFormat: "screenshot"`)

```json
{
  "title": "FastGPT 官网首页",
  "description": "FastGPT 官方网站与产品展示",
  "content": "https://image.jina.ai/screenshot/snapshot_20250220_abc123.jpg"
}
```

---

## 子工具 2：Jina AI 搜索 (`jinaAiSearch`)

### 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `query` | 字符串 (`string`) | 是 | 无 | **搜索关键词或查询语句**。支持自然语言问句或关键词组合，用于在互联网检索最相关的网页。 |
| `country` | 枚举字符串 (`string`) | 否 | 无 | **搜索地区代码**。用于限定或优先返回指定地域的相关结果。可选值：<br>• `CN`：中国<br>• `US`：美国<br>• `GB`：英国<br>• `JP`：日本<br>• `KR`：韩国<br>• `FR`：法国 |
| `language` | 枚举字符串 (`string`) | 否 | 无 | **搜索语言代码**。指定返回结果的主体语言。可选值：<br>• `zh-cn`：简体中文<br>• `en`：英语<br>• `ja`：日语<br>• `ko`：韩语<br>• `fr`：法语 |
| `readFullContent` | 布尔值 (`boolean`) | 否 | `false` | **是否读取完整正文**。<br>• `false`（默认）：仅返回搜索条目的标题、摘要与链接，响应速度极快且节省 Token。<br>• `true`：由 Jina 引擎直接抓取各搜索条目落地页的完整 Markdown 正文并填入 `content` 字段，实现一站式深度检索。 |

### 输出结果

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `result` | 对象数组 (`Array<Object>`) | 结构化搜索结果列表，按相关度排序。 |

#### `result` 列表中单个对象的结构：

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `title` | 字符串 (`string`) | 搜索结果的网页标题。 |
| `description` | 字符串 (`string`) | 搜索结果网页的内容摘要片段。 |
| `url` | 字符串 (`string`) | 目标网页的完整访问 URL 链接。 |
| `content` | 字符串 (`string`) | 可选。当 `readFullContent` 为 `true` 时返回该网页的完整 Markdown 正文；当为 `false` 时此项为 `undefined`。 |

#### 输出示例 1：基础搜索模式 (`readFullContent: false`)

```json
{
  "result": [
    {
      "title": "FastGPT 官方文档 - 快速上手指南",
      "description": "FastGPT 是一款基于 LLM 大语言模型的企业级知识库问答与工作流编排系统，支持多模型接入与丰富的插件生态。",
      "url": "https://doc.fastgpt.in/docs/intro"
    },
    {
      "title": "labring/FastGPT - GitHub 开源仓库",
      "description": "FastGPT is a knowledge-based platform built on the LLMs, offers a comprehensive suite of out-of-the-box capabilities...",
      "url": "https://github.com/labring/FastGPT"
    }
  ]
}
```

#### 输出示例 2：全正文检索模式 (`readFullContent: true`)

```json
{
  "result": [
    {
      "title": "FastGPT 官方文档 - 快速上手指南",
      "description": "FastGPT 是一款基于 LLM 大语言模型的企业级知识库问答系统...",
      "url": "https://doc.fastgpt.in/docs/intro",
      "content": "# 快速上手 FastGPT\n\nFastGPT 允许用户导入文档、网站链接与 API 数据...\n\n## 部署与安装\n推荐使用 Docker Compose 快速部署..."
    }
  ]
}
```

---

## 插件对比与选型建议 (Jina AI vs fetchUrl)

在 FastGPT 官方插件库中，`jinaAi` 与 `fetchUrl` 均提供了网页抓取与 Markdown 转换能力。可根据业务场景合理选型：

| 维度 | Jina AI (`jinaAiReader`) | 网页抓取 (`fetchUrl`) |
| :--- | :--- | :--- |
| **底层实现机制** | 云端无头浏览器（Headless Browser），真实渲染 DOM | 服务端轻量 HTTP GET 请求，直接获取原始 HTML |
| **动态 SPA 网页支持** | **完美支持**（可执行 React、Vue、Next.js 等 JS 脚本） | 不支持（动态客户端渲染页面通常仅能获取到空容器骨架） |
| **网页截图 / 快照能力** | **支持**（提供 `screenshot` 视口截图与 `pageshot` 全长截图） | 不支持 |
| **全网智能搜索功能** | **内置** `jinaAiSearch`（支持直接抓取全量网页正文） | 无搜索功能，仅支持输入指定 URL |
| **API 密钥与外部依赖** | 需配置 Jina AI `apiKey`，受云端配额限制 | **免配置密钥**，由服务宿主直接发起请求 |
| **响应速度与延迟** | 需等待无头浏览器加载与渲染，通常在 1~3 秒左右 | 极快（通常数十到数百毫秒） |
| **网络边界与内网环境** | 由 Jina 外部公网服务抓取，**无法访问企业私有内网/Localhost** | 具备严格 SSRF 白名单与内网阻断机制，部署于本地可按需访问特定内网 |
| **推荐适用场景** | 复杂前端站点、动态渲染长文、需网页截图、Agent 深度调研与搜索 | 静态官方文档、新闻门户、博客长文等轻量快速解析场景 |

---

## 典型工作流编排示例与最佳实践

### 示例一：动态 SPA 网页深度解析与 AI 智能总结

解决传统爬虫无法抓取 React/Vue 单页应用的问题，利用 `jinaAiReader` 获取完整渲染后的 Markdown 并交由 LLM 提炼关键观点。

```
[用户提问/网页链接] ──> [Jina AI 网页解析 (jinaAiReader)] ──> [AI 对话 (LLM 总结)] ──> [回复用户]
```

#### 编排步骤：
1. **添加「Jina AI 网页解析」节点**：
   - 将工作流起始节点用户输入的网页链接（如 `{{url}}`）绑定至 `url` 参数。
   - `returnFormat` 保持默认 `default`（或显式选为 `markdown`）。
2. **连接下游「AI 对话」节点**：
   - 在 AI 对话节点的系统提示词（System Prompt）中引用 `{{title}}` 与 `{{content}}`。
3. **提示词配置模板**：
   ```markdown
   你是一位专业的网页分析专家。请根据下方通过无头浏览器渲染解析出的网页内容进行深度分析与总结：

   【网页标题】：{{title}}
   【页面内容】：
   {{content}}

   【任务要求】：
   1. 概括该页面的核心业务/技术主旨（不超过 200 字）。
   2. 列出文章中提及的 3-5 个核心要点与关键结论。
   3. 客观真实，仅依据提供的内容作答，切勿编造虚假信息。
   ```

---

### 示例二：Agent 深度联网搜索与全量事实核查 (RAG)

利用 `jinaAiSearch` 的 `readFullContent: true` 特性，一键获取包含全网前沿事实正文的搜索结果，打造时效性无懈可击的智能问答助手。

```
[用户提问] ──> [Jina AI 搜索 (readFullContent: true)] ──> [AI 对话 (事实整合问答)] ──> [回复用户]
```

#### 编排步骤：
1. **配置「Jina AI 搜索」节点**：
   - 将用户自然语言问题绑定至 `query`。
   - 将 `readFullContent` 设置为 `true`。
   - 根据面向的用户群体配置 `language` 为 `zh-cn`，`country` 为 `CN`。
2. **配置下游「AI 对话」节点**：
   - 引用 `jinaAiSearch` 节点的 `result` 变量，作为外部事实依据上下文注入。
3. **提示词配置模板**：
   ```markdown
   你是一个具备实时联网检索能力的权威顾问。以下是搜索引擎实时获取的相关网页与详细正文内容：

   {{result}}

   请结合上述实时参考资料，严谨、客观地回答用户的提问。在关键论点后标注引用的来源标题与网页链接。
   ```

---

### 示例三：网页快照捕获与视觉多模态分析 (Vision Agent)

利用 `jinaAiReader` 的 `returnFormat: "screenshot"` 生成网页实时快照，并将其交由支持多模态的大模型进行视觉审计。

```
[用户提供网址] ──> [Jina AI 网页解析 (returnFormat: screenshot)] ──> [多模态大模型 (UI 审查)] ──> [输出评价]
```

- 将 `jinaAiReader` 输出的 `content`（图片 URL）作为图片变量输入至多模态视觉模型节点（如 GPT-4o、Claude 3.5 Sonnet）。
- 提示词可用于识别网页视觉层级、响应式排版缺陷或进行无障碍（Accessibility）分析。

---

## 注意事项与使用限制

1. **API 配额与速率限制 (Rate Limits)**：
   - Jina AI 对免费与各层级付费账户设有每分钟并发请求数（RPM）与月度 Token 配额上限。若并发超出限制，接口将返回 HTTP 429 错误。建议在复杂工作流或批量处理场景下适当控制调用频率。
2. **长页面渲染与超时保护**：
   - `jinaAiReader` 在云端启动无头浏览器并等待页面网络空闲（Network Idle）。对于超大型页面或包含大量阻塞脚本的站点，渲染时间可能会延长。插件内部默认配置了 30 秒至 120 秒超时控制，避免流程长时间悬挂。
3. **私网与本地地址不可达**：
   - Jina AI 的请求由 Jina 官方位于公网的分布式计算集群发起，**无法解析或抓取局域网私有 IP（如 `192.168.x.x`、`10.x.x.x`）或本地宿主机服务（如 `http://localhost:3000`）**。如需抓取内网文档，请使用 FastGPT 局域网内可直连的其他抓取插件。
4. **截图数据体积与有效期**：
   - 使用 `screenshot` 或 `pageshot` 时，返回的链接为 Jina 临时托管的高清图像。如需长期存档或作为历史版本留存，建议将图像转存至对象存储（S3 / OSS / 飞书云盘等）。
5. **复杂人机验证拦截**：
   - 尽管 Jina AI 内置了强大的反爬规避与动态脚本渲染机制，但对于少数部署了极严苛防爬策略（如要求人工滑块验证或强交互式 Cloudflare Turnstile）的站点，仍可能遭遇拦截或只能获取部分可见内容。

---

## 本地开发与校验

在插件目录 `packages/tools/jinaAi` 下可运行以下命令进行本地构建与插件合规检查：

```bash
# 安装依赖（在仓库根目录执行）
pnpm install

# 编译与打包
pnpm run build

# 校验插件规范与产物结构
npx @fastgpt-plugin/cli check --entry .

# 本地单元测试
pnpm run test
```

