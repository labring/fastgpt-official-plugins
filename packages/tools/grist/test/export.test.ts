import { describe, expect, it } from "vitest";
import {
  InputType as DocumentExportInput,
  tool as documentExportTool,
} from "../children/documentExport/src";
import {
  InputType as DocumentImportInput,
  tool as documentImportTool,
} from "../children/documentImport/src";
import {
  InputType as RecordCreateInput,
  tool as recordCreateTool,
} from "../children/recordCreate/src";
import {
  InputType as RecordsListInput,
  tool as recordsListTool,
} from "../children/recordsList/src";
import {
  InputType as RecordUpdateInput,
  tool as recordUpdateTool,
} from "../children/recordUpdate/src";

describe("Grist toolset", () => {
  it("exports all tool callbacks", () => {
    expect(typeof documentExportTool).toBe("function");
    expect(typeof documentImportTool).toBe("function");
    expect(typeof recordCreateTool).toBe("function");
    expect(typeof recordUpdateTool).toBe("function");
    expect(typeof recordsListTool).toBe("function");
  });

  it("validates documentImport input", () => {
    const result = DocumentImportInput.safeParse({
      gristApiKey: "grist-key",
      workspaceId: 1,
      fileUrl: "https://example.com/report.xlsx",
      documentName: "Imported report",
      timezone: "America/New_York",
    });

    expect(result.success).toBe(true);
  });

  it("validates documentExport input", () => {
    const result = DocumentExportInput.safeParse({
      gristApiKey: "grist-key",
      docId: "doc-id",
      nohistory: true,
    });

    expect(result.success).toBe(true);
  });

  it("validates xlsx document export input", () => {
    const result = DocumentExportInput.safeParse({
      gristApiKey: "grist-key",
      docId: "doc-id",
      format: "xlsx",
      header: "label",
    });

    expect(result.success).toBe(true);
  });

  it("validates table export input", () => {
    const result = DocumentExportInput.safeParse({
      gristApiKey: "grist-key",
      docId: "doc-id",
      format: "csv",
      tableId: "Table1",
      header: "colId",
    });

    expect(result.success).toBe(true);
  });

  it("validates recordsList input", () => {
    const result = RecordsListInput.safeParse({
      gristApiKey: "grist-key",
      docId: "doc-id",
      tableId: "Table1",
      filter: { Status: ["Open"] },
    });

    expect(result.success).toBe(true);
  });

  it("validates recordCreate input", () => {
    const result = RecordCreateInput.safeParse({
      gristApiKey: "grist-key",
      docId: "doc-id",
      tableId: "Table1",
      fields: { Name: "Ada" },
    });

    expect(result.success).toBe(true);
  });

  it("validates recordUpdate input", () => {
    const result = RecordUpdateInput.safeParse({
      gristApiKey: "grist-key",
      docId: "doc-id",
      tableId: "Table1",
      recordId: 1,
      fields: { Status: "Done" },
    });

    expect(result.success).toBe(true);
  });
});
