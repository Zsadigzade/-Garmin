import type { IActivity } from "garmin-connect/dist/garmin/types/activity.js";
import { appConfig } from "../config.js";
import { withCache } from "../garmin/cache.js";
import { withGarminClient } from "../garmin/client.js";
import type { ActivitySummary, ToolTextResult } from "../garmin/types.js";
import {
  formatDistanceMeters,
  formatDuration,
  formatIsoDate,
  formatPaceMetersPerSecond,
  parseIsoDate,
} from "../utils/helpers.js";

// SECTION: Activity Mapping

function mapActivity(activity: IActivity): ActivitySummary {
  return {
    activityId: activity.activityId,
    name: activity.activityName,
    type: activity.activityType.typeKey,
    startTimeLocal: activity.startTimeLocal,
    distanceMeters: activity.distance,
    durationSeconds: activity.duration,
    averageHeartRate: activity.averageHR ?? null,
    maxHeartRate: activity.maxHR ?? null,
    elevationGainMeters: activity.elevationGain,
    calories: activity.calories,
    averageSpeedMps: activity.averageSpeed,
  };
}

function formatActivitySummary(activity: ActivitySummary): string {
  return [
    `Activity: ${activity.name}`,
    `Type: ${activity.type}`,
    `Date: ${activity.startTimeLocal}`,
    `Distance: ${formatDistanceMeters(activity.distanceMeters)}`,
    `Duration: ${formatDuration(activity.durationSeconds)}`,
    `Pace: ${formatPaceMetersPerSecond(activity.averageSpeedMps)}`,
    `Avg HR: ${activity.averageHeartRate ?? "n/a"} bpm`,
    `Max HR: ${activity.maxHeartRate ?? "n/a"} bpm`,
    `Elevation gain: ${activity.elevationGainMeters.toFixed(0)} m`,
    `Calories: ${activity.calories}`,
  ].join("\n");
}

async function fetchActivities(start = 0, limit = 100): Promise<ActivitySummary[]> {
  return withGarminClient(async (client) => {
    const activities = (await client.getActivities(start, limit)) as IActivity[];
    return activities.map(mapActivity);
  });
}

function filterActivitiesByRange(
  activities: ActivitySummary[],
  startDate: string,
  endDate: string
): ActivitySummary[] {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  end.setUTCHours(23, 59, 59, 999);

  return activities.filter((activity) => {
    const activityDate = new Date(activity.startTimeLocal);
    return activityDate >= start && activityDate <= end;
  });
}

// SECTION: Tool Handlers

export async function getLatestActivity(): Promise<ToolTextResult> {
  const cacheKey = "get_latest_activity:{}";

  const activity = await withCache(cacheKey, appConfig.cacheTtlActivities, async () => {
    const activities = await fetchActivities(0, 1);
    return activities[0] ?? null;
  });

  if (!activity) {
    return {
      type: "text",
      text: "No activities found in your Garmin Connect account.",
    };
  }

  return {
    type: "text",
    text: formatActivitySummary(activity),
  };
}

export async function getActivitiesRange(input: {
  start_date: string;
  end_date: string;
}): Promise<ToolTextResult> {
  const cacheKey = `get_activities_range:${input.start_date}:${input.end_date}`;

  const activities = await withCache(cacheKey, appConfig.cacheTtlActivities, async () => {
    const fetched = await fetchActivities(0, 200);
    return filterActivitiesByRange(fetched, input.start_date, input.end_date);
  });

  if (activities.length === 0) {
    return {
      type: "text",
      text: `No activities found between ${input.start_date} and ${input.end_date}.`,
    };
  }

  const lines = activities.map((activity, index) => {
    return [
      `${index + 1}. ${activity.name} (${activity.type})`,
      `   ${formatIsoDate(new Date(activity.startTimeLocal))} | ${formatDistanceMeters(activity.distanceMeters)} | ${formatDuration(activity.durationSeconds)}`,
    ].join("\n");
  });

  return {
    type: "text",
    text: [`Found ${activities.length} activities:`, "", ...lines].join("\n"),
  };
}

export const activityToolDefinitions = [
  {
    name: "get_latest_activity",
    description: "Returns the most recent Garmin activity with distance, duration, pace, and heart rate stats.",
    inputSchema: {},
    handler: getLatestActivity,
  },
  {
    name: "get_activities_range",
    description: "Returns Garmin activities within an ISO 8601 date range.",
    inputSchema: {
      start_date: {
        type: "string",
        description: "Start date in ISO 8601 format, e.g. 2026-06-01",
      },
      end_date: {
        type: "string",
        description: "End date in ISO 8601 format, e.g. 2026-06-07",
      },
    },
    handler: getActivitiesRange,
  },
];
