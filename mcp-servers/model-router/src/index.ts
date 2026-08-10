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

const configPath = path.resolve(__dirname, "../config.json");
let routerConfig: any = null;
if (fs.existsSync(configPath)) {
  try {
    routerConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    console.error("Failed to parse config.json:", e);
  }
}

const deepseekBaseURL = routerConfig?.providers?.deepseek?.baseURL || "https://api.deepseek.com";
const minimaxBaseURL = routerConfig?.providers?.minimax?.baseURL || "https://api.minimaxi.chat/v1";

const deepseek = createOpenAI({
  baseURL: deepseekBaseURL,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const minimax = createOpenAI({
  baseURL: minimaxBaseURL,
  apiKey: process.env.MINIMAX_API_KEY,
});

export async function routeTask(prompt: string, modelTier: string = "smart", modelName?: string) {
  const targetTier = (modelTier || "").trim().toLowerCase();
  const explicitModel = (modelName || "").trim();
  let model;

  if (routerConfig && routerConfig.tiers && routerConfig.tiers[targetTier]) {
    const tierConfig = routerConfig.tiers[targetTier];
    const targetModel = explicitModel || tierConfig.model;
    if (tierConfig.provider === "minimax") {
      model = minimax(targetModel);
    } else if (tierConfig.provider === "deepseek") {
      model = deepseek(targetModel);
    }
  }

  if (!model) {
    const target = (explicitModel || modelTier || "").trim();
    const lowerTarget = target.toLowerCase();

    if (lowerTarget.includes("minimax") || lowerTarget.startsWith("abab")) {
      const selectedModel = explicitModel || (lowerTarget === "minimax" || lowerTarget === "fast" ? (routerConfig?.tiers?.fast?.model || "MiniMax-Text-01") : target);
      model = minimax(selectedModel);
    } else if (lowerTarget.includes("deepseek")) {
      const selectedModel = explicitModel || (lowerTarget === "deepseek" || lowerTarget === "smart" ? (routerConfig?.tiers?.smart?.model || "deepseek-chat") : target);
      model = deepseek(selectedModel);
    } else if (lowerTarget === "fast") {
      model = minimax(explicitModel || routerConfig?.tiers?.fast?.model || "MiniMax-Text-01");
    } else {
      model = deepseek(explicitModel || target || routerConfig?.default_model || "deepseek-chat");
    }
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
          description: "Route a task to a specified model tier or exact model name (e.g. deepseek-chat, deepseek-reasoner, MiniMax-Text-01, minimax-M3)",
          inputSchema: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "Prompt or instruction to send to the model" },
              modelTier: { type: "string", description: "Model tier: 'fast', 'smart', 'deepseek', 'minimax'" },
              modelName: { type: "string", description: "Exact model ID, e.g., 'deepseek-chat', 'deepseek-reasoner', 'MiniMax-Text-01', 'minimax-M3'" }
            },
            required: ["prompt"]
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "route_task") {
      const { prompt, modelTier, modelName } = request.params.arguments as any;
      const response = await routeTask(prompt, modelTier, modelName);
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
