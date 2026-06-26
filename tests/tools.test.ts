import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toolRegistry } from "../src/tools/index.js";
import { calculateTrend, parseIsoDate } from "../src/utils/helpers.js";

describe("tool registry", () => {
  it("registers all six MVP tools", () => {
    const names = toolRegistry.map((tool) => tool.name);
    assert.deepEqual(names, [
      "get_latest_activity",
      "get_activities_range",
      "get_sleep_data",
      "get_heart_rate_trends",
      "get_recovery_status",
      "get_body_composition",
    ]);
  });
});

describe("helpers", () => {
  it("parses ISO dates", () => {
    const date = parseIsoDate("2026-06-01");
    assert.match(date.toISOString(), /2026-06-01/);
  });

  it("detects improving resting heart rate trend", () => {
    const trend = calculateTrend([48, 47, 46, 52, 53, 54], true);
    assert.equal(trend, "improving");
  });

  it("rejects invalid ISO dates", () => {
    assert.throws(() => parseIsoDate("invalid"), /Invalid date/);
  });
});
