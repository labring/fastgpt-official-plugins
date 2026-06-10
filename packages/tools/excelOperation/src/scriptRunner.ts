import vm from "node:vm";
import { operationListSchema, type WorkbookOperation } from "./operations";

const FACADE_SCRIPT = `
(() => {
  const __ops = [];
  const __logs = [];
  const __limits = { maxOperations: 5000 };

  function assertOperationLimit() {
    if (__ops.length >= __limits.maxOperations) {
      throw new Error("Operation limit exceeded");
    }
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pushOp(op) {
    assertOperationLimit();
    __ops.push(cloneJson(op));
  }

  function normalizeSheetRef(sheet) {
    if (typeof sheet !== "string" && typeof sheet !== "number" && sheet !== undefined) {
      throw new Error("Sheet reference must be a string or number");
    }
    return sheet;
  }

  function columnName(index) {
    let value = index + 1;
    let name = "";
    while (value > 0) {
      const mod = (value - 1) % 26;
      name = String.fromCharCode(65 + mod) + name;
      value = Math.floor((value - mod) / 26);
    }
    return name;
  }

  function cellAddress(row, column) {
    if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || column < 0) {
      throw new Error("getCell(row, column) uses zero-based non-negative integer indexes");
    }
    return columnName(column) + String(row + 1);
  }

  function createFontFacade(sheet, range) {
    return {
      setBold(value) {
        pushOp({ op: "styleRange", sheet, range, style: { font: { bold: Boolean(value) } } });
      },
      setItalic(value) {
        pushOp({ op: "styleRange", sheet, range, style: { font: { italic: Boolean(value) } } });
      },
      setUnderline(value) {
        pushOp({ op: "styleRange", sheet, range, style: { font: { underline: Boolean(value) } } });
      },
      setName(value) {
        pushOp({ op: "styleRange", sheet, range, style: { font: { name: String(value) } } });
      },
      setSize(value) {
        pushOp({ op: "styleRange", sheet, range, style: { font: { size: Number(value) } } });
      },
      setColor(value) {
        pushOp({ op: "styleRange", sheet, range, style: { font: { color: String(value) } } });
      }
    };
  }

  function createFillFacade(sheet, range) {
    return {
      setColor(value) {
        pushOp({ op: "styleRange", sheet, range, style: { fill: { color: String(value) } } });
      }
    };
  }

  function createFormatFacade(sheet, range) {
    return {
      autofitColumns() {
        pushOp({ op: "autoFitColumns", sheet, range });
      },
      autofitRows() {
        pushOp({ op: "autoFitRows", sheet, range });
      },
      getFont() {
        return createFontFacade(sheet, range);
      },
      getFill() {
        return createFillFacade(sheet, range);
      },
      setHorizontalAlignment(value) {
        pushOp({ op: "styleRange", sheet, range, style: { alignment: { horizontal: String(value) } } });
      },
      setVerticalAlignment(value) {
        pushOp({ op: "styleRange", sheet, range, style: { alignment: { vertical: String(value) } } });
      },
      setWrapText(value) {
        pushOp({ op: "styleRange", sheet, range, style: { alignment: { wrapText: Boolean(value) } } });
      }
    };
  }

  function createRangeFacade(sheet, range) {
    return {
      setValue(value) {
        pushOp({ op: "setValue", sheet, range, value });
      },
      setValues(values) {
        pushOp({ op: "setValues", sheet, range, values });
      },
      setFormula(formula) {
        pushOp({ op: "setFormula", sheet, range, formula: String(formula) });
      },
      setFormulas(formulas) {
        pushOp({ op: "setFormulas", sheet, range, formulas });
      },
      clear(applyTo = "all") {
        pushOp({ op: "clear", sheet, range, applyTo });
      },
      getFormat() {
        return createFormatFacade(sheet, range);
      }
    };
  }

  function createWorksheetFacade(sheet) {
    const normalizedSheet = normalizeSheetRef(sheet);
    return {
      getName() {
        return normalizedSheet;
      },
      setName(name) {
        pushOp({ op: "renameWorksheet", sheet: normalizedSheet, name: String(name) });
      },
      activate() {
        pushOp({ op: "setActiveWorksheet", sheet: normalizedSheet });
      },
      setVisibility(visibility) {
        pushOp({ op: "setWorksheetVisibility", sheet: normalizedSheet, visibility: String(visibility) });
      },
      getRange(address) {
        return createRangeFacade(normalizedSheet, String(address));
      },
      getCell(row, column) {
        return createRangeFacade(normalizedSheet, cellAddress(row, column));
      },
      getUsedRange() {
        return createRangeFacade(normalizedSheet, "usedRange");
      }
    };
  }

  globalThis.workbook = Object.freeze({
    getWorksheet(name) {
      return createWorksheetFacade(name);
    },
    addWorksheet(name) {
      const sheetName = String(name);
      pushOp({ op: "addWorksheet", name: sheetName });
      return createWorksheetFacade(sheetName);
    },
    getActiveWorksheet() {
      return createWorksheetFacade(undefined);
    }
  });

  globalThis.console = Object.freeze({
    log(...args) {
      __logs.push(args.map((item) => {
        if (typeof item === "string") return item;
        return JSON.stringify(item);
      }).join(" "));
    }
  });

  globalThis.__getWorkbookScriptResult = () => JSON.stringify({ operations: __ops, logs: __logs });
})();
`;

export type ScriptRunResult = {
  operations: WorkbookOperation[];
  logs: string[];
};

export function runWorkbookScript(
  script: string,
  timeoutMs = 1000,
): ScriptRunResult {
  const sandbox = Object.create(null);
  const context = vm.createContext(sandbox, {
    codeGeneration: {
      strings: false,
      wasm: false,
    },
    microtaskMode: "afterEvaluate",
  });

  vm.runInContext(FACADE_SCRIPT, context, { timeout: timeoutMs });
  vm.runInContext(`"use strict";\n${script}`, context, { timeout: timeoutMs });

  const rawResult = vm.runInContext("__getWorkbookScriptResult()", context, {
    timeout: timeoutMs,
  });
  const parsedResult = JSON.parse(String(rawResult)) as {
    operations?: unknown;
    logs?: unknown;
  };

  return {
    operations: operationListSchema.parse(parsedResult.operations ?? []),
    logs: Array.isArray(parsedResult.logs)
      ? parsedResult.logs.map((item) => String(item))
      : [],
  };
}
