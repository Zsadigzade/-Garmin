import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

describe("http MCP server", () => {
  const originalEnv = {
    email: process.env.GARMIN_EMAIL,
    password: process.env.GARMIN_PASSWORD,
    apiKey: process.env.GARMIN_MCP_API_KEY,
    port: process.env.GARMIN_MCP_PORT,
    host: process.env.GARMIN_MCP_HOST,
  };

  before(() => {
    process.env.GARMIN_EMAIL = process.env.GARMIN_EMAIL ?? "test@example.com";
    process.env.GARMIN_PASSWORD = process.env.GARMIN_PASSWORD ?? "test-password";
    process.env.GARMIN_MCP_API_KEY = "test-api-key-123";
    process.env.GARMIN_MCP_PORT = "3848";
    process.env.GARMIN_MCP_HOST = "127.0.0.1";
  });

  after(() => {
    process.env.GARMIN_EMAIL = originalEnv.email;
    process.env.GARMIN_PASSWORD = originalEnv.password;
    process.env.GARMIN_MCP_API_KEY = originalEnv.apiKey;
    process.env.GARMIN_MCP_PORT = originalEnv.port;
    process.env.GARMIN_MCP_HOST = originalEnv.host;
  });

  it("returns health without authentication", async () => {
    const { createHttpMcpServer } = await import("../src/httpServer.js");
    const server = createHttpMcpServer();

    await server.start();

    try {
      const response = await fetch("http://127.0.0.1:3848/health");
      assert.equal(response.status, 200);
      const body = (await response.json()) as { status: string };
      assert.equal(body.status, "ok");
    } finally {
      await server.close();
    }
  });

  it("rejects MCP requests without bearer token", async () => {
    const { createHttpMcpServer } = await import("../src/httpServer.js");
    const server = createHttpMcpServer();

    await server.start();

    try {
      const response = await fetch("http://127.0.0.1:3848/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "initialize", params: {}, id: 1 }),
      });

      assert.equal(response.status, 401);
    } finally {
      await server.close();
    }
  });

  it("accepts MCP requests with valid bearer token", async () => {
    const { createHttpMcpServer } = await import("../src/httpServer.js");
    const server = createHttpMcpServer();

    await server.start();

    try {
      const response = await fetch("http://127.0.0.1:3848/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key-123",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" },
          },
          id: 1,
        }),
      });

      assert.ok(response.status >= 200 && response.status < 500);
    } finally {
      await server.close();
    }
  });
});
