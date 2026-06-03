import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export async function routeTask(prompt: string, modelTier: string) {
  // Stub implementation for now
  return `mock response for ${prompt} using ${modelTier} model`;
}

export function setupServer() {
  const server = new Server(
    { name: "model-router", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "route_task",
          description: "Route a task to a specified model tier",
          inputSchema: {
            type: "object",
            properties: {
              prompt: { type: "string" },
              modelTier: { type: "string" }
            },
            required: ["prompt", "modelTier"]
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "route_task") {
      const { prompt, modelTier } = request.params.arguments as any;
      const response = await routeTask(prompt, modelTier);
      return {
        content: [{ type: "text", text: response }]
      };
    }
    throw new Error(`Tool not found: ${request.params.name}`);
  });

  return server;
}
