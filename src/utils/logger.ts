import fs from "node:fs";
import path from "node:path";
import pino from "pino";
import { appConfig } from "../config.js";

function ensureLogDirectory(): void {
  const directory = path.dirname(appConfig.logPath);
  fs.mkdirSync(directory, { recursive: true });
}

ensureLogDirectory();

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
  },
  pino.multistream([
    {
      stream: pino.destination({
        dest: appConfig.logPath,
        sync: false,
        mkdir: true,
      }),
    },
    {
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      }),
    },
  ])
);
