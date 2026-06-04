import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export async function routeTask(prompt: string, modelTier: string) {
  let model;
  if (modelTier === "fast") {
    model = google("models/gemini-1.5-flash");
  } else if (modelTier === "smart") {
    model = openai("gpt-4o");
  } else {
    model = anthropic("claude-3-5-sonnet-20241022"); // default fallback
  }

  try {
    const { text } = await generateText({
      model,
      prompt,
    });
    return text;
  } catch (error: any) {
    return `Error routing task: ${error.message}`;
  }
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

import { fileURLToPath } from "url";

async function run() {
  const server = setupServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Model Router MCP server running on stdio");
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
