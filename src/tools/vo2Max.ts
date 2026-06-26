import { appConfig } from "../config.js";
import { buildToolCacheKey, withCache } from "../garmin/cache.js";
import { withGarminClient } from "../garmin/client.js";
import { fetchMaxMetrics, mapMaxMetrics, type Vo2MaxEntry } from "../garmin/rawApi.js";
import type { ToolTextResult } from "../garmin/types.js";
import type { ToolDefinition } from "./types.js";
import { mapInBatches } from "../utils/batch.js";
import { calculateTrend, getDateRange } from "../utils/helpers.js";

async function fetchVo2MaxDays(days: number): Promise<Vo2MaxEntry[]> {
  const dates = getDateRange(days);

  return withGarminClient(async (client) => {
    const entries = await mapInBatches(dates, async (date) => {
      try {
        const payload = await fetchMaxMetrics(client, date);
        return mapMaxMetrics(date, payload);
      } catch {
        return null;
      }
    });

    return entries.filter((entry): entry is Vo2MaxEntry => entry !== null);
  });
}

export async function getVo2MaxTrends(input: { days?: number }): Promise<ToolTextResult> {
  const days = input.days ?? 30;
  const cacheKey = buildToolCacheKey("get_vo2_max_trends", { days });

  const entries = await withCache(cacheKey, appConfig.cacheTtlStats, async () => {
    return fetchVo2MaxDays(days);
  });

  if (entries.length === 0) {
    return {
      type: "text",
      text: `No VO2 max data found for the last ${days} days.`,
    };
  }

  const values = entries
    .map((entry) => entry.vo2Max)
    .filter((value): value is number => value !== null);

  const trend = calculateTrend(values, false);
  const current = entries[0]?.vo2Max ?? null;
  const previous = entries.at(-1)?.vo2Max ?? null;

  const lines = entries.slice(0, 10).map((entry) => {
    const cycling =
      entry.vo2MaxCycling !== null ? `, cycling ${entry.vo2MaxCycling}` : "";
    return `${entry.date}: VO2 max ${entry.vo2Max ?? "n/a"}${cycling}`;
  });

  return {
    type: "text",
    text: [
      `VO2 max trends over ${entries.length} recorded days:`,
      current !== null ? `Current VO2 max: ${current}` : "",
      previous !== null && entries.length > 1 ? `Oldest in range: ${previous}` : "",
      values.length > 1 ? `Trend: ${trend}` : "",
      "",
      "Recent entries:",
      ...lines,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export const vo2MaxToolDefinitions: ToolDefinition[] = [
  {
    name: "get_vo2_max_trends",
    description: "Returns VO2 max fitness trends over time from Garmin Connect.",
    inputSchema: {
      days: {
        type: "number",
        description: "Number of days to analyze. Defaults to 30.",
      },
    },
    handler: getVo2MaxTrends,
  },
];
