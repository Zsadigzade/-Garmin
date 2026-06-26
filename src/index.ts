#!/usr/bin/env node

import { createCliProgram } from "./cli.js";

async function main(): Promise<void> {
  const program = createCliProgram();
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
