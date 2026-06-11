import { JSONPath } from "jsonpath-plus";
import { z } from "zod";
import {
  getErrorMessage,
  JsonInputSchema,
  JsonValueSchema,
  parseJsonInput,
  stringifyJson,
} from "./json";

export const JsonPathInputType = z.object({
  json: JsonInputSchema,
  path: z.string().min(1, "JSONPath 不能为空"),
  resultType: z
    .enum(["value", "path", "pointer", "parent", "parentProperty", "all"])
    .default("value"),
  flatten: z.boolean().default(false),
});

export const JsonPathOutputType = z.object({
  matches: z.array(z.unknown()),
  first: z.unknown().nullable(),
  count: z.number(),
  json: z.string(),
});

export async function queryJsonPath(
  input: z.input<typeof JsonPathInputType>,
): Promise<z.infer<typeof JsonPathOutputType>> {
  const { json, path, resultType, flatten } =
    await JsonPathInputType.parseAsync(input);
  const document = parseJsonInput(json);

  try {
    const matches = JSONPath({
      json: document,
      path,
      resultType,
      flatten,
    }) as unknown[];

    return {
      matches,
      first: matches[0] ?? null,
      count: matches.length,
      json: stringifyJson(JsonValueSchema.parse(matches)),
    };
  } catch (error) {
    throw new Error(`JSONPath 查询失败: ${getErrorMessage(error)}`);
  }
}
