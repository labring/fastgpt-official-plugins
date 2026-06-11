import { describe, expect, it } from "vitest";
import toolSet from "..";
import {
  assertSafeFilter,
  parseDocumentJson,
  parseDocumentsJson,
  parsePipelineJson,
  parseUpdateJson,
} from "../client";

describe("mongodb toolset", () => {
  it("exports toolset manifest and children", () => {
    expect(toolSet).toBeDefined();
    expect(toolSet.userToolManifest.pluginId).toBe("mongodb");
    expect(toolSet.toolHandlers.size).toBe(5);
    expect(toolSet.childManifests.size).toBe(5);
    expect(toolSet.toolHandlers.has("find")).toBe(true);
    expect(toolSet.toolHandlers.has("aggregate")).toBe(true);
  });

  it("parses MongoDB Extended JSON documents", () => {
    const doc = parseDocumentJson(
      '{"_id":{"$oid":"656000000000000000000000"}}',
      "filter",
    );

    expect(doc._id).toBeDefined();
  });

  it("accepts insert object arrays", () => {
    const docs = parseDocumentsJson('[{"name":"Ada"},{"name":"Grace"}]');

    expect(Array.isArray(docs)).toBe(true);
  });

  it("accepts aggregation pipelines", () => {
    const pipeline = parsePipelineJson(
      '[{"$match":{"status":"active"}},{"$limit":5}]',
    );

    expect(pipeline).toHaveLength(2);
  });

  it("requires update operators for replacement-style update input", () => {
    expect(() => parseUpdateJson('{"name":"Ada"}')).toThrow(/update operators/);
  });

  it("blocks empty filters unless explicitly allowed", () => {
    expect(() => assertSafeFilter({}, false, "delete")).toThrow(
      /non-empty filter/,
    );
    expect(() => assertSafeFilter({}, true, "delete")).not.toThrow();
  });
});
