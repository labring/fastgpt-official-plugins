import { describe, expect, it } from "vitest";
import plugin from "./index";

describe("Baidu moderation manifest", () => {
  it("exports moderation metadata and credential configuration", () => {
    expect(plugin.getPluginType()).toBe("moderation");
    expect(plugin.getUserModerationManifest()).toMatchObject({
      pluginId: "baidu-text-moderation",
      meta: { provider: "baidu" },
    });
  });
});
