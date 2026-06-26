import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

interface GarminConnectModule {
  GarminConnect: new (credentials?: { username: string; password: string }) => GarminConnectInstance;
}

export interface GarminConnectInstance {
  login: (username?: string, password?: string) => Promise<GarminConnectInstance>;
  loadToken: (oauth1: unknown, oauth2: unknown) => void;
  exportToken: () => { oauth1: unknown; oauth2: unknown };
  getUserProfile: () => Promise<unknown>;
  getActivities: (start?: number, limit?: number) => Promise<unknown[]>;
  getSleepData: (date?: Date) => Promise<unknown>;
  getHeartRate: (date?: Date) => Promise<unknown>;
  getDailyWeightData: (date?: Date) => Promise<unknown>;
}

const moduleRef = require("garmin-connect") as GarminConnectModule;

export const GarminConnect = moduleRef.GarminConnect;
