import type ExcelJS from "exceljs";
import type {
  CellStyle,
  CellValue,
  MatrixValues,
  WorkbookOperation,
} from "./operations";

type ApplyState = {
  activeSheetName?: string;
};

type RangeBounds = {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
};

const MAX_RANGE_CELLS = 100000;

export async function applyWorkbookOperations(
  workbook: ExcelJS.Workbook,
  operations: WorkbookOperation[],
) {
  const state: ApplyState = {};
  for (const operation of operations) {
    applyOperation(workbook, state, operation);
  }
}

function applyOperation(
  workbook: ExcelJS.Workbook,
  state: ApplyState,
  operation: WorkbookOperation,
) {
  switch (operation.op) {
    case "addWorksheet": {
      if (!workbook.getWorksheet(operation.name)) {
        workbook.addWorksheet(operation.name);
      }
      state.activeSheetName = operation.name;
      return;
    }
    case "renameWorksheet": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      worksheet.name = operation.name;
      state.activeSheetName = operation.name;
      return;
    }
    case "setActiveWorksheet": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      state.activeSheetName = worksheet.name;
      return;
    }
    case "setWorksheetVisibility": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      worksheet.state = operation.visibility;
      return;
    }
    case "setValue": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      const bounds = resolveRange(worksheet, operation.range);
      forEachCell(worksheet, bounds, (cell) => {
        cell.value = toExcelValue(operation.value);
      });
      return;
    }
    case "setValues": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      setMatrixValues(
        worksheet,
        resolveRange(worksheet, operation.range),
        operation.values,
      );
      return;
    }
    case "setFormula": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      const formula = normalizeFormula(operation.formula);
      const bounds = resolveRange(worksheet, operation.range);
      forEachCell(worksheet, bounds, (cell) => {
        cell.value = { formula };
      });
      return;
    }
    case "setFormulas": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      setFormulaMatrix(
        worksheet,
        resolveRange(worksheet, operation.range),
        operation.formulas,
      );
      return;
    }
    case "clear": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      clearRange(
        worksheet,
        resolveRange(worksheet, operation.range),
        operation.applyTo ?? "all",
      );
      return;
    }
    case "styleRange": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      applyStyle(
        worksheet,
        resolveRange(worksheet, operation.range),
        operation.style,
      );
      return;
    }
    case "autoFitColumns": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      autoFitColumns(worksheet, resolveRange(worksheet, operation.range));
      return;
    }
    case "autoFitRows": {
      const worksheet = getWorksheet(workbook, state, operation.sheet);
      autoFitRows(worksheet, resolveRange(worksheet, operation.range));
      return;
    }
  }
}

function getWorksheet(
  workbook: ExcelJS.Workbook,
  state: ApplyState,
  sheetRef?: string | number,
): ExcelJS.Worksheet {
  if (typeof sheetRef === "string") {
    const worksheet = workbook.getWorksheet(sheetRef);
    if (!worksheet) throw new Error(`Worksheet not found: ${sheetRef}`);
    return worksheet;
  }

  if (typeof sheetRef === "number") {
    const worksheet = workbook.worksheets[sheetRef];
    if (!worksheet) throw new Error(`Worksheet index not found: ${sheetRef}`);
    return worksheet;
  }

  if (state.activeSheetName) {
    const activeWorksheet = workbook.getWorksheet(state.activeSheetName);
    if (activeWorksheet) return activeWorksheet;
  }

  const firstWorksheet = workbook.worksheets[0];
  if (!firstWorksheet) throw new Error("Workbook has no worksheet");
  return firstWorksheet;
}

function resolveRange(
  worksheet: ExcelJS.Worksheet,
  range: string,
): RangeBounds {
  if (range === "usedRange") {
    return getUsedRangeBounds(worksheet);
  }

  const normalizedRange = range.replace(/\$/g, "").toUpperCase();
  const singleCell = normalizedRange.match(/^([A-Z]+)(\d+)$/);
  if (singleCell) {
    const col = columnNameToNumber(singleCell[1]);
    const row = Number(singleCell[2]);
    return normalizeBounds({
      startRow: row,
      startCol: col,
      endRow: row,
      endCol: col,
    });
  }

  const rectangularRange = normalizedRange.match(
    /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/,
  );
  if (rectangularRange) {
    const startCol = columnNameToNumber(rectangularRange[1]);
    const startRow = Number(rectangularRange[2]);
    const endCol = columnNameToNumber(rectangularRange[3]);
    const endRow = Number(rectangularRange[4]);
    return normalizeBounds({ startRow, startCol, endRow, endCol });
  }

  const columnRange = normalizedRange.match(/^([A-Z]+):([A-Z]+)$/);
  if (columnRange) {
    const startCol = columnNameToNumber(columnRange[1]);
    const endCol = columnNameToNumber(columnRange[2]);
    return normalizeBounds({
      startRow: 1,
      startCol,
      endRow: Math.max(worksheet.rowCount, 1),
      endCol,
    });
  }

  const rowRange = normalizedRange.match(/^(\d+):(\d+)$/);
  if (rowRange) {
    const startRow = Number(rowRange[1]);
    const endRow = Number(rowRange[2]);
    return normalizeBounds({
      startRow,
      startCol: 1,
      endRow,
      endCol: Math.max(worksheet.columnCount, 1),
    });
  }

  throw new Error(`Unsupported range address: ${range}`);
}

function normalizeBounds(bounds: RangeBounds): RangeBounds {
  const normalized = {
    startRow: Math.min(bounds.startRow, bounds.endRow),
    startCol: Math.min(bounds.startCol, bounds.endCol),
    endRow: Math.max(bounds.startRow, bounds.endRow),
    endCol: Math.max(bounds.startCol, bounds.endCol),
  };

  if (normalized.startRow < 1 || normalized.startCol < 1) {
    throw new Error("Range row and column indexes must start from 1");
  }

  const cellCount =
    (normalized.endRow - normalized.startRow + 1) *
    (normalized.endCol - normalized.startCol + 1);
  if (cellCount > MAX_RANGE_CELLS) {
    throw new Error(`Range is too large: ${cellCount} cells`);
  }

  return normalized;
}

function getUsedRangeBounds(worksheet: ExcelJS.Worksheet): RangeBounds {
  let startRow = Number.POSITIVE_INFINITY;
  let startCol = Number.POSITIVE_INFINITY;
  let endRow = 1;
  let endCol = 1;

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (_cell, colNumber) => {
      startRow = Math.min(startRow, rowNumber);
      startCol = Math.min(startCol, colNumber);
      endRow = Math.max(endRow, rowNumber);
      endCol = Math.max(endCol, colNumber);
    });
  });

  if (!Number.isFinite(startRow) || !Number.isFinite(startCol)) {
    return { startRow: 1, startCol: 1, endRow: 1, endCol: 1 };
  }

  return { startRow, startCol, endRow, endCol };
}

function forEachCell(
  worksheet: ExcelJS.Worksheet,
  bounds: RangeBounds,
  callback: (cell: ExcelJS.Cell, row: number, col: number) => void,
) {
  for (let row = bounds.startRow; row <= bounds.endRow; row++) {
    for (let col = bounds.startCol; col <= bounds.endCol; col++) {
      callback(worksheet.getCell(row, col), row, col);
    }
  }
}

function setMatrixValues(
  worksheet: ExcelJS.Worksheet,
  bounds: RangeBounds,
  values: MatrixValues,
) {
  if (values.length === 0) return;
  const expectedRows = bounds.endRow - bounds.startRow + 1;
  const expectedCols = bounds.endCol - bounds.startCol + 1;
  const targetRows =
    expectedRows === 1 && expectedCols === 1 ? values.length : expectedRows;
  const targetCols =
    expectedRows === 1 && expectedCols === 1
      ? Math.max(...values.map((row) => row.length), 0)
      : expectedCols;
  normalizeBounds({
    startRow: bounds.startRow,
    startCol: bounds.startCol,
    endRow: bounds.startRow + targetRows - 1,
    endCol: bounds.startCol + targetCols - 1,
  });

  if (
    values.length !== targetRows ||
    values.some((row) => row.length !== targetCols)
  ) {
    throw new Error("setValues dimensions must match the target range");
  }

  for (let rowOffset = 0; rowOffset < targetRows; rowOffset++) {
    for (let colOffset = 0; colOffset < targetCols; colOffset++) {
      worksheet.getCell(
        bounds.startRow + rowOffset,
        bounds.startCol + colOffset,
      ).value = toExcelValue(values[rowOffset]?.[colOffset] ?? null);
    }
  }
}

function setFormulaMatrix(
  worksheet: ExcelJS.Worksheet,
  bounds: RangeBounds,
  formulas: string[][],
) {
  const rowCount = bounds.endRow - bounds.startRow + 1;
  const colCount = bounds.endCol - bounds.startCol + 1;
  if (
    formulas.length !== rowCount ||
    formulas.some((row) => row.length !== colCount)
  ) {
    throw new Error("setFormulas dimensions must match the target range");
  }

  for (let rowOffset = 0; rowOffset < rowCount; rowOffset++) {
    for (let colOffset = 0; colOffset < colCount; colOffset++) {
      worksheet.getCell(
        bounds.startRow + rowOffset,
        bounds.startCol + colOffset,
      ).value = {
        formula: normalizeFormula(formulas[rowOffset]?.[colOffset] ?? ""),
      };
    }
  }
}

function clearRange(
  worksheet: ExcelJS.Worksheet,
  bounds: RangeBounds,
  applyTo: "all" | "contents" | "formats",
) {
  forEachCell(worksheet, bounds, (cell) => {
    if (applyTo === "all" || applyTo === "contents") {
      cell.value = null;
    }
    if (applyTo === "all" || applyTo === "formats") {
      cell.style = {};
    }
  });
}

function applyStyle(
  worksheet: ExcelJS.Worksheet,
  bounds: RangeBounds,
  style: CellStyle,
) {
  forEachCell(worksheet, bounds, (cell) => {
    if (style.font) {
      const font: Partial<ExcelJS.Font> = { ...cell.font };
      if (style.font.bold !== undefined) font.bold = style.font.bold;
      if (style.font.italic !== undefined) font.italic = style.font.italic;
      if (style.font.underline !== undefined)
        font.underline = style.font.underline;
      if (style.font.name !== undefined) font.name = style.font.name;
      if (style.font.size !== undefined) font.size = style.font.size;
      if (style.font.color !== undefined)
        font.color = { argb: normalizeColor(style.font.color) };
      cell.font = {
        ...font,
      };
    }
    if (style.fill?.color) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: normalizeColor(style.fill.color) },
      };
    }
    if (style.alignment) {
      const alignment: Partial<ExcelJS.Alignment> = { ...cell.alignment };
      if (style.alignment.horizontal !== undefined)
        alignment.horizontal = style.alignment.horizontal;
      if (style.alignment.vertical !== undefined)
        alignment.vertical = style.alignment.vertical;
      if (style.alignment.wrapText !== undefined)
        alignment.wrapText = style.alignment.wrapText;
      cell.alignment = {
        ...alignment,
      };
    }
    if (style.numFmt) {
      cell.numFmt = style.numFmt;
    }
  });
}

function autoFitColumns(worksheet: ExcelJS.Worksheet, bounds: RangeBounds) {
  for (let col = bounds.startCol; col <= bounds.endCol; col++) {
    let maxLength = 10;
    for (let row = bounds.startRow; row <= bounds.endRow; row++) {
      const value = worksheet.getCell(row, col).value;
      maxLength = Math.max(maxLength, cellText(value).length);
    }
    worksheet.getColumn(col).width = Math.min(Math.max(maxLength + 2, 10), 80);
  }
}

function autoFitRows(worksheet: ExcelJS.Worksheet, bounds: RangeBounds) {
  for (let row = bounds.startRow; row <= bounds.endRow; row++) {
    let maxLines = 1;
    for (let col = bounds.startCol; col <= bounds.endCol; col++) {
      maxLines = Math.max(
        maxLines,
        cellText(worksheet.getCell(row, col).value).split(/\r?\n/).length,
      );
    }
    worksheet.getRow(row).height = Math.min(Math.max(maxLines * 16, 16), 240);
  }
}

function cellText(value: ExcelJS.CellValue) {
  if (value == null) return "";
  if (typeof value === "object") {
    if ("formula" in value) return `=${value.formula}`;
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((item) => item.text).join("");
    }
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return String(value.result ?? "");
  }
  return String(value);
}

function toExcelValue(value: CellValue): ExcelJS.CellValue {
  return value;
}

function normalizeFormula(formula: string) {
  return formula.startsWith("=") ? formula.slice(1) : formula;
}

function normalizeColor(color: string) {
  const normalized = color.replace(/^#/, "").toUpperCase();
  return normalized.length === 6 ? `FF${normalized}` : normalized;
}

function columnNameToNumber(name: string | undefined) {
  if (!name) throw new Error("Invalid column name");
  let result = 0;
  for (const char of name.toUpperCase()) {
    result = result * 26 + char.charCodeAt(0) - 64;
  }
  return result;
}
