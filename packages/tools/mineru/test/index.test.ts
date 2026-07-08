import { expect, test } from "vitest";
import toolSet from "../index.ts";

test("exposes normalized parser output schemas for both child tools", () => {
  const output = {
    result: "# Parsed markdown",
    files: [
      {
        filename: "example.pdf",
        markdown: "# Parsed markdown",
        images: ["https://example.com/image.png"],
        contentList: [{ type: "text", text: "Parsed markdown" }],
      },
    ],
  };

  expect(
    toolSet.getToolHandler("parseLocal")?.outputSchema.safeParse(output)
      .success,
  ).toBe(true);
  expect(
    toolSet.getToolHandler("parseRemote")?.outputSchema.safeParse(output)
      .success,
  ).toBe(true);
});

test("requires files input for both child tools", () => {
  const input = {
    files: ["https://example.com/example.pdf"],
  };

  expect(
    toolSet.getToolHandler("parseLocal")?.inputSchema.safeParse(input).success,
  ).toBe(true);
  expect(
    toolSet.getToolHandler("parseRemote")?.inputSchema.safeParse(input).success,
  ).toBe(true);
  expect(
    toolSet.getToolHandler("parseRemote")?.inputSchema.safeParse({}).success,
  ).toBe(false);
});
