import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { Parser } from "expr-eval";
import type { Input, Output } from "./schemas";

const replaceSpecialChar = (expr: string) => {
  const result = expr.replace(/\*\*/g, "^");
  return result;
};

export async function handler(
  { expr }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const parseExpr = expr;

  if (typeof parseExpr !== "string") {
    return Promise.reject("Expr is not a string");
  }

  try {
    const parser = new Parser();
    const exprParser = parser.parse(replaceSpecialChar(parseExpr));

    return {
      result: exprParser.evaluate(),
    };
  } catch (error) {
    return {
      result: `${parseExpr} is not a valid math expression. Error: ${error}`,
    };
  }
}
