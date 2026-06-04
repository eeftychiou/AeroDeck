import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

import { createOpenAI } from "@ai-sdk/openai";

const kimi = createOpenAI({
  baseURL: "https://api.moonshot.cn/v1",
  apiKey: process.env.KIMI_API_KEY,
});

const minimax = createOpenAI({
  baseURL: "https://api.minimax.chat/v1",
  apiKey: process.env.MINIMAX_API_KEY,
});

export async function routeTask(prompt: string, modelTier: string) {
  let model;
  if (modelTier === "fast") {
    model = minimax("minimax-text-01"); // Replace with exact model name if different
  } else if (modelTier === "smart") {
    model = kimi("moonshot-v1-auto"); // Replace with exact model name if different
  } else {
    model = kimi("moonshot-v1-8k"); // default fallback
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
