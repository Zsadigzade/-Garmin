import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { executeTool, toolRegistry, toolSchemas } from "./tools/index.js";
import { logger } from "./utils/logger.js";
import type { GarminApiError } from "./garmin/types.js";

// SECTION: MCP Server

export interface GarminMcpServer {
  start: () => Promise<void>;
  close: () => Promise<void>;
}

export function createMcpServer(): GarminMcpServer {
  const mcpServer = new McpServer({
    name: "garmin-mcp",
    version: "0.1.0",
  });

  for (const tool of toolRegistry) {
    const schema = toolSchemas[tool.name as keyof typeof toolSchemas];

    mcpServer.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: schema,
      },
      async (args: Record<string, unknown>) => {
        try {
          const result = await executeTool(tool.name, args);

          return {
            content: [
              {
                type: "text" as const,
                text: result.text,
              },
            ],
          };
        } catch (error) {
          logger.error({ error, tool: tool.name }, "Tool execution failed");

          const message = formatToolError(error);
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: message,
              },
            ],
          };
        }
      }
    );
  }

  let transport: StdioServerTransport | null = null;

  return {
    async start(): Promise<void> {
      transport = new StdioServerTransport();
      await mcpServer.connect(transport);
      logger.info("Garmin MCP server started on stdio transport");
    },
    async close(): Promise<void> {
      await mcpServer.close();
      transport = null;
    },
  };
}

function formatToolError(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as GarminApiError;

    if (apiError.statusCode === 429) {
      return `${error.message} Retry in ${apiError.retryAfterSeconds ?? 60} seconds.`;
    }

    if (error.message.toLowerCase().includes("authentication")) {
      return `${error.message} Run "garmin-mcp auth" to re-authenticate.`;
    }

    return error.message;
  }

  return "An unexpected error occurred while executing the Garmin tool.";
}
