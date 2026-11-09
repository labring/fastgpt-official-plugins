# Math Expression Evaluation (mathExprVal)

The Math Expression Evaluation plugin is a deterministic numerical evaluation tool provided by FastGPT. Powered by the lightweight and secure `expr-eval` AST parsing engine, it quickly evaluates complex arithmetic expressions, algebraic equations, trigonometric functions, exponents, and logarithms, effectively eliminating LLM hallucinations and calculation discrepancies.

## Application Scenarios

- **Eliminate LLM Math Hallucinations**: While LLMs excel at semantic understanding, they struggle with exact numerical calculation across multi-digit arithmetic and nested parentheses. This tool guarantees 100% accurate algebraic results.
- **Financial & Commercial Computations**: Perform compound interest calculations, gross margin deductions, discount percentages, and tax computations requiring strict mathematical precision.
- **Engineering & Scientific Computations**: Supports common functions such as trigonometric (`sin`, `cos`), square root (`sqrt`), exponentiation (`^` or `**`), and logarithms (`log`, `ln`).
- **Dynamic Workflow Parameter Calculations**: Dynamically compute pagination offsets, threshold ratios, or scoring metrics within agent workflows.

---

## Key Features & Security

- **Zero Configuration & No API Keys**: Out of the box with no external service credentials or internet access required.
- **Dedicated Secure Sandbox**: Built upon `expr-eval` AST parser instead of native JavaScript `eval()`, completely preventing arbitrary code execution (RCE) and environment escapes.
- **Smart Operator Compatibility**: Automatically transforms Python/JS-style exponentiation operator `**` into standard mathematical exponentiation operator `^`.

---

## Input Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `expr` | string | **Yes** | - | Mathematical expression to evaluate. Supports legacy Chinese field name `数学表达式`. Example: `(12.5 + 3.75) * 4 ^ 2`. |

> **Note**: Supports standard numbers, basic operations `+ - * /`, modulo `%`, exponents `^` or `**`, parenthesized precedence `( )`, and built-in constants/functions (e.g. `PI`, `E`, `sin(x)`, `cos(x)`, `sqrt(x)`, `abs(x)`, `round(x)`).

---

## Output Parameters

| Field | Type | Description |
| :--- | :--- | :--- |
| `result` | number \| string | Numerical evaluation result when successful; an explanatory error string when syntax or calculation fails. |

### Output Example

**Success**:
```json
{
  "result": 260
}
```

**Syntax Error**:
```json
{
  "result": "12 + * 3 is not a valid math expression. Error: ..."
}
```

---

## Workflow Orchestration Example

```mermaid
flowchart LR
    A[User Query: Mortgage Interest] --> B[AI Chat: Extract Math Expression]
    B --> C[Math Tool mathExprVal]
    C --> D[AI Summary: Natural Language Response]
```

### Prompt Guidance Suggestion (System Prompt)

When instructing an LLM to invoke `mathExprVal`, guide the extraction of clean expressions:

```text
When encountering questions requiring mathematical calculation or formulas, extract the formula as a clean mathematical expression and pass it to mathExprVal (e.g., convert "15% off 1500 minus 50" into "1500 * 0.85 - 50"). Do not include Chinese characters, words, or equals signs in the expression.
```
