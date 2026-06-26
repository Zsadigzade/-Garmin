import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMcpServer } from "../src/server.js";
import { toolRegistry } from "../src/tools/index.js";

describe("integration", () => {
  it("creates an MCP server with all registered tools", () => {
    const server = createMcpServer();
    assert.equal(typeof server.start, "function");
    assert.equal(typeof server.close, "function");
    assert.equal(toolRegistry.length, 6);
  });
});
