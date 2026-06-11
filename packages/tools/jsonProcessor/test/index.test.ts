import { describe, expect, test } from "vitest";
import toolSet from "..";
import { applyJsonPatch } from "../src/patch";
import { queryJsonPath } from "../src/path";
import { extractStructure } from "../src/structure";

const sampleJson = {
  store: {
    book: [
      { category: "reference", title: "Sayings of the Century", price: 8.95 },
      { category: "fiction", title: "Sword of Honour", price: 12.99 },
      { category: "fiction", title: "Moby Dick", price: 8.99 },
    ],
    bicycle: {
      color: "red",
      price: 19.95,
    },
  },
};

describe("jsonProcessor toolset", () => {
  test("exports a FastGPT toolset", () => {
    expect(toolSet.getUserToolManifest().pluginId).toBe("jsonProcessor");
    expect(toolSet.getChildManifests().map((child) => child.id)).toEqual([
      "jsonPath",
      "structure",
      "jsonPatch",
    ]);
  });

  test("queries JSON values with JSONPath", async () => {
    const result = await queryJsonPath({
      json: sampleJson,
      path: "$.store.book[*].title",
    });

    expect(result.count).toBe(3);
    expect(result.first).toBe("Sayings of the Century");
    expect(result.matches).toEqual([
      "Sayings of the Century",
      "Sword of Honour",
      "Moby Dick",
    ]);
  });

  test("extracts structured fields", async () => {
    const result = await extractStructure({
      json: JSON.stringify(sampleJson),
      fields: [
        { name: "titles", path: "$.store.book[*].title", multiple: true },
        { name: "bicycleColor", path: "$.store.bicycle.color" },
        { name: "currency", path: "$.store.currency", defaultValue: "USD" },
      ],
    });

    expect(result.data).toEqual({
      titles: ["Sayings of the Century", "Sword of Honour", "Moby Dick"],
      bicycleColor: "red",
      currency: "USD",
    });
    expect(result.missingFields).toEqual([]);
  });

  test("applies JSON Patch operations", async () => {
    const result = await applyJsonPatch({
      json: {
        name: "FastGPT",
        tags: ["plugin"],
        meta: {
          version: 1,
        },
      },
      operations: [
        { op: "add", path: "/tags/-", value: "json" },
        { op: "replace", path: "/meta/version", value: 2 },
        { op: "copy", from: "/name", path: "/title" },
      ],
    });

    expect(result.appliedCount).toBe(3);
    expect(result.result).toEqual({
      name: "FastGPT",
      title: "FastGPT",
      tags: ["plugin", "json"],
      meta: {
        version: 2,
      },
    });
  });

  test("throws when JSON Patch test fails", async () => {
    await expect(
      applyJsonPatch({
        json: { enabled: true },
        operations: [{ op: "test", path: "/enabled", value: false }],
      }),
    ).rejects.toThrow("test 操作失败");
  });
});
