import { z } from "zod";

const cellValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);
const rowValuesSchema = z.array(cellValueSchema);
const matrixValuesSchema = z.array(rowValuesSchema);
const sheetRefSchema = z.union([z.string(), z.number()]).optional();

const colorSchema = z.string().regex(/^(#?[0-9a-f]{6}|#?[0-9a-f]{8})$/i);

const styleSchema = z
  .object({
    font: z
      .object({
        bold: z.boolean().optional(),
        italic: z.boolean().optional(),
        underline: z.boolean().optional(),
        name: z.string().optional(),
        size: z.number().min(1).max(409).optional(),
        color: colorSchema.optional(),
      })
      .optional(),
    fill: z
      .object({
        color: colorSchema.optional(),
      })
      .optional(),
    alignment: z
      .object({
        horizontal: z
          .enum([
            "left",
            "center",
            "right",
            "fill",
            "justify",
            "centerContinuous",
            "distributed",
          ])
          .optional(),
        vertical: z
          .enum(["top", "middle", "bottom", "distributed", "justify"])
          .optional(),
        wrapText: z.boolean().optional(),
      })
      .optional(),
    numFmt: z.string().optional(),
  })
  .strict();

const baseRangeOperationSchema = z.object({
  sheet: sheetRefSchema,
  range: z.string().min(1),
});

export const operationSchema = z.discriminatedUnion("op", [
  z
    .object({
      op: z.literal("addWorksheet"),
      name: z.string().min(1),
    })
    .strict(),
  z
    .object({
      op: z.literal("renameWorksheet"),
      sheet: z.union([z.string(), z.number()]),
      name: z.string().min(1),
    })
    .strict(),
  z
    .object({
      op: z.literal("setActiveWorksheet"),
      sheet: z.union([z.string(), z.number()]),
    })
    .strict(),
  z
    .object({
      op: z.literal("setWorksheetVisibility"),
      sheet: z.union([z.string(), z.number()]),
      visibility: z.enum(["visible", "hidden", "veryHidden"]),
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("setValue"),
      value: cellValueSchema,
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("setValues"),
      values: matrixValuesSchema,
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("setFormula"),
      formula: z.string().min(1),
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("setFormulas"),
      formulas: z.array(z.array(z.string())),
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("clear"),
      applyTo: z.enum(["all", "contents", "formats"]).optional(),
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("styleRange"),
      style: styleSchema,
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("autoFitColumns"),
    })
    .strict(),
  baseRangeOperationSchema
    .extend({
      op: z.literal("autoFitRows"),
    })
    .strict(),
]);

export const operationListSchema = z.array(operationSchema).max(5000);

export type WorkbookOperation = z.infer<typeof operationSchema>;
export type CellValue = z.infer<typeof cellValueSchema>;
export type MatrixValues = z.infer<typeof matrixValuesSchema>;
export type CellStyle = z.infer<typeof styleSchema>;
