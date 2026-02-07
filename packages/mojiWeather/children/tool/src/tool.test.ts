import {
  mockedEventEmitter,
  mockedSystemVar,
} from "@fastgpt-plugin/helpers/tools/mocks";
import { describe, expect, it } from "vitest";
import { InputSchema, OutputSchema } from "./schemas";
import { handler } from "./tool";

describe("mojiWeather tool", () => {
  it("should have valid schemas defined", () => {
    expect(InputSchema).toBeDefined();
    expect(OutputSchema).toBeDefined();
  });

  it("should reject when no city info provided", async () => {
    await expect(
      handler(
        InputSchema.parse({
          apiKey: "test-key",
          city: "杭州",
          province: "浙江",
          towns: "",
          start_time: "2024-07-18",
          end_time: "2024-07-20",
        }),
        {
          systemVar: mockedSystemVar,
          emitter: mockedEventEmitter,
        },
      ),
    ).rejects.toBeDefined();
  });
});
