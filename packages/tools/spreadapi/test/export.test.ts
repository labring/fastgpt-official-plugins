import { describe, expect, it } from "vitest";
import {
  InputType as ExecuteCalculationInput,
  tool as executeCalculationTool,
} from "../children/executeCalculation/src";
import {
  InputType as GetServiceInfoInput,
  tool as getServiceInfoTool,
} from "../children/getServiceInfo/src";
import {
  buildExecuteUrl,
  buildInfoUrl,
  createSpreadApiHeaders,
} from "../client";

describe("SpreadAPI toolset", () => {
  it("exports all tool callbacks", () => {
    expect(typeof executeCalculationTool).toBe("function");
    expect(typeof getServiceInfoTool).toBe("function");
  });

  it("validates executeCalculation input", () => {
    const result = ExecuteCalculationInput.safeParse({
      serviceUrl:
        "https://spreadapi.io/d/3887fde5-2a4b-4d18-ba6f-8bcc6f01dd87_mq6dq2rqjm8mn",
      inputs: { quantity: 10 },
      query: { locale: "zh-CN" },
    });

    expect(result.success).toBe(true);
  });

  it("validates getServiceInfo input", () => {
    const result = GetServiceInfoInput.safeParse({
      serviceUrl:
        "https://spreadapi.io/api/v1/services/3887fde5-2a4b-4d18-ba6f-8bcc6f01dd87_mq6dq2rqjm8mn/execute",
    });

    expect(result.success).toBe(true);
  });

  it("normalizes SpreadAPI share and service URLs", () => {
    const serviceId = "3887fde5-2a4b-4d18-ba6f-8bcc6f01dd87_mq6dq2rqjm8mn";

    expect(buildExecuteUrl(`https://spreadapi.io/d/${serviceId}`)).toBe(
      `https://spreadapi.io/api/v1/services/${serviceId}/execute`,
    );
    expect(
      buildInfoUrl(`https://spreadapi.io/api/v1/services/${serviceId}/execute`),
    ).toBe(`https://spreadapi.io/api/v1/services/${serviceId}`);
  });

  it("only sends Authorization when an API key is configured", () => {
    expect(createSpreadApiHeaders()).toEqual({
      "Content-Type": "application/json",
    });
    expect(createSpreadApiHeaders("spreadapi-key")).toEqual({
      Authorization: "Bearer spreadapi-key",
      "Content-Type": "application/json",
    });
  });
});
