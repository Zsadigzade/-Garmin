import { appConfig } from "../config.js";
import { buildToolCacheKey, withCache } from "../garmin/cache.js";
import { withGarminClient } from "../garmin/client.js";
import {
  fetchDailyStress,
  mapDailyStress,
  type DailyStressSummary,
} from "../garmin/rawApi.js";
import type { ToolTextResult } from "../garmin/types.js";
import type { ToolDefinition } from "./types.js";
import { mapInBatches } from "../utils/batch.js";
import { average, calculateTrend, getDateRange } from "../utils/helpers.js";

async function fetchStressDays(days: number): Promise<DailyStressSummary[]> {
  const dates = getDateRange(days);

  return withGarminClient(async (client) => {
    const summaries = await mapInBatches(dates, async (date) => {
      try {
        const payload = await fetchDailyStress(client, date);
        return mapDailyStress(date, payload);
      } catch {
        return null;
      }
    });

    return summaries.filter((entry): entry is DailyStressSummary => entry !== null);
  });
}

export async function getStressLevels(input: { days?: number }): Promise<ToolTextResult> {
  const days = input.days ?? 7;
  const cacheKey = buildToolCacheKey("get_stress_levels", { days });

  const summaries = await withCache(cacheKey, appConfig.cacheTtlStats, async () => {
    return fetchStressDays(days);
  });

  if (summaries.length === 0) {
    return {
      type: "text",
      text: `No stress data found for the last ${days} days.`,
    };
  }

  const averages = summaries
    .map((entry) => entry.averageStress)
    .filter((value): value is number => value !== null);

  const trend = calculateTrend(averages, true);
  const avgStress = averages.length > 0 ? Math.round(average(averages)) : null;

  const lines = summaries.slice(0, 7).map((entry) => {
    return `${entry.date}: avg ${entry.averageStress ?? "n/a"}, max ${entry.maxStress ?? "n/a"}`;
  });

  return {
    type: "text",
    text: [
      `Stress levels over ${summaries.length} recorded days:`,
      avgStress !== null ? `Average stress: ${avgStress}` : "",
      averages.length > 1 ? `Trend: ${trend}` : "",
      "",
      "Recent days:",
      ...lines,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export const stressToolDefinitions: ToolDefinition[] = [
  {
    name: "get_stress_levels",
    description: "Returns daily stress averages and trends from Garmin Connect.",
    inputSchema: {
      days: {
        type: "number",
        description: "Number of days to analyze. Defaults to 7.",
      },
    },
    handler: getStressLevels,
  },
];
