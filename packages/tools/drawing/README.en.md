# BI Chart Generation (BI Charts)

The BI Chart Generation plugin is a lightweight data visualization toolset provided by FastGPT. Powered by an ECharts server-side rendering (SSR) engine, it quickly transforms discrete metrics into clean and professional **line charts**, **bar charts**, and **pie charts**, automatically uploading the output to FastGPT storage to generate direct image URLs ready for display in conversational interfaces.

## Application Scenarios

- **Intelligent Dashboards & Summary Metrics**: Combine with database queries or external API results to turn raw numbers into intuitive visual charts.
- **In-Chat Data Visualization**: After analyzing tabular data or comparative metrics, LLMs can invoke this tool to render trend or proportion charts to improve user experience.
- **Automated Report Illustration**: Automatically generate illustrated weekly reports or business summaries in workflows and forward them to WeCom, Feishu, or email.
- **Survey & Poll Analytics**: Render vote counts or response ratios into instant pie or bar charts for quick insights.

---

## Tool List

| Tool ID | Name | Description |
| :--- | :--- | :--- |
| `baseChart` | Base Chart (`baseChart`) | Renders line, bar, or pie charts based on input X-axis labels, Y-axis values, and chart type |

---

## Input Parameters (`baseChart`)

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `title` | string | No | `""` | Chart title displayed centered at the top of the chart. |
| `xAxis` | string[] / JSON string | **Yes** | - | Categorical dimensions or labels along the X-axis (e.g. `["Jan", "Feb", "Mar"]`). If passed as a string, must adhere to JSON/JSON5 array syntax. Serves as category names in pie charts. |
| `yAxis` | (string\|number)[] / JSON string | **Yes** | - | Metric values along the Y-axis (e.g. `["120", "200", "150"]`). Serves as numerical values in line/bar charts and slice values in pie charts. |
| `chartType` | enum | **Yes** | - | Type of chart to generate. Supported options: `折线图` (line chart), `柱状图` (bar chart), `饼图` (pie chart). |

---

## Output Parameters (`baseChart`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `chartUrl` | string | Direct URL of the generated chart image. Can be embedded directly in chat or Markdown nodes via `![chart](chartUrl)`. |
| `图表 url` | string | Legacy output field kept for backwards compatibility, identical to `chartUrl`. |

### Output Example

```json
{
  "chartUrl": "https://fastgpt.run/api/system/upload/chart-20250520-abc123.svg"
}
```

---

## Workflow Orchestration Example

```mermaid
flowchart LR
    A[User Query: Quarterly Sales] --> B[AI Data Analysis / SQL Query]
    B --> C[Extract Axis Data & Chart Type]
    C --> D[BI Chart Tool baseChart]
    D --> E[Response Node: Markdown Chart Image]
```

### Prompt Guidance Suggestion (System Prompt)

When instructing an LLM to call `baseChart`, guide parameter extraction in the system prompt:

```text
When the user asks to visualize data in a chart, extract the categories as an array for xAxis, the numerical values as an array for yAxis, and select the most appropriate chartType ("折线图" for time trends, "柱状图" for comparisons, and "饼图" for composition/percentages).
```

---

## Important Notes

1. **Array Length Alignment**: The length of `xAxis` and `yAxis` arrays must match; otherwise, the chart may render incompletely or misaligned.
2. **Value Conversion**: String elements in `yAxis` are automatically parsed into floating-point numbers; non-numeric values may parse as `NaN`.
3. **Rendering Dimensions & Format**: Charts are rendered as vector SVG images at 400x300 resolution by default, ensuring crisp display with a minimal payload.
