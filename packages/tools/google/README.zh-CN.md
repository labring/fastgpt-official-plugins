# Google 搜索 (Google Search)

Google 搜索插件是基于 Google 官方 Custom Search JSON API 与 Google 可编程搜索引擎（Programmable Search Engine）构建的高性能互联网检索工具。它为 FastGPT 智能体与工作流提供全球领先的实时网页检索能力，帮助大语言模型（LLM）突破知识截止限制，获取权威、新鲜、准确的互联网信源。

## 典型应用场景

- **全球多语言实时检索**：依托 Google 覆盖全球的网页索引能力与强大的多语言理解，实时检索全球最新资讯、行业动态、海外科研学术成果及多语种技术文档。
- **特定行业/网站权威信源检索**：借助 Google 可编程搜索引擎强大的定向筛选与过滤机制，将搜索范围精准锁定在权威行业网站、官方文档站点或学术机构数据库中，杜绝营销内容与低质内容农场干扰。
- **知识库 RAG 事实补充与幻觉消除**：在 FastGPT 智能体问答流程中动态检索最新的公开数据作为事实依据，提供可溯源的参考链接（Citations），显著降低模型幻觉，提升专业回答的置信度。

---

## 密钥与配置指引

使用本插件需要在 FastGPT 插件节点的密钥配置中提供 Google Cloud API 密钥（`key`）与 Google 可编程搜索引擎 ID（`cx`）。

### 配置参数列表

| 配置项 | 类型 | 敏感保密 | 必填 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `key` | 字符串 (`string`) | 是 (`isSecret: true`) | 是 | Google Cloud 平台生成的 API 密钥，用于调用 Google Custom Search JSON API 时的身份鉴权。 |
| `cx` | 字符串 (`string`) | 否 (`isSecret: false`) | 是 | Google 可编程搜索引擎 ID（Programmable Search Engine ID），用于指定检索的目标引擎及生效的搜索范围。 |

### 获取步骤指引

#### 1. 获取 Google Cloud API Key (`key`)

1. 访问并登录 [Google Cloud Console 控制台](https://console.cloud.google.com/)。
2. 在控制台顶部项目选择栏中，选择已有项目或点击 **新建项目 (New Project)** 创建一个专用项目（如 `fastgpt-search`）。
3. 在左侧导航栏中选择 **API 和服务 (APIs & Services) > 库 (Library)**。
4. 在 API 库搜索框中输入 `Custom Search API`，找到该服务后点击 **启用 (Enable)**。
5. 启用成功后，进入 **API 和服务 > 凭据 (Credentials)** 页面，点击顶部 **+ 创建凭据 (+ CREATE CREDENTIALS) > API 密钥 (API key)**。
6. 系统将生成一串 API 密钥，点击复制即可作为 `key`。
7. *（可选但强烈建议）* 为保障密钥安全，点击刚刚生成的密钥名称进入编辑界面，在 **API 限制 (API restrictions)** 下选择 **限制密钥 (Restrict key)**，在下拉列表中仅勾选 **Custom Search API** 并保存，防止密钥被滥用于其他云服务。

#### 2. 创建并获取 Google Programmable Search Engine ID (`cx`)

1. 访问并登录 [Google 可编程搜索引擎控制台 (Programmable Search Engine)](https://programmablesearchengine.google.com/controlpanel/all)。
2. 点击页面左上方的 **添加 (Add)** 按钮创建新的搜索引擎实例。
3. 配置搜索引擎基本信息：
   - **搜索引擎名称**：自定义名称（例如 `FastGPT Web Search`）。
   - **搜索内容**：
     - **全网搜索配置**：在“要搜索的网站”中先填写一个临时网址（如 `www.google.com`），完成创建后点击进入该搜索引擎的 **概览 (Overview)** 页面，在 **搜索整个网络 (Search the entire web)** 开关处将其切换为 **开启 (ON)**，随后在下方的“要搜索的网站”列表中删除先前填写的临时网址。
     - **定向网站搜索配置**：在“要搜索的网站”中直接填入希望限定检索的站点域名（例如 `docs.fastgpt.in`、`github.com` 等），可添加多个站点。
4. 点击 **创建 (Create)**。
5. 创建完成后，在搜索引擎的 **概览 (Overview)** 设置页面中找到 **搜索引擎 ID (Search engine ID)**，点击复制该字符串（通常形如 `a1b2c3d4e5f6g7h8i` 或带有特定前缀），该值即为 `cx`。

---

## 输入参数

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| `query` | 字符串 (`string`) | 是 | 无 | **搜索查询词**。需要向 Google 检索的关键词或短语，支持自然语言提问与高级搜索语法。 |

### 查询词编写与优化建议

1. **提炼核心关键词**：尽量避免将超长口语化提问直接传入 `query`。在工作流中可利用前置大语言模型（LLM）节点，将用户问题改写为 2~4 个精准的关键词组合（例如将 *“请问 FastGPT 如何在 Ubuntu 系统上使用 Docker Compose 进行本地私有化部署？”* 提炼为 *“FastGPT Ubuntu Docker Compose 私有化部署”*）。
2. **支持 Google 高级检索语法**：Google 搜索支持强大的原生检索操作符，可大幅提升搜索精准度：
   - `site:domain.com`：限定在指定域名内搜索（如 `site:github.com fastgpt plugins`）。
   - `filetype:pdf`：限定返回特定文件格式（如 `filetype:pdf 大语言模型微调指南`）。
   - `"精确匹配"`：使用双引号将关键词包围，强制完全匹配词组。
   - `-关键词`：排除包含特定字词的结果（如 `Python 教程 -csdn`）。
   - `OR` 或 `|`：逻辑或搜索（如 `FastGPT Docker OR Kubernetes`）。

---

## 输出结果

插件执行成功后返回包含搜索响应的顶层对象，其中的 `result` 字段为 Google Custom Search JSON API 返回的原生完整数据。

| 参数名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `result` | 对象 (`Record<string, unknown>`) | Google Custom Search API 返回的检索结果对象，包含搜索元数据、耗时信息及匹配的网页条目列表。 |

### `result` 核心结构拆解

`result` 对象包含以下常用核心字段：

| 字段路径 | 类型 | 说明 |
| :--- | :--- | :--- |
| `searchInformation.searchTime` | 数值 (`number`) | 本次搜索执行的耗时（单位：秒）。 |
| `searchInformation.totalResults` | 字符串 (`string`) | 匹配该查询词的预估总网页结果条数。 |
| `items` | 对象数组 (`Array<Object>`) | 匹配到的网页搜索结果列表。 |

#### `items` 数组中每个条目的常用属性

| 属性名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `title` | 字符串 (`string`) | 目标网页的标题（纯文本格式）。 |
| `htmlTitle` | 字符串 (`string`) | 包含搜索匹配高亮 HTML 标签的网页标题。 |
| `link` | 字符串 (`string`) | 目标网页的完整 URL 访问链接。 |
| `displayLink` | 字符串 (`string`) | 结果中展示的网页根域名（例如 `fastgpt.in`、`github.com`）。 |
| `snippet` | 字符串 (`string`) | 网页正文中与关键词相关的上下文摘要纯文本片段。 |
| `htmlSnippet` | 字符串 (`string`) | 包含 `<b>` 高亮匹配词标签的 HTML 上下文摘要。 |
| `pagemap` | 对象 (`Object`) | 网页附带的丰富结构化元数据（Rich Snippets），包含缩略图 (`cse_thumbnail`)、Meta 标签 (`metatags`) 等。 |

### 返回示例

```json
{
  "result": {
    "kind": "customsearch#search",
    "url": {
      "type": "application/json",
      "template": "https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json"
    },
    "searchInformation": {
      "searchTime": 0.241528,
      "formattedSearchTime": "0.24",
      "totalResults": "152000",
      "formattedTotalResults": "152,000"
    },
    "items": [
      {
        "kind": "customsearch#result",
        "title": "FastGPT - 基于 LLM 的知识库问答系统",
        "htmlTitle": "<b>FastGPT</b> - 基于 LLM 的知识库问答系统",
        "link": "https://fastgpt.in/",
        "displayLink": "fastgpt.in",
        "snippet": "FastGPT 是一个基于 LLM 大语言模型的知识库问答系统，提供开箱即用的数据处理、模型调用、智能体编排与工作流插件能力...",
        "htmlSnippet": "<b>FastGPT</b> 是一个基于 LLM 大语言模型的知识库问答系统，提供开箱即用的数据处理、模型调用、智能体编排与工作流插件能力...",
        "formattedUrl": "https://fastgpt.in/",
        "pagemap": {
          "metatags": [
            {
              "viewport": "width=device-width, initial-scale=1",
              "description": "FastGPT 官方平台"
            }
          ]
        }
      }
    ]
  }
}
```

---

## 典型工作流编排示例

在 FastGPT 高级编排中，Google 搜索工具常与大模型节点、代码运行节点组合使用：

### 编排流程方案

```
[用户输入] 
   │
   ▼
[意图识别 / 关键词提炼 (LLM 节点)]
   │ 提炼后的精炼搜索词
   ▼
[Google 搜索 (工具节点)] ──> 输出原生 JSON 结果
   │
   ▼
[结果格式化 (代码运行节点)] ── (可选：提取 title/link/snippet，压缩 Token)
   │ 格式化后的参考文本
   ▼
[回答生成 (LLM 节点)] ──> 将搜索结果作为参考上下文注入 Prompt
   │
   ▼
[最终回复]
```

### 结果处理示例（代码运行节点）

为避免原生 JSON 中的大量多余元数据占用下游大模型的上下文 Token 额度，建议在搜索节点后添加一个“代码运行”节点进行结构化提炼：

```javascript
function main({ result }) {
  const items = result?.items || [];
  if (items.length === 0) {
    return {
      text: "未检索到相关网页结果。"
    };
  }

  // 提取前 5 条有效结果并拼接为 Markdown 格式
  const formatted = items.slice(0, 5).map((item, index) => {
    return `[${index + 1}] [${item.title}](${item.link})\n摘要: ${item.snippet}`;
  }).join("\n\n");

  return {
    text: formatted
  };
}
```

随后在下游大模型的系统提示词中引用提炼后的结果：

```text
请结合以下从 Google 检索到的参考资料回答用户问题。若参考资料与问题无关，请基于自身知识回答并说明。
在陈述具体事实时，请在句末标注文中对应的参考链接编号 [1]、[2]。

参考资料：
{{formattedResults.text}}
```

---

## 注意事项

1. **每日免费配额限制 (Quota Limits)**：
   - Google Custom Search JSON API 为每个 Google Cloud 账号提供 **每日 100 次免费查询 (100 queries/day)**。
   - 超过免费配额后，若需继续调用，需在 Google Cloud Console 中为关联项目启用结算功能（Billing），后续费用约为 **$5 美元 / 1000 次查询**（每日上限通常默认为 10,000 次请求）。
   - 建议在智能体流程中配合前置意图判断节点，仅在确需实时联网或用户明确要求查询时才触发搜索，避免浪费 API 调用配额。
2. **网络连通性要求**：
   - 本工具请求的 Google 官方服务接口地址为 `https://www.googleapis.com`。
   - 在部分国家或地区（例如中国大陆），访问该域名存在网络连通性限制。请确保运行 FastGPT 服务、宿主机或插件容器的环境具备稳定的国际互联网访问能力（例如配置系统 HTTP/HTTPS 代理或部署在海外服务器上）。
3. **搜索引擎 ID (`cx`) 的全网搜索生效配置**：
   - 如果新建的搜索引擎未开启“搜索整个网络”选项，默认只会检索创建时输入的初始网址，可能导致全网搜索时返回空结果。若需要全网检索，务必在 Programmable Search Engine 控制台确认已将 **“搜索整个网络”** 开关置为 **开启**。
4. **内置时效性约束**：
   - 插件底层请求参数中默认配置了 `dateRestrict: 'm[1]'`（限制返回近一个月内更新的内容），旨在优先保证检索结果的新鲜度与时效性。

