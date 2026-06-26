import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapDailyStress, mapMaxMetrics } from "../src/garmin/rawApi.js";

describe("rawApi mappers", () => {
  it("maps daily stress payloads", () => {
    const date = new Date("2026-06-25T00:00:00.000Z");
    const mapped = mapDailyStress(date, {
      overallStressLevel: 32,
      maxStressLevel: 78,
      restStressLevel: 12,
      stressDuration: 3600,
    });

    assert.equal(mapped?.date, "2026-06-25");
    assert.equal(mapped?.averageStress, 32);
    assert.equal(mapped?.maxStress, 78);
  });

  it("maps VO2 max payloads", () => {
    const date = new Date("2026-06-25T00:00:00.000Z");
    const mapped = mapMaxMetrics(date, {
      generic: { vo2MaxValue: 48 },
      cycling: { vo2MaxValue: 44 },
    });

    assert.equal(mapped?.date, "2026-06-25");
    assert.equal(mapped?.vo2Max, 48);
    assert.equal(mapped?.vo2MaxCycling, 44);
  });

  it("returns null for empty stress payloads", () => {
    const mapped = mapDailyStress(new Date("2026-06-25T00:00:00.000Z"), null);
    assert.equal(mapped, null);
  });
});
