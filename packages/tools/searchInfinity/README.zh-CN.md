# 火山引擎融合信息搜索 (Volcano SearchInfinity)

火山引擎融合信息搜索（SearchInfinity）是基于字节跳动强大检索能力构建的高级互联网信息检索工具。本插件专为大语言模型（LLM）与 FastGPT 智能体工作流设计，提供海量优质网页索引、全网智能检索、域名定向过滤（白名单）、时间范围筛选以及网页深度 AI 摘要等特性，助力智能体获取高时效性信息、验证事实信源并大幅降低模型幻觉。

---

## 典型应用场景

- **全网实时资讯检索**：快速追踪最新的新闻事件、行业动态与政策发布，配合 `time_range` 时间范围过滤，精准获取最新发布的时效性信息。
- **政企权威信源定向搜索**：借助 `sites` 域名白名单过滤功能，将检索范围锁定在政府机关（`gov.cn`）、高校科研机构（`edu.cn`）或权威媒体官方网站，确保返回结果权威可靠。
- **知识库 RAG 事实补充**：作为外置网络搜索信源与大模型检索增强问答（RAG）深度融合，在私有知识库置信度不足或未覆盖用户问题时补充权威事实。
- **AI 自带长摘要搜索**：启用 `web_summary` 搜索模式，服务端直接返回由 AI 提炼的网页核心长文本深度摘要，无需下游大模型重复阅读冗长正文即可获取精练洞见。

---

## 密钥与凭据配置

本插件支持**双鉴权模式**（`apiKey` 直连认证 或 火山引擎 `AK/SK` 组合认证，**二选一**配置即可）。

在 FastGPT 插件配置的「全局变量 / 密钥 (Secrets)」区域中进行配置：

| 字段名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `apiKey` | 字符串 (`string`) | 选填（二选一） | SearchInfinity 开放平台 API 密钥。使用直连认证模式时填写，请求将作为 Bearer Token 发送至直连网关。 |
| `volcengineAccessKey` | 字符串 (`string`) | 选填（二选一） | 火山引擎访问密钥 Access Key ID。使用火山引擎官方网关认证时，与 `volcengineSecretKey` 成对配合填写。 |
| `volcengineSecretKey` | 字符串 (`string`) | 选填（二选一） | 火山引擎私有密钥 Secret Access Key。使用火山引擎官方网关认证时，与 `volcengineAccessKey` 成对配合填写。 |

### 双认证模式说明

1. **模式一：API Key 直连认证（推荐轻量集成）**
   - **配置字段**：仅需填写 `apiKey`，留空 `volcengineAccessKey` 与 `volcengineSecretKey`。
   - **调用网关**：`https://open.feedcoopapi.com/search_api/web_search`。
   - **鉴权机制**：在请求头中携带 `Authorization: Bearer <apiKey>` 以及 `X-Traffic-Tag: fast_gpt_search_web`。
   - **获取渠道**：联系官方合作渠道或参考 [火山引擎融合信息搜索接入文档](https://bytedance.larkoffice.com/wiki/IBdwwBuBAiXlclkqExDcqdMinpg) 申请开通。

2. **模式二：火山引擎 AK/SK 组合认证（企业云原生推荐）**
   - **配置字段**：同时填写 `volcengineAccessKey` 和 `volcengineSecretKey`，留空 `apiKey`。
   - **调用网关**：火山引擎官方 API 网关 `https://mercury.volcengineapi.com/?Action=WebSearch&Version=2025-01-01`。
   - **鉴权机制**：基于火山引擎标准 AWS-like HMAC-SHA256 签名算法（服务名 `volc_torchlight_api`，区域 `cn-north-1`）动态计算生成 `Authorization` 请求头。
   - **申请指引**：
     1. 注册并登录 [火山引擎控制台](https://console.volcengine.com/)。
     2. 访问 [访问控制 (IAM) - 密钥管理](https://console.volcengine.com/iam/keymanage/) 页面。
     3. 新建或查看现有的 Access Key ID 与 Secret Access Key。
     4. 确保当前账号已开通融合信息搜索相关服务并拥有调用权限。

---

## 输入参数列表

| 参数名 | 类型 | 必填 | 默认值 | 取值范围 | 说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `query` | 字符串 (`string`) | 是 | 无 | 1 ~ 100 字符 | **搜索查询词**。要检索的自然语言问题或关键词短语，长度严禁超过 100 个字符。 |
| `count` | 数值 (`number`) | 否 | `10` | `1` ~ `50` | **返回结果条数**。指定检索返回的条目数量，默认为 10，最大支持 50 条。 |
| `searchType` | 枚举字符串 (`enum`) | 否 | `web` | `web` \| `web_summary` | **搜索模式**：<br>• `web`：标准网页搜索模式，返回页面核心内容及上下文片段；<br>• `web_summary`：深度摘要搜索模式（开启 NeedSummary），服务端返回 AI 提炼的高质量正文深度总结。 |
| `sites` | 字符串 (`string`) | 否 | `""` | 最多 5 个域名 | **域名白名单过滤**。限制仅在指定站点内检索。多个域名使用竖线 `\|` 分隔，**最多支持 5 个域名**（超出部分会自动截断前 5 个）。示例：`qq.com\|m.163.com`。注意无需携带 `http://` 或 `https://` 前缀。 |
| `time_range` | 枚举字符串 (`enum`) | 否 | 无限制 | `OneDay` \| `OneWeek` \| `OneMonth` \| `OneYear` | **时间范围过滤**。限定搜索指定时间窗口内发布的网页。可选值：<br>• `OneDay`：过去 24 小时（1天）内<br>• `OneWeek`：过去 1 周内<br>• `OneMonth`：过去 1 个月内<br>• `OneYear`：过去 1 年内 |

---

## 输出结果说明

插件执行成功后返回顶层对象，包含 `result` 数组；执行异常时输出错误信息。

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `result` | 对象数组 (`Array<Object>`) | 结构化搜索结果条目列表。 |
| `error` | 字符串 (`string`) | 选填。接口调用或参数校验失败时的异常说明。 |

### `result` 数组条目结构

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `Title` | 字符串 (`string`) | 网页标题。 |
| `Content` | 字符串 (`string`) | 搜索结果核心内容（按优先级合并：网页正文 Content > AI 摘要 Summary > 上下文匹配片段 Snippet）。 |
| `Url` | 字符串 (`string \| null`) | 网页完整跳转 URL 链接。 |
| `SiteName` | 字符串 (`string \| null`) | 来源站点名称（如“新华网”、“澎湃新闻”、“GitHub”等）。 |
| `PublishTime` | 字符串 (`string \| null`) | 网页发布时间（标准时间戳或格式化日期字符串）。 |
| `LogoUrl` | 字符串 (`string \| null`) | 来源站点 Logo 图标链接。 |
| `AuthInfoDes` | 字符串 (`string \| null`) | 权威认证与来源资质描述信息（如有）。 |

### 输出 JSON 示例

```json
{
  "result": [
    {
      "Title": "FastGPT - 基于 LLM 的下一代知识库问答与工作流编排平台",
      "Content": "FastGPT 是一款基于大语言模型的 AI 智能平台，提供开箱即用的数据向量化、复杂工作流编排以及多源数据检索集成能力。支持与火山引擎搜索、各类第三方大模型服务无缝打通，快速构建企业级智能问答与 Agent 应用。",
      "Url": "https://fastgpt.in",
      "SiteName": "FastGPT 官方网站",
      "PublishTime": "2025-02-20 10:30:00",
      "LogoUrl": "https://fastgpt.in/favicon.ico",
      "AuthInfoDes": "官方认证"
    },
    {
      "Title": "火山引擎开放平台接入指南与实践",
      "Content": "火山引擎为企业客户提供高并发、低延迟的融合信息搜索服务（SearchInfinity），支持通过 API Key 或 IAM 角色签名鉴权接入，覆盖全网主流中文权威门户与垂直资讯信源。",
      "Url": "https://www.volcengine.com/docs/search",
      "SiteName": "火山引擎",
      "PublishTime": "2025-02-18 16:45:00",
      "LogoUrl": "https://www.volcengine.com/favicon.ico",
      "AuthInfoDes": "权威企业号"
    }
  ]
}
```

---

## 典型工作流编排示例

在 FastGPT 中，`searchInfinity` 工具常用于构建高可靠的“联网检索增强（Web RAG）”工作流。经典编排链路如下：

```
[用户提问输入]
       │
       ▼
[前置大模型：意图识别与关键词提炼]
       │ (输出提取后的 query，且控制在 100 字符内)
       ▼
[火山融合信息搜索：searchInfinity]
       │ (输入 query, searchType, sites 等参数，输出 result)
       ▼
[下游大模型：带引用结构化回答]
       │
       ▼
[输出最终解答]
```

### 编排步骤详解

1. **前置大模型意图提取**：
   - 接收用户自然语言提问（如：“请查询国务院最近关于人工智能产业支持的最新政策？”）。
   - 由前置大模型判断联网必要性，提炼紧凑关键词（如 `国务院 人工智能 政策`），并可根据上下文决定是否注入权威网站过滤（如 `sites: "gov.cn"`）。
   - **注意**：由于火山搜索插件对 `query` 有 100 字符上限约束，大模型提炼关键词能有效防止长文本提问直接传递报错。

2. **配置 searchInfinity 插件节点**：
   - 添加「融合信息搜索」工具节点。
   - 参数配置：
     - `query`：绑定前置大模型生成的搜索词变量。
     - `searchType`：选择 `web_summary`，获取更高信息密度的深度摘要。
     - `count`：根据上下文配额设为 `5` ~ `10`。
     - `sites`：若需要权威信源，可配置 `gov.cn|xinhuanet.com`。

3. **下游大模型引用总结**：
   - 将 `searchInfinity.result` 作为上下文传入下游大模型节点。
   - 提示词（Prompt）模板示例：

```text
你是一个专业的智能研究助手。请依据下方从火山引擎融合信息搜索获取的真实参考信源，回答用户的问题。

### 参考检索资料：
{{searchInfinity.result}}

### 回答要求：
1. 严格依据上述参考信源陈述客观事实，不编造未提及的数据或观点。
2. 回答需层次分明、逻辑清晰。
3. 在引用关键事实或数据处，请务必标注出处链接，格式为：[网页标题](Url)。
4. 若参考资料中未涵盖用户提问所需的答案，请如实说明信息不足。

用户问题：{{input.question}}
```

---

## 注意事项

1. **双认证互斥与必填约束**：
   - 必须满足 `apiKey` 存在，或者 `volcengineAccessKey` 与 `volcengineSecretKey` 同时存在，否则插件将拒绝执行并返回认证配置错误。
2. **查询词字符长度限制**：
   - `query` 长度严格限制在 **1 ~ 100 字符**。超长请求将直接被 Zod 校验拦截，建议务必配合上游大模型节点完成提炼。
3. **域名过滤上限与格式**：
   - `sites` 最多允许配置 **5 个域名**，超出数量会自动截断保留前 5 个。
   - 多个域名使用竖线 `|` 隔开，仅填写纯域名（例如 `xinhuanet.com|gov.cn`），不要包含 `https://` 协议前缀或 URL 路径。
4. **结果数量范围**：
   - `count` 参数仅支持 `1` 到 `50` 的整数，默认为 `10`。
5. **时间范围参数格式**：
   - `time_range` 区分大小写，可选值仅限 `OneDay`、`OneWeek`、`OneMonth`、`OneYear`。
6. **网络连通性与服务开通**：
   - 使用 API Key 模式需确保宿主机网络能够访问 `https://open.feedcoopapi.com`。
   - 使用火山引擎 AK/SK 模式需确保能够访问 `https://mercury.volcengineapi.com`，并在火山引擎控制台确认已开通对应服务权限。

