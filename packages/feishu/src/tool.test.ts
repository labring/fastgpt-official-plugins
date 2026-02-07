import {
  mockedEventEmitter,
  mockedSystemVar,
} from "@fastgpt-plugin/helpers/tools/mocks";
import { describe, expect, it } from "vitest";
import { InputSchema, OutputSchema } from "./schemas";
import { handler } from "./tool";

describe("feishu", () => {
  it("should run with valid IO schemas", async () => {
    const input = InputSchema.parse({
      content: "hello",
      hook_url: "https://open.feishu.cn/open-apis/bot/v2/hook/test",
    });
    const result = await handler(input, {
      systemVar: mockedSystemVar,
      emitter: mockedEventEmitter,
    });

    const output = OutputSchema.parse(result);
    expect(output).toBeDefined();
  });
});
