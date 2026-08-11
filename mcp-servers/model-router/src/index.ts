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

// Map of custom OpenAI-compatible provider instances
const providerInstances: Record<string, ReturnType<typeof createOpenAI>> = {};

function getProviderModel(providerName: string, modelId: string) {
  const normProvider = (providerName || "").toLowerCase();
  
  if (normProvider === "anthropic") {
    return anthropic(modelId);
  }
  if (normProvider === "google") {
    return google(modelId);
  }
  if (normProvider === "openai" && !routerConfig?.providers?.openai?.baseURL) {
    return openai(modelId);
  }

  // Look up provider config in config.json
  const provConfig = routerConfig?.providers?.[normProvider] || {};
  const baseURL = provConfig.baseURL || "https://api.openai.com/v1";
  const apiKeyEnv = provConfig.apiKeyEnv || `${normProvider.toUpperCase()}_API_KEY`;
  const apiKey = process.env[apiKeyEnv] || process.env.OPENAI_API_KEY || "";

  if (!providerInstances[normProvider]) {
    providerInstances[normProvider] = createOpenAI({
      baseURL,
      apiKey,
    });
  }

  return providerInstances[normProvider](modelId);
}

export async function routeTask(prompt: string, modelTier: string = "smart", modelName?: string) {
  const targetTier = (modelTier || "").trim().toLowerCase();
  const explicitModel = (modelName || "").trim();
  let model: any = null;

  if (routerConfig && routerConfig.tiers && routerConfig.tiers[targetTier]) {
    const tierConfig = routerConfig.tiers[targetTier];
    const targetModel = explicitModel || tierConfig.model;
    const providerName = tierConfig.provider || "openai";
    model = getProviderModel(providerName, targetModel);
  }

  if (!model) {
    const target = (explicitModel || modelTier || "").trim();
    const lowerTarget = target.toLowerCase();

    if (lowerTarget.includes("minimax") || lowerTarget.startsWith("abab")) {
      const selectedModel = explicitModel || (lowerTarget === "minimax" || lowerTarget === "fast" ? (routerConfig?.tiers?.fast?.model || "minimax-M3") : target);
      model = getProviderModel("minimax", selectedModel);
    } else if (lowerTarget.includes("deepseek")) {
      const selectedModel = explicitModel || (lowerTarget === "deepseek" || lowerTarget === "smart" ? (routerConfig?.tiers?.smart?.model || "deepseek-v4-flash") : target);
      model = getProviderModel("deepseek", selectedModel);
    } else if (lowerTarget.includes("claude") || lowerTarget.includes("anthropic")) {
      const selectedModel = explicitModel || "claude-3-5-sonnet-20241022";
      model = getProviderModel("anthropic", selectedModel);
    } else if (lowerTarget.includes("gpt") || lowerTarget.includes("openai")) {
      const selectedModel = explicitModel || "gpt-4o-mini";
      model = getProviderModel("openai", selectedModel);
    } else if (lowerTarget === "fast") {
      const fastTier = routerConfig?.tiers?.fast;
      model = getProviderModel(fastTier?.provider || "minimax", explicitModel || fastTier?.model || "minimax-M3");
    } else {
      const defaultModel = explicitModel || target || routerConfig?.default_model || "deepseek-v4-flash";
      const smartTier = routerConfig?.tiers?.smart;
      model = getProviderModel(smartTier?.provider || "deepseek", defaultModel);
    }
  }

  try {
    const generateOptions: any = {
      model,
      prompt,
    };

    const modelId = String(model?.modelId || "").toLowerCase();
    if (modelId.includes("reasoner") || modelId.includes("o1") || modelId.includes("o3") || routerConfig?.tiers?.[targetTier]?.reasoningEffort === "high") {
      generateOptions.providerOptions = {
        openai: {
          reasoningEffort: "high",
        },
      };
    }

    const { text } = await generateText(generateOptions);
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
          description: "Route a task to a specified model tier or exact model name (e.g. deepseek-v4-flash, minimax-M3, gpt-4o, claude-3-5-sonnet)",
          inputSchema: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "Prompt or instruction to send to the model" },
              modelTier: { type: "string", description: "Model tier: 'fast', 'smart', 'reasoning', or provider name" },
              modelName: { type: "string", description: "Exact model ID, e.g., 'deepseek-v4-flash', 'minimax-M3', 'gpt-4o-mini'" }
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
