import { expect, test } from "vitest";
import { OutputType } from "..";

test("validates normalized remote parser output", () => {
  const output = OutputType.parse({
    result: "# Parsed markdown",
    files: [
      {
        filename: "example.pdf",
        markdown: "# Parsed markdown",
        html: "<h1>Parsed markdown</h1>",
      },
    ],
  });

  expect(output.result).toBe("# Parsed markdown");
  expect(output.files[0]?.filename).toBe("example.pdf");
});
