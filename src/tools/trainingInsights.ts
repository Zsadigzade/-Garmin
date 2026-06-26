import { filterActivitiesByRange } from "../utils/helpers.js";
import { DateTime } from "luxon";
import { getActivitiesPool, formatActivitySummary } from "./activities.js";
import { getSleepDataTool } from "./sleep.js";
import { getRecoveryStatus } from "./recovery.js";
import { getStressLevels } from "./stress.js";
import type { ToolTextResult } from "../garmin/types.js";
import type { ToolDefinition } from "./types.js";

export async function getTrainingInsights(input: { days?: number }): Promise<ToolTextResult> {
  const days = input.days ?? 7;
  const endDate = DateTime.now().toISODate();
  const startDate = DateTime.now().minus({ days }).toISODate();

  const { activities: pool } = await getActivitiesPool();
  const ranged = filterActivitiesByRange(pool, startDate ?? "", endDate ?? "");
  const latest = pool[0] ?? null;

  const [sleep, recovery, stress] = await Promise.all([
    getSleepDataTool({ nights: days }),
    getRecoveryStatus({}),
    getStressLevels({ days }),
  ]);

  const activityLines =
    ranged.length > 0
      ? ranged.map((activity, index) => {
          return `${index + 1}. ${activity.name} (${activity.type}) — ${activity.startTimeLocal}`;
        })
      : [`No activities found between ${startDate} and ${endDate}.`];

  const sections = [
    "Training insights summary",
    `Period: ${startDate} to ${endDate}`,
    "",
    "## Latest activity",
    latest ? formatActivitySummary(latest) : "No activities found.",
    "",
    "## Activities in period",
    ...activityLines,
    "",
    "## Sleep",
    sleep.text,
    "",
    "## Recovery",
    recovery.text,
    "",
    "## Stress",
    stress.text,
  ];

  return {
    type: "text",
    text: sections.join("\n"),
  };
}

export const trainingInsightsToolDefinitions: ToolDefinition[] = [
  {
    name: "get_training_insights",
    description:
      "Returns a combined weekly training summary: latest activity, recent workouts, sleep, recovery, and stress.",
    inputSchema: {
      days: {
        type: "number",
        description: "Number of days to summarize. Defaults to 7.",
      },
    },
    handler: getTrainingInsights,
  },
];
