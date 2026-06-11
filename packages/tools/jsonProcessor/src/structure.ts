import { JSONPath } from "jsonpath-plus";
import { z } from "zod";
import {
  getErrorMessage,
  JsonInputSchema,
  JsonValueSchema,
  parseJsonInput,
  stringifyJson,
} from "./json";

const FieldSchema = z.object({
  name: z.string().min(1, "字段名不能为空"),
  path: z.string().min(1, "JSONPath 不能为空"),
  multiple: z.boolean().optional().default(false),
  defaultValue: JsonValueSchema.optional(),
});

export const StructureInputType = z.object({
  json: JsonInputSchema,
  fields: z.array(FieldSchema).min(1, "至少需要一个字段映射"),
  includeMissing: z.boolean().optional().default(false),
});

export const StructureOutputType = z.object({
  data: z.record(z.string(), z.unknown()),
  missingFields: z.array(z.string()),
  json: z.string(),
});

export async function extractStructure(
  input: z.input<typeof StructureInputType>,
): Promise<z.infer<typeof StructureOutputType>> {
  const { json, fields, includeMissing } =
    await StructureInputType.parseAsync(input);
  const document = parseJsonInput(json);
  const data: Record<string, unknown> = {};
  const missingFields: string[] = [];

  for (const field of fields) {
    try {
      const matches = JSONPath({
        json: document,
        path: field.path,
        resultType: "value",
        flatten: true,
      }) as unknown[];

      if (matches.length > 0) {
        data[field.name] = field.multiple ? matches : matches[0];
      } else if (field.defaultValue !== undefined) {
        data[field.name] = field.defaultValue;
      } else {
        missingFields.push(field.name);
        if (includeMissing) {
          data[field.name] = null;
        }
      }
    } catch (error) {
      throw new Error(`字段 ${field.name} 提取失败: ${getErrorMessage(error)}`);
    }
  }

  return {
    data,
    missingFields,
    json: stringifyJson(JsonValueSchema.parse(data)),
  };
}
