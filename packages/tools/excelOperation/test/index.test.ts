import ExcelJS from "exceljs";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { tool } from "../src";
import { applyWorkbookOperations } from "../src/excel";
import { runWorkbookScript } from "../src/scriptRunner";
import * as uploadFileModule from "../utils/uploadFile";

vi.mock("../utils/uploadFile");

const mockUploadFile = vi.mocked(uploadFileModule.uploadFile);

beforeEach(() => {
  vi.clearAllMocks();
  mockUploadFile.mockResolvedValue({
    accessUrl: "https://example.com/result.xlsx",
  } as any);
});

describe("excelOperation script runner", () => {
  test("collects workbook operations from the facade", () => {
    const result = runWorkbookScript(`
      const sheet = workbook.getWorksheet("Sheet1");
      sheet.getRange("A1").setValue("done");
      sheet.getRange("B1").setFormula("=SUM(A2:A3)");
      sheet.getUsedRange().getFormat().autofitColumns();
    `);

    expect(result.operations).toEqual([
      { op: "setValue", sheet: "Sheet1", range: "A1", value: "done" },
      {
        op: "setFormula",
        sheet: "Sheet1",
        range: "B1",
        formula: "=SUM(A2:A3)",
      },
      { op: "autoFitColumns", sheet: "Sheet1", range: "usedRange" },
    ]);
  });

  test("does not expose host capabilities to scripts", () => {
    const result = runWorkbookScript(
      `
        workbook.getWorksheet("Sheet1").getRange("A1:D1").setValues([[
          typeof process,
          typeof fetch,
          typeof require,
          typeof uploadFile,
        ]]);
        workbook.getWorksheet("Sheet1").getRange("A2").setValue(typeof ExcelJS);
      `,
    );
    expect(result.operations[0]).toMatchObject({
      values: [["undefined", "undefined", "undefined", "undefined"]],
    });
    expect(result.operations[1]).toMatchObject({ value: "undefined" });
  });

  test("collects promise microtask operations before returning", () => {
    const result = runWorkbookScript(`
      Promise.resolve().then(() => {
        workbook.getWorksheet("Sheet1").getRange("A1").setValue("later");
      });
    `);

    expect(result.operations).toEqual([
      { op: "setValue", sheet: "Sheet1", range: "A1", value: "later" },
    ]);
  });
});

describe("excelOperation workbook operations", () => {
  test("applies values, formulas, styles, and autofit operations", async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("Sheet1");

    await applyWorkbookOperations(workbook, [
      { op: "setValue", sheet: "Sheet1", range: "A1", value: "done" },
      {
        op: "setValues",
        sheet: "Sheet1",
        range: "A2:B3",
        values: [
          ["姓名", "分数"],
          ["张三", 95],
        ],
      },
      {
        op: "setFormula",
        sheet: "Sheet1",
        range: "C3",
        formula: "=SUM(B2:B3)",
      },
      {
        op: "styleRange",
        sheet: "Sheet1",
        range: "A1:C1",
        style: { font: { bold: true } },
      },
      { op: "autoFitColumns", sheet: "Sheet1", range: "usedRange" },
    ]);

    const sheet = workbook.getWorksheet("Sheet1");
    expect(sheet?.getCell("A1").value).toBe("done");
    expect(sheet?.getCell("B3").value).toBe(95);
    expect(sheet?.getCell("C3").value).toEqual({ formula: "SUM(B2:B3)" });
    expect(sheet?.getCell("A1").font?.bold).toBe(true);
    expect(sheet?.getColumn(1).width).toBeGreaterThan(10);
  });
});

describe("excelOperation tool", () => {
  test("downloads, edits, uploads, and returns the output URL", async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("Sheet1");
    const inputBuffer = Buffer.from(
      (await workbook.xlsx.writeBuffer()) as ArrayBuffer,
    );
    const file = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${inputBuffer.toString("base64")}`;

    const result = await tool({
      file,
      filename: "processed",
      script: `
          const sheet = workbook.getWorksheet("Sheet1");
          sheet.getRange("A1").setValue("done");
        `,
    });

    expect(result.url).toBe("https://example.com/result.xlsx");
    expect(mockUploadFile).toHaveBeenCalledOnce();
    expect(mockUploadFile.mock.calls[0][0].defaultFilename).toBe(
      "processed.xlsx",
    );
    expect(mockUploadFile.mock.calls[0][0].buffer).toBeInstanceOf(Buffer);
  });
});
