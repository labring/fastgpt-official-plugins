import {
  mockedEventEmitter,
  mockedSystemVar,
} from "@fastgpt-plugin/helpers/tools/mocks";
import { describe, expect, it } from "vitest";
import { InputSchema, OutputSchema } from "./schemas";
import { handler } from "./tool";

describe("minimax tts", () => {
  it("should run with valid IO schemas", async () => {
    const input = InputSchema.parse({
      apiKey: "test-api-key",
      text: "hello",
      model: "speech-2.5-hd-preview",
      voice_id: "male-qn-qingse",
      speed: 1,
      vol: 1,
      pitch: 0,
      emotion: "",
      english_normalization: false,
    });
    const result = await handler(input, {
      systemVar: mockedSystemVar,
      emitter: mockedEventEmitter,
    });

    const output = OutputSchema.parse(result);
    expect(output).toBeDefined();
  });
});
