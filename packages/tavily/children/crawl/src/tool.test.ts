import {
  mockedEventEmitter,
  mockedSystemVar,
} from "@fastgpt-plugin/helpers/tools/mocks";
import { describe, expect, it } from "vitest";
import { InputSchema, OutputSchema } from "./schemas";
import { handler } from "./tool";

describe("tavily crawl", () => {
  it("should have valid schemas defined", () => {
    expect(InputSchema).toBeDefined();
    expect(OutputSchema).toBeDefined();
  });

  it("should reject with invalid API key", async () => {
    await expect(
      handler(
        InputSchema.parse({
          tavilyApiKey: "invalid-key",
          url: "https://example.com",
        }),
        {
          systemVar: mockedSystemVar,
          emitter: mockedEventEmitter,
        },
      ),
    ).rejects.toBeDefined();
  });
});
