import { describe, expect, test } from "vitest";
import { tool } from "../src";

describe("regexExtract tool", () => {
  test("extracts values with the first capture group by default", async () => {
    const result = await tool({
      text: "订单 A100 金额 39.5，订单 B200 金额 88",
      pattern: "订单\\s+(\\w+)",
      flags: "",
    });

    expect(result).toEqual({
      matches: ["A100", "B200"],
      firstMatch: "A100",
      count: 2,
    });
  });

  test("extracts full matches when there is no capture group", async () => {
    const result = await tool({
      text: "联系邮箱 a@example.com 或 b@example.com",
      pattern: "[\\w.-]+@[\\w.-]+",
      flags: "",
    });

    expect(result.matches).toEqual(["a@example.com", "b@example.com"]);
  });

  test("extracts a specified numeric group", async () => {
    const result = await tool({
      text: "name=FastGPT; version=1.0",
      pattern: "(\\w+)=([^;]+)",
      flags: "",
      group: 2,
    });

    expect(result.matches).toEqual(["FastGPT", "1.0"]);
  });

  test("extracts a specified named group", async () => {
    const result = await tool({
      text: "alice@example.com bob@example.org",
      pattern: "(?<name>[\\w.-]+)@(?<domain>[\\w.-]+)",
      flags: "",
      group: "domain",
    });

    expect(result.matches).toEqual(["example.com", "example.org"]);
  });

  test("supports case-insensitive flags and applies global matching automatically", async () => {
    const result = await tool({
      text: "ID: A1 id: b2",
      pattern: "id:\\s+(\\w+)",
      flags: "i",
    });

    expect(result.matches).toEqual(["A1", "b2"]);
  });

  test("returns a structured error for invalid regular expressions", async () => {
    const result = await tool({
      text: "abc",
      pattern: "(",
      flags: "",
    });

    expect(result.matches).toEqual([]);
    expect(result.count).toBe(0);
    expect(result.error).toContain("Invalid regular expression");
  });
});
