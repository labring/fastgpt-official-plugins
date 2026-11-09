# MinerU Document Parsing Service (MinerU Intelligent Document Parsing Suite)

MinerU is a high-performance deep document parsing tool designed for complex multimodal documents such as academic literature, technical research reports, textbooks, and exam papers. It efficiently and accurately converts unstructured files—including PDFs, Office documents (Word, PPT), and images—into machine-readable, high-quality Markdown, HTML, and structured JSON data.

This plugin delivers out-of-the-box MinerU parsing capabilities for FastGPT, supporting both the **official hosted SaaS service** and **private on-premise deployments**. Powered by deep learning OCR and layout analysis, the plugin reconstructs reading flows, accurately preserves dual-column and multi-column layouts, extracts inline and display LaTeX mathematical formulas and complex nested tables without fidelity loss, and automatically uploads embedded document figures to FastGPT object storage to generate direct access URLs. This provides high-fidelity document preprocessing for FastGPT agent workflows, LLM reading comprehension, and RAG knowledge base retrieval.

---

## Typical Application Scenarios

- **High-Precision OCR for Complex Academic Papers & Technical Reports**: Accurately extracts text from research papers and cutting-edge whitepapers across computer science, physics, mathematics, and biochemistry, eliminating multi-column text mixing, garbled characters, and out-of-order reading flows.
- **Multi-Column Layout Reconstruction & Nested Table Extraction**: Seamlessly parses academic journals, financial statements, and industry reports with two-column or three-column formatting, reconstructing natural reading order and converting complex multi-row/multi-column tables into standard Markdown or HTML.
- **Scientific & Technical Document Extraction with LaTeX Formulas**: Accurately detects and recognizes inline math symbols (`$...$`) and standalone display equations (`$$...$$`), preserving matrices, integrals, partial derivatives, and mathematical semantics.
- **Multimodal Document Figure Extraction & RAG Ingestion**: Automatically crops and extracts high-resolution diagrams, flowcharts, and architecture figures, hosting them with direct URLs embedded within the Markdown text to empower FastGPT agent workflows, multimodal LLMs, and RAG retrieval pipelines.

---

## Deployment Modes & Secret Configuration

This plugin supports two deployment modes. Configure the appropriate credentials in FastGPT plugin settings based on your infrastructure:

| Field (`Secret Key`) | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `base_url` | String (`string`) | No | `https://mineru.net` (SaaS) | MinerU service endpoint.<br>• **Official SaaS Online Service**: Leave empty; defaults to `https://mineru.net`.<br>• **Private On-Premise Deployment**: Enter the root URL of your local or internal MinerU API service, e.g., `http://127.0.0.1:8000` or `http://mineru.internal:8000`. |
| `token` | String (`string`) | Conditionally Required | Empty | Authentication credential for the MinerU service.<br>• **Official SaaS Online Service**: **Required**. Sign up and generate an API Token in the [MinerU Open Platform Console](https://mineru.net/apiManage/docs).<br>• **Private On-Premise Deployment**: Optional. Provide the Bearer Token if your private MinerU instance has authentication enabled; leave empty otherwise. |

### Configuration Guidance

1. **SaaS Online Service Mode**:
   - `base_url`: Leave empty (automatically defaults to `https://mineru.net`).
   - `token`: Apply for an API Token in [MinerU API Documentation](https://mineru.net/apiManage/docs) and configure it.
2. **Private On-Premise Deployment Mode**:
   - `base_url`: Enter the endpoint of your self-hosted MinerU API v2 instance, e.g., `http://127.0.0.1:8000`.
   - `token`: Optional depending on whether authentication is enabled on your private instance.

---

## Sub-Tools List

This tool suite provides the following two sub-tools:

- **`parseLocal` (Local Deployment Parse)**: Parses documents via a self-hosted or private MinerU API v2 endpoint (`/file_parse`). Supports single/multi-file concurrent uploads and processing, customizable language settings, and diverse inference backends (Pipeline, VLM, etc.).
- **`parseRemote` (MinerU SaaS Parse)**: Performs distributed asynchronous batch parsing via the official MinerU SaaS cloud service. Supports a wide array of formats including PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), and images, with options for classic Pipeline or end-to-end VLM model versions.

---

## Sub-Tool: parseLocal (Local Deployment Parse)

Ideal when your team maintains a private GPU server running MinerU or deploys the MinerU API v2 service internally.

### Input Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `files` | Array of strings (`Array<string>`) | Yes | None | **List of file URLs to parse**. Accepts direct download links for one or more files in formats such as PDF, PNG, JPG, or JPEG. Typically mapped to a FastGPT File Upload node or upstream variables. |
| `parse_method` | String enum (`enum`) | No | `auto` | **Parsing method**. Available options:<br>• `auto`: Automatically detects document characteristics (extracts embedded text layers first; falls back to OCR for scanned documents);<br>• `ocr`: Forces full-page optical character recognition;<br>• `txt`: Plain text extraction mode (for digital PDFs containing text layers). |
| `formula_enable` | Boolean (`boolean`) | No | `true` | **Enable formula recognition**. When `true`, automatically converts inline and display mathematical formulas into LaTeX syntax. |
| `table_enable` | Boolean (`boolean`) | No | `true` | **Enable table recognition**. When `true`, extracts tables and structures them into Markdown. |
| `return_content_list` | Boolean (`boolean`) | No | `false` | **Return structured JSON**. When `true`, returns a structured block list segmented by paragraphs, titles, formulas, tables, and images in the `contentList` output field. |
| `lang_list` | String (`string`) | No | `ch` | **Document language codes**. Comma-separated language codes (e.g., `ch,en`). Defaults to `ch` (Chinese/English mixed). For other supported languages, refer to the PaddleOCR language catalog (e.g., `en`, `japan`, `korean`). |
| `backend` | String enum (`enum`) | No | `pipeline` | **MinerU parsing backend**. Available options:<br>• `pipeline`: Traditional deep learning pipeline;<br>• `vlm-transformers`: Transformers-based Vision-Language Model;<br>• `vlm-sglang-engine`: SGLang native inference engine;<br>• `vlm-sglang-client`: Connects to an external SGLang inference server (requires `sglang_server_url`);<br>• `vllm-async-engine`: vLLM asynchronous engine;<br>• `vllm-engine`: vLLM synchronous engine;<br>• `http-client`: External HTTP client. |
| `sglang_server_url` | String (`string`) | No | Empty | **SGLang server URL**. Required when `backend` is set to `vlm-sglang-client`, e.g., `http://127.0.0.1:30000`. |

---

## Sub-Tool: parseRemote (MinerU SaaS Parse)

Ideal for directly utilizing the official MinerU hosted cloud service, eliminating local GPU maintenance overhead and unlocking broader file format support (including Word and PowerPoint).

### Input Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `files` | Array of strings (`Array<string>`) | Yes | None | **List of file URLs to parse**. Accepts publicly accessible direct links for `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.png`, `.jpg`, and `.jpeg` files. |
| `model_version` | String enum (`enum`) | No | `pipeline` | **Parsing model version**. Available options:<br>• `pipeline`: Classic end-to-end deep learning pipeline balancing speed and stability;<br>• `vlm`: Next-generation Vision-Language Model (VLM) end-to-end parsing offering superior multimodal layout understanding and visual element fidelity. |
| `is_ocr` | Boolean (`boolean`) | No | `false` | **Force OCR**. Defaults to `false` (intelligently leverages native text layers); set to `true` to force full OCR processing. |
| `enable_formula` | Boolean (`boolean`) | No | `true` | **Enable formula recognition**. Recognizes mathematical symbols and formats them into standard LaTeX syntax. |
| `enable_table` | Boolean (`boolean`) | No | `true` | **Enable table recognition**. Converts complex diagrams and tables into Markdown tables. |
| `language` | String (`string`) | No | `ch` | **Primary document language**. Defaults to `ch` (Chinese/English mixed); supports English (`en`) and other standard language codes. |
| `extra_formats` | Array of strings (`Array<string>`) | No | `[]` | **Additional output formats**. Supports `["html"]`. When included, returns reconstructed HTML layout code in the file's `html` field. |

---

## Output Results

Both `parseLocal` and `parseRemote` return a unified, standardized output structure:

### Top-Level Output Fields

| Field | Type | Description |
| --- | --- | --- |
| `result` | String (`string`) | **Merged Markdown content**. Concatenates the parsed Markdown outputs of all input files in order, separated by `\n\n---\n\n`. Relative image paths in the body are automatically replaced with accessible direct URLs hosted on FastGPT storage. |
| `files` | Array of objects (`Array<object>`) | **List of detailed parsing results for each file**. Contains individual content, extracted images, structured blocks, and error details. |

### Elements in the `files` Array

| Field | Type | Description |
| --- | --- | --- |
| `filename` | String (`string`) | The original filename of the parsed file (e.g., `attention_is_all_you_need.pdf`). |
| `markdown` | String (`string`) | The parsed Markdown content for this file. Formulas are standardized into LaTeX, layouts are restored to clean Markdown, and relative image references are replaced with direct URLs. |
| `html` | String (`string`) | (Optional) Reconstructed rich HTML layout code. Returned when `extra_formats: ["html"]` is specified in `parseRemote`. |
| `images` | Array of strings (`Array<string>`) | (Optional) **List of direct access URLs** for all illustrations and table figures extracted from this file, hosted on FastGPT object storage. |
| `contentList` | Array of objects (`Array<object>`) | (Optional) **Structured block list** parsed from the file (containing block metadata for `text`, `heading`, `table`, `equation`, `image`, etc.). Returned when `return_content_list: true` is set in `parseLocal`. |
| `errorMsg` | String (`string`) | (Optional) Error message or cause if parsing fails for this file (e.g., Token authentication failure, download timeout, unsupported format). |

### Example Response

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

## Typical Workflow Examples

### Scenario 1: Academic Paper & Technical Report Q&A via File Upload

1. **Add File Upload & Input Nodes**: In FastGPT Workflow orchestration, add a "User File Upload" or "Chat Input" node.
2. **Connect the MinerU Parsing Node**:
   - Select either **`parseRemote` (SaaS mode)** or **`parseLocal` (Private mode)**.
   - Bind the upstream file variable (e.g., `{{fileUrls}}`) to the `files` parameter.
   - Enable formula recognition (`enable_formula: true` / `formula_enable: true`) and table recognition (`enable_table: true` / `table_enable: true`).
   - (Optional) If using `parseRemote`, set `model_version` to `vlm` to leverage vision-language models for multimodal parsing.
3. **Connect the LLM Node**:
   - Feed the `result` output from MinerU into the system prompt or context reference of the "AI Chat / LLM" node.
   - Provide a specialized prompt: "You are a scientific research assistant. Based on the parsed Markdown paper above (which contains complete LaTeX mathematical formulas and experimental tables), summarize the architectural novelty, derive key mathematical formulations, and critically evaluate the benchmark results."
4. **Outcome**: The LLM delivers answers with rendered LaTeX math equations and can reference high-resolution diagrams directly displayed in the chat interface.

### Scenario 2: High-Fidelity Dataset Ingestion for Multimodal RAG Knowledge Bases

1. **Collect Document URLs**: Gather direct download links for internal technical specifications, financial audits, textbooks, or patent documents.
2. **Execute Document Parsing**:
   - Invoke `parseLocal` (with `return_content_list: true`) or `parseRemote`.
   - Extract standardized Markdown documents along with the `images` direct URL array.
3. **Ingest into FastGPT Knowledge Base**:
   - Import the cleaned, well-structured Markdown into the FastGPT knowledge base.
   - Preserving LaTeX formulas, structured tables, and clear heading hierarchies prevents sentence fragmentation or table corruption during chunking, significantly improving vector embedding quality and semantic retrieval precision.

---

## Important Considerations

1. **Direct Download Links & Network Accessibility**: All URLs passed to `files` must be directly downloadable without interactive logins or session cookies. Avoid passing webpage URLs that require user authentication or client-side JavaScript rendering.
2. **Asynchronous Queuing Mechanism & Execution Duration**:
   - `parseRemote` (SaaS mode) submits tasks to a distributed cloud queue and automatically polls for results at 5-second intervals (up to 100 retries, approximately 8.3 minutes total timeout).
   - Large documents (such as 50+ page PDFs or high-DPI scans) require dozens of seconds to several minutes to process. Ensure appropriate timeout thresholds are configured in your workflow nodes.
   - Multiple files are submitted as a batch; total duration depends on queue congestion and the processing time of the longest file in the batch.
3. **SaaS Quota & Token Authentication**:
   - SaaS online parsing consumes points or page credits in your MinerU account. If you encounter errors such as `A0202` (Invalid Token) or `A0211` (Expired Token), log in to the [MinerU Open Platform](https://mineru.net/apiManage/docs) to refresh your credentials and update your plugin configuration.
4. **Hardware & Environment Requirements for On-Premise Deployments**:
   - When using `parseLocal`, ensure that the private MinerU API v2 service is properly installed, running, and accessible at `/file_parse`.
   - If using `vlm-*` vision-language backends, ensure adequate GPU VRAM (24 GB+ recommended per GPU) or configure `sglang_server_url` to connect to an external SGLang inference cluster.
5. **Automated Image Hosting Mechanism**:
   - After parsing, extracted images are automatically uploaded to object storage via the FastGPT host environment's `uploadFile` API, and relative references (`images/xxx.png`) in the Markdown are replaced with direct URLs. When executed in standalone test environments without host support, it gracefully falls back to Base64 Data URLs.

---

## Local Development and Verification

```bash
# Install dependencies
pnpm install

# Run unit tests
pnpm run test

# Build package artifacts
pnpm run build

# Validate plugin specifications
npx @fastgpt-plugin/cli check --entry .
```
