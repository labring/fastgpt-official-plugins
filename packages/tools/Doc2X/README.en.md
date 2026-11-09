# Doc2X Document Parsing Service (Doc2X Service)

Doc2X is a specialized document parsing service designed to extract structured Markdown from documents featuring complex layouts, multi-column typography, tables, and sophisticated academic mathematical formulas.

This plugin provides out-of-the-box Doc2X document recognition and conversion capabilities for FastGPT. Powered by Doc2X's deep learning parsing pipeline, it accurately extracts inline and display LaTeX formulas from academic papers, textbooks, exam papers, and technical whitepapers. It reconstructs multi-column layouts into the correct reading order and converts complex tables into standard Markdown tables, providing high-fidelity document preprocessing for FastGPT agent workflows, LLM reading comprehension, and RAG knowledge base retrieval.

---

## Typical Application Scenarios

- **Academic Papers and Scientific Literature**: Accurately extracts complex matrices, multi-line mathematical derivations, theorem proofs, and chart references in fields like computer science, mathematics, and physics while preserving mathematical semantics.
- **Complex Layout and Multi-Column Document Digitization**: Parses academic journals, industry research reports, and technical manuals with two-column or multi-column layouts, restoring correct reading flows and heading hierarchies without OCR misalignments.
- **Digitization of Textbooks, Exam Papers, and Question Banks**: Digitizes STEM textbooks, exam papers with formulas, problem illustrations, and multiple-choice options into standardized Markdown with LaTeX notation.
- **Preprocessing for Knowledge Base Q&A (RAG) Enhancement**: Works seamlessly with upstream file upload nodes or dataset ingestion workflows in FastGPT, converting raw PDFs into high-quality rich Markdown to significantly improve chunking quality and vector retrieval accuracy.

---

## Secret Configuration

To use this plugin, you must configure the API key (`apikey`) obtained from the Doc2X developer platform.

### How to Obtain an API Key

1. Visit the [Doc2X Developer Platform](https://doc2x.noedgeai.com) (or the official website) to register and log in.
2. Navigate to the console's "API Key / Key Management" section and generate a new API key.
3. Copy and securely store the generated key string.
4. Ensure your account has sufficient available page or token quota (new accounts typically receive initial free trial credits; commercial use requires recharging as needed).

### Configuration in FastGPT

Enter the following field in the FastGPT Toolset Secrets management or node settings:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `apikey` | String (`string`) | Yes | Doc2X developer platform API key. Sent as a `Bearer Token` for authentication and balance deduction. |

---

## Sub-Tools List

This tool suite includes the following sub-tool:

- **`PDF2text` (PDF Recognition)**: Sends input PDF files to the Doc2X asynchronous parsing pipeline, converting them into structured Markdown text while extracting and standardizing LaTeX formulas.

---

## Sub-Tool: PDF2text (PDF Recognition)

### Input Parameters

| Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `files` | Array of strings (`Array<string>`) | Yes | None | **Direct download URLs of PDF files**. Accepts an array of publicly accessible PDF download links. Typically connected to a FastGPT File Upload node or referencing file output variables from upstream workflow nodes. |

### Output Results

| Field | Type | Description |
| --- | --- | --- |
| `result` | String (`string`) | **Parsed Markdown content**. Contains standard LaTeX mathematical formulas (inline `$ ... $` and block `$$ ... $$`), formatted Markdown tables, and image references. When multiple files are processed, results are separated by horizontal rules (`\n------\n`). |
| `success` | Boolean (`boolean`) | **Whether all files were successfully processed**. Returns `true` if and only if all provided PDF files were downloaded and parsed successfully; returns `false` if any file fails. |
| `error` | String (`string`) | **Error message** (optional). Contains the error details when parsing fails, times out, encounters a download exception, or fails authentication. Multiple errors are separated by `\n------\n`. |

### Example Response

```json
{
  "result": "# Research on Attention Mechanisms in Deep Learning\n\n## 1. Introduction\n\nThe formulation of the Self-Attention mechanism is defined as follows:\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\nwhere $Q, K, V$ denote the Query, Key, and Value matrices respectively.\n\n| Parameter | Dimension | Description |\n| --- | --- | --- |\n| $d_k$ | 64 | Key vector dimension |\n| $d_v$ | 64 | Value vector dimension |",
  "success": true
}
```

---

## Typical Workflow Examples

### Scenario 1: Academic Paper Q&A via File Upload

1. Add a "User File Upload" or "Chat Input" node at the start of your FastGPT workflow.
2. Connect it to the "Doc2X Service -> PDF Recognition (`PDF2text`)" node, binding the upstream file output variable (e.g., `{{fileUrls}}`) to the `files` parameter.
3. Pass the `result` output variable from `PDF2text` to the system prompt or context input of an "AI Chat / LLM" node.
4. Instruct the LLM in the system prompt to summarize key findings, explain mathematical derivations, and highlight experimental conclusions from the paper.

### Scenario 2: High-Fidelity Dataset Ingestion for Knowledge Bases

1. Collect direct download links for batch ingestion of academic papers or STEM textbooks.
2. Use the `PDF2text` tool to convert the PDFs into clean, structured Markdown.
3. Import the formatted Markdown into the FastGPT knowledge base for semantic chunking and embedding, preserving mathematical formulas and table layouts for superior retrieval accuracy.

---

## Important Considerations

1. **File Format Requirements**: Only standard PDF files are supported. The node validates the `Content-Type` header (which must begin with `application/pdf`) upon downloading. Non-PDF files will be ignored and skipped.
2. **Download Links and Network Accessibility**: The `files` parameter requires valid, publicly accessible direct download URLs that do not require authentication cookies or interactive logins. The download timeout is set to 20 seconds per file.
3. **Asynchronous Parsing and Execution Duration**: Doc2X uses an asynchronous server-side parsing pipeline. The tool polls the task status automatically (up to 120 retries at 5-second intervals, with a total timeout of approximately 10 minutes per file). Processing complex, lengthy, or formula-heavy documents may take from tens of seconds to several minutes. Multiple files are processed sequentially, and the total duration scales linearly.
4. **Account Quota and Billing**: Calling the Doc2X API consumes account points or page credits. Ensure your account on the [Doc2X Developer Platform](https://doc2x.noedgeai.com) maintains an adequate balance; otherwise, authentication or insufficient funds errors will occur.
5. **Formula and Layout Normalization**: The plugin performs thorough post-processing on Doc2X's raw outputs:
   - Normalizes bracket notation `\(` / `\)` into inline LaTeX `$ ... $`.
   - Normalizes bracket notation `\[` / `\]` into block LaTeX `$$ ... $$`.
   - Converts HTML table structures into standard Markdown tables.
   - Strips redundant comment markers and artifacts to ensure seamless comprehension by LLMs.

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
