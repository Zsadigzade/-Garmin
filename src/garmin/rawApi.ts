import { DateTime } from "luxon";
import type { GarminConnectInstance } from "./garminConnect.js";

const GC_API = "https://connectapi.garmin.com";

function toGarminDate(date: Date): string {
  return DateTime.fromJSDate(date, { zone: "utc" }).toFormat("yyyy-MM-dd");
}

export async function fetchDailyStress(client: GarminConnectInstance, date: Date): Promise<unknown> {
  return client.get(`${GC_API}/wellness-service/wellness/dailyStress`, {
    params: { date: toGarminDate(date) },
  });
}

export async function fetchMaxMetrics(client: GarminConnectInstance, date: Date): Promise<unknown> {
  return client.get(`${GC_API}/metrics-service/metrics/maxmet/daily/${toGarminDate(date)}`);
}

export interface DailyStressSummary {
  date: string;
  averageStress: number | null;
  maxStress: number | null;
  restStress: number | null;
  stressDurationSeconds: number | null;
}

export interface Vo2MaxEntry {
  date: string;
  vo2Max: number | null;
  vo2MaxCycling: number | null;
}

export function mapDailyStress(date: Date, payload: unknown): DailyStressSummary | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;

  return {
    date: toGarminDate(date),
    averageStress: typeof data.overallStressLevel === "number" ? data.overallStressLevel : null,
    maxStress: typeof data.maxStressLevel === "number" ? data.maxStressLevel : null,
    restStress: typeof data.restStressLevel === "number" ? data.restStressLevel : null,
    stressDurationSeconds:
      typeof data.stressDuration === "number" ? data.stressDuration : null,
  };
}

export function mapMaxMetrics(date: Date, payload: unknown): Vo2MaxEntry | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const generic = data.generic as Record<string, unknown> | undefined;
  const cycling = data.cycling as Record<string, unknown> | undefined;

  const vo2Max =
    typeof generic?.vo2MaxValue === "number"
      ? generic.vo2MaxValue
      : typeof data.vo2MaxValue === "number"
        ? data.vo2MaxValue
        : null;

  const vo2MaxCycling =
    typeof cycling?.vo2MaxValue === "number"
      ? cycling.vo2MaxValue
      : typeof data.vo2MaxCyclingValue === "number"
        ? data.vo2MaxCyclingValue
        : null;

  if (vo2Max === null && vo2MaxCycling === null) {
    return null;
  }

  return {
    date: toGarminDate(date),
    vo2Max,
    vo2MaxCycling,
  };
}
