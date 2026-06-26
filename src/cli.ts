import { Command } from "commander";
import { authenticateGarmin, clearStoredSession, sessionExists } from "./garmin/auth.js";
import { getCache } from "./garmin/cache.js";
import { resetGarminClient } from "./garmin/client.js";
import { createMcpServer } from "./server.js";
import { logger } from "./utils/logger.js";

// SECTION: CLI Commands

async function runStart(): Promise<void> {
  const server = createMcpServer();
  await server.start();
}

async function runAuth(): Promise<void> {
  clearStoredSession();
  resetGarminClient();
  await authenticateGarmin(true);
  console.log("Garmin authentication successful. Session saved.");
}

async function runCacheClear(): Promise<void> {
  const cache = getCache();
  const removed = cache.clear();
  console.log(`Cleared ${removed} cache entries.`);
}

async function runStatus(): Promise<void> {
  const cache = getCache();
  const cacheStats = cache.stats();

  console.log("Garmin MCP status");
  console.log(`Session: ${sessionExists() ? "present" : "missing"}`);
  console.log(`Cache entries: ${cacheStats.entries}`);
  console.log(`Expired cache entries: ${cacheStats.expiredEntries}`);
}

export function createCliProgram(): Command {
  const program = new Command();

  program
    .name("garmin-mcp")
    .description("MCP server for Garmin Connect fitness data")
    .version("0.1.0");

  program
    .command("start")
    .description("Start the MCP server using stdio transport")
    .action(async () => {
      try {
        await runStart();
      } catch (error) {
        logger.error({ error }, "Failed to start MCP server");
        process.exitCode = 1;
      }
    });

  program
    .command("auth")
    .description("Force Garmin re-authentication")
    .action(async () => {
      try {
        await runAuth();
      } catch (error) {
        logger.error({ error }, "Garmin authentication failed");
        console.error(error instanceof Error ? error.message : "Authentication failed");
        process.exitCode = 1;
      }
    });

  const cacheCommand = program.command("cache").description("Manage local cache");

  cacheCommand
    .command("clear")
    .description("Clear all cached Garmin data")
    .action(async () => {
      try {
        await runCacheClear();
      } catch (error) {
        logger.error({ error }, "Failed to clear cache");
        process.exitCode = 1;
      }
    });

  program
    .command("status")
    .description("Show session and cache status")
    .action(async () => {
      try {
        await runStatus();
      } catch (error) {
        logger.error({ error }, "Failed to read status");
        process.exitCode = 1;
      }
    });

  return program;
}
