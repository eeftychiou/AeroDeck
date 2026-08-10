import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localEnvPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");
for (const envPath of [localEnvPath, rootEnvPath]) {
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
      if (!process.env[k]) {
        process.env[k] = envConfig[k];
      }
    }
  }
}
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { generateText } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const minimax = createOpenAI({
  baseURL: "https://api.minimaxi.chat/v1",
  apiKey: process.env.MINIMAX_API_KEY,
});

export async function routeTask(prompt: string, modelTier: string) {
  let model;
  if (modelTier === "fast" || modelTier === "minimax") {
    model = minimax("MiniMax-Text-01");
  } else if (modelTier === "deepseek" || modelTier === "smart") {
    model = deepseek("deepseek-chat");
  } else {
    model = deepseek("deepseek-chat"); // default fallback
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
