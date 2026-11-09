# 秘塔 AI 搜索工具集 (Metaso AI Search)

秘塔 AI 搜索（Metaso）是由上海秘塔网络科技有限公司打造的新一代智能搜索引擎，以“没有广告，直达结果”和精准的结构化总结著称。本插件为 FastGPT 智能体与工作流提供原生的秘塔 AI 搜索能力集成，支持全网网页、专业文档、学术文献、图片、视频、播客等多维垂直信源检索，并提供高质量的大模型智能长摘要提取，为下游大语言模型提供新鲜、准确、可溯源的结构化外部知识支撑。

## 典型应用场景

- **深度学术与研报检索**：通过指定 `scholar`（学术文献）或 `document`（研报文档）范围，快速检索中英文学术期刊、学位论文、行业白皮书与券商研报，自动返回作者、发表日期与核心结论摘要，赋能自动化科研综述与商业行研报告生成。
- **全网垂直领域搜索**：支持除常规网页外，定向检索图片（`image`）、视频（`video`）以及播客音频（`podcast`）等多媒体垂直信源，满足跨媒介信息挖掘、音视频素材采编与内容分析需求。
- **高质量多源信息交叉验证**：依托秘塔强大的信息清洗能力，有效过滤垃圾营销号与内容农场，提供规范的信源链接与出处，用于检索增强（RAG）流程中的事实核查与多方交叉印证，大幅降低大模型幻觉。
- **中文语义搜索增强**：基于针对中文自然语言特征深度优化的自研理解模型，精准捕捉复杂长句、隐式意图与专业领域术语，解决传统关键词检索对于长尾问题理解不充分的痛点。

---

## 密钥配置说明

使用本插件需要在 FastGPT 插件配置的密钥（Secrets）区域中配置秘塔开放平台的 API 密钥（`apiKey`）。

### 获取渠道

1. 访问并登录 [秘塔 AI 搜索官网](https://metaso.cn) 或秘塔开发者开放平台。
2. 登录个人或企业账号后，进入开发者中心或 API 凭据管理页面。
3. 申请并创建新的 API Key，复制生成的密钥字符串。
4. 将该密钥妥善保存，在 FastGPT 插件管理或应用工作流节点中填入。

### 密钥配置项

| 配置字段 | 类型 | 是否保密 | 必填 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `apiKey` | 字符串 (`string`) | 是 (`isSecret: true`) | 是 | 秘塔开放平台 API 密钥。请求时将作为 Bearer Token 置于 HTTP Authorization 请求头（`Authorization: Bearer <apiKey>`）用于身份鉴权认证。 |

---

## 子工具列表

本工具集包含以下子工具：

| 工具标识 (`id`) | 工具名称 | 功能描述 |
| :--- | :--- | :--- |
| `metasoSearch` | 秘塔搜索 (Metaso Search) | 使用秘塔 API 进行全网网络搜索，支持多维度内容检索范围与 AI 智能结果摘要提取。 |

---

## 输入参数 (`metasoSearch`)

| 参数名 | 类型 | 默认值 | 必填 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `query` | 字符串 (`string`) | 无 | 是 | **搜索关键词 / 查询语句**。需要检索的核心词汇、短语或自然语言问题。工具会自动裁剪两端空白字符。 |
| `scope` | 枚举字符串 (`string`) | `all` | 否 | **指定搜索的内容范围类型**。可选枚举值：<br>• `all`：全部类型（全网综合检索，默认）<br>• `webpage`：普通网页与新闻资讯<br>• `document`：专业文档、行业报告与公开文库<br>• `scholar`：学术论文、期刊文献与学术成果<br>• `image`：图片多模态检索<br>• `video`：视频内容与多媒体视频源<br>• `podcast`：播客音频与网络电台节目 |
| `size` | 数值 (`number`) | `20` | 否 | **返回结果条数**。有效取值范围为 `1` ~ `20` 的整数，默认为 `20` 条。 |
| `includeSummary` | 布尔值 (`boolean`) | `true` | 否 | **是否包含智能摘要**。默认为 `true`。设为 `true` 时，由秘塔大模型提取高密度的核心内容长摘要；设为 `false` 则仅返回基础上下文片段。 |

---

## 输出结果说明

插件执行成功后返回顶层对象，包含 `result` 数组；当 API 返回异常或检索结果为空时，将自动抛出错误信息提示。

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `result` | 对象数组 (`Array<Object>`) | 检索到的结构化结果列表。不同 `scope` 范围下条目包含的属性字段略有差异。 |

### `result` 数组条目结构详解

根据检索范围（`scope`）的不同，返回的单条对象结构定义如下：

| 字段名 | 类型 | 适用范围 (`scope`) | 字段说明 |
| :--- | :--- | :--- | :--- |
| `title` | 字符串 (`string`) | 全部 (`all`, `webpage`, `document`, `scholar`, `image`, `video`, `podcast`) | 搜索结果的标题或资源名称。 |
| `link` | 字符串 (`string`) | `all`, `webpage`, `document`, `scholar`, `video`, `podcast` | 网页、文档、学术论文或多媒体条目的原始访问链接 URL。 |
| `snippet` | 字符串 (`string`) | 可选全部（除 `image` 外） | 搜索结果匹配词上下文摘要片段。 |
| `summary` | 字符串 (`string`) | `all`, `webpage`, `document`, `scholar` | AI 智能提炼的长文本核心摘要（开启 `includeSummary: true` 时返回）。 |
| `authors` | 字符串数组 (`string[]`) | `all`, `webpage`, `scholar`, `video`, `podcast` | 作者、撰写机构、UP 主或发布频道列表。 |
| `date` | 字符串 (`string`) | `all`, `webpage`, `scholar`, `video`, `podcast` | 内容发布日期或文献发表时间（如 `2024-05-18`）。 |
| `imageUrl` | 字符串 (`string`) | `image` | 图片搜索模式下返回的目标图片直链 URL。 |
| `coverImage` | 字符串 (`string`) | `video` | 视频搜索模式下返回的视频封面缩略图 URL。 |

### 返回示例 (JSON)

#### 1. 网页 / 学术文献 / 文档检索示例 (`scope: "webpage" | "scholar" | "document"`)

```json
{
  "result": [
    {
      "title": "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning",
      "link": "https://arxiv.org/abs/2501.12948",
      "snippet": "We introduce DeepSeek-R1-Zero and DeepSeek-R1, trained via large-scale reinforcement learning...",
      "summary": "DeepSeek-R1 论文详细阐述了通过纯强化学习（RL）激发大语言模型复杂推理能力的技术路径，在无需大量监督微调数据的前提下实现了优异的数学推理与代码生成表现。",
      "authors": ["Daya Guo", "Dejian Yang", "Haowei Zhang", "Chenggang Zhao"],
      "date": "2025-01-22"
    }
  ]
}
```

#### 2. 多媒体与视频检索示例 (`scope: "video"`)

```json
{
  "result": [
    {
      "title": "人形机器人具身智能核心技术深度拆解与前瞻",
      "link": "https://www.bilibili.com/video/BV1xx4y1x7xx",
      "snippet": "本视频深入分析了当前人形机器人运动控制算法与端到端大模型的融合方案...",
      "authors": ["硬核科技观察"],
      "date": "2024-11-10",
      "coverImage": "https://i0.hdslb.com/bfs/archive/cover_sample.jpg"
    }
  ]
}
```

---

## 典型工作流编排示例

### 场景：配合下游大模型生成深度研究报告

在 FastGPT 高级编排工作流中，可将秘塔搜索作为高置信度外部知识源，串联下游推理大模型生成结构严谨的行业研报：

```
[用户提问]
   ↓
[意图分析与查询改写 (LLM 节点)]
   ↓ (输出优化后的关键词与检索范围，例如 query: "固态电池量产进展与产业化瓶颈", scope: "document")
[秘塔智能搜索 (metasoSearch 节点)]
   ↓ (获取权威研报列表及 AI 提炼的长文本摘要)
[报告撰写大模型 (LLM 节点)]
   ↓ (结合研报内容、作者与发表日期，生成结构化研究报告并标注文献出处)
[输出最终研报 (响应节点)]
```

#### 节点配置与提示词参考

1. **秘塔搜索节点输入配置**：
   - **`query`**：`{{意图分析.query}}`（例如：`"固态电池技术路径与产业化落地进展"`）
   - **`scope`**：`"document"`（或 `"scholar"`）
   - **`size`**：`6`
   - **`includeSummary`**：`true`

2. **报告撰写 LLM 节点系统提示词 (System Prompt)**：
   ```markdown
   你是一名资深行业分析师。请结合以下通过秘塔 AI 搜索检索到的最新权威资料与核心摘要，撰写一份结构化深度研究报告。

   【参考资料】：
   {{#each metasoSearch.result}}
   [{{@index + 1}}] 标题：{{title}}
   来源链接：{{link}}
   发布日期：{{date}} | 作者/机构：{{authors}}
   核心摘要：{{summary}}
   ---
   {{/each}}

   【报告撰写要求】：
   1. 报告必须包含：行业现状概述、核心技术路线对比、主要商业化瓶颈与落地时间表、未来趋势预测。
   2. 引用具体数据和事实时，务必标注对应的参考资料角标（例如 [1]、[2]）。
   3. 报告末尾统一附上“参考信源与报告列表”。
   ```

---

## 注意事项

1. **密钥安全性**：请在 FastGPT 的“密钥”配置中妥善保存 `apiKey`，切勿将明文密钥上传至公开代码库或分享给未授权人员。
2. **接口配额与调用频次限制 (Rate Limits)**：秘塔开放平台对 API 调用的 QPS（每秒并发请求数）及总配额有一定限制。若在并发或批量处理场景下使用，建议控制调用速率并在工作流中做好异常重试机制。
3. **网络连通性**：本插件底层调用秘塔官方 OpenAPI 服务（`https://metaso.cn/api/v1/search`）。若 FastGPT 运行在私有化机房或容器环境中，请确保宿主机网络可连通公网域名 `metaso.cn`，且 443 端口未被防火墙阻断。
4. **Scope 范围与返回字段差异**：不同 `scope` 检索范围返回的数据字段有所差异（如 `image` 返回 `imageUrl`，`video` 返回 `coverImage`）。在配置工作流下游节点时，请根据选用的 `scope` 适配相应的数据字段提取逻辑。
5. **Token 上下文管理**：当 `includeSummary` 为 `true` 且 `size` 较大（如接近上限 20）时，返回的摘要内容总量可能较长。建议根据下游大模型的上下文窗口大小，合理设置 `size`（通常建议单次检索取 5~10 条）以平衡检索覆盖面与 Token 消耗。

---

## 本地开发与测试

在当前插件目录（`packages/tools/metaso`）下运行以下指令：

```bash
# 安装依赖
pnpm install

# 运行单元测试
pnpm run test

# 构建产物
pnpm run build

# 校验插件规范与产物结构
npx @fastgpt-plugin/cli check --entry .

# 打包为 .pkg 分发包
pnpm run pack
```

