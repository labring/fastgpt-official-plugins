import {
  mockedEventEmitter,
  mockedSystemVar,
} from "@fastgpt-plugin/helpers/tools/mocks";
import { describe, expect, it } from "vitest";
import { InputSchema, OutputSchema } from "./schemas";
import { handler } from "./tool";

describe("mineru parseLocal", () => {
  it("should run with valid IO schemas", async () => {
    const input = InputSchema.parse({
      base_url: "http://127.0.0.1:8000",
      files: ["https://example.com/test.pdf"],
    });
    const result = await handler(input, {
      systemVar: mockedSystemVar,
      emitter: mockedEventEmitter,
    });

    const output = OutputSchema.parse(result);
    expect(output).toBeDefined();
  });
});
