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
import { getSessionHistory, appendSessionTurn, clearSession } from "./session.js";

const configPath = path.resolve(__dirname, "../config.json");
let routerConfig: any = null;
if (fs.existsSync(configPath)) {
  try {
    routerConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    console.error("Failed to parse config.json:", e);
  }
}

const providerInstances: Record<string, ReturnType<typeof createOpenAI>> = {};

function getProviderModel(providerName: string, modelId: string, customBaseURL?: string) {
  const normProvider = (providerName || "").toLowerCase();

  if (normProvider === "anthropic" && !customBaseURL) {
    return anthropic(modelId);
  }
  if (normProvider === "gemini" && !customBaseURL) {
    return google(modelId);
  }
  if (normProvider === "openai" && !customBaseURL && !routerConfig?.providers?.openai?.baseURL) {
    return openai(modelId);
  }

  const provConfig = routerConfig?.providers?.[normProvider] || {};
  const baseURL = customBaseURL || provConfig.baseURL || "https://api.openai.com/v1";
  const apiKeyEnv = provConfig.apiKeyEnv || `${normProvider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_KEY`;
  const apiKey = process.env[apiKeyEnv] || process.env.OPENAI_API_KEY || "none";

  const instanceKey = `${normProvider}_${baseURL}`;
  if (!providerInstances[instanceKey]) {
    providerInstances[instanceKey] = createOpenAI({
      baseURL,
      apiKey,
    });
  }

  return providerInstances[instanceKey](modelId);
}

export async function routeTask(
  prompt: string,
  modelTier: string = "smart",
  modelName?: string,
  sessionId?: string,
  newSession?: boolean,
  reasoningEffort?: string
) {
  const targetTier = (modelTier || "default").trim().toLowerCase();
  const explicitModel = (modelName || "").trim();
  let targetReasoningEffort = reasoningEffort || "";

  if (sessionId && newSession) {
    clearSession(sessionId);
  }

  interface Candidate {
    provider: string;
    model: string;
    baseURL?: string;
    reasoningEffort?: string;
  }

  const candidates: Candidate[] = [];

  // 1. First check if modelTier matches a configured tier profile (e.g. fast, smart, reasoning, default)
  if (routerConfig && routerConfig.tiers && routerConfig.tiers[targetTier]) {
    const tierConfig = routerConfig.tiers[targetTier];
    candidates.push({
      provider: tierConfig.provider || "openai",
      model: explicitModel || tierConfig.model,
      baseURL: tierConfig.baseURL,
      reasoningEffort: targetReasoningEffort || tierConfig.reasoningEffort || "medium",
    });
    if (tierConfig.fallbacks && Array.isArray(tierConfig.fallbacks)) {
      for (const fb of tierConfig.fallbacks) {
        candidates.push({
          provider: fb.provider,
          model: fb.model,
          baseURL: fb.baseURL,
          reasoningEffort: fb.reasoningEffort || targetReasoningEffort || "medium",
        });
      }
    }
  }
  // 2. Next check if modelTier matches a known provider slug directly (e.g. minimax, deepseek, openrouter)
  else if (routerConfig && routerConfig.providers && routerConfig.providers[targetTier]) {
    const provConfig = routerConfig.providers[targetTier];
    candidates.push({
      provider: targetTier,
      model: explicitModel || provConfig.defaultModel || "default",
      baseURL: provConfig.baseURL,
      reasoningEffort: targetReasoningEffort || "medium",
    });
  }
  // 3. Fallback: if explicit model ID passed, or smart tier fallback
  else {
    const defaultModel = explicitModel || targetTier || routerConfig?.default_model || "deepseek-v4-flash";
    const smartTier = routerConfig?.tiers?.smart;
    candidates.push({
      provider: smartTier?.provider || "deepseek",
      model: defaultModel,
      baseURL: smartTier?.baseURL,
      reasoningEffort: targetReasoningEffort || "medium",
    });
  }

  // Retrieve session context if session_id provided
  let fullPrompt = prompt;
  if (sessionId) {
    const history = getSessionHistory(sessionId);
    if (history.length > 0) {
      const historyStr = history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      fullPrompt = `[Previous Conversation History]\n${historyStr}\n\nUSER: ${prompt}`;
    }
  }

  let lastError: any = null;
  for (const cand of candidates) {
    try {
      const model = getProviderModel(cand.provider, cand.model, cand.baseURL);
      const generateOptions: any = {
        model,
        prompt: fullPrompt,
      };

      const effort = (cand.reasoningEffort || "").toLowerCase();
      if (effort === "high" || effort === "medium" || effort === "low") {
        generateOptions.providerOptions = {
          openai: {
            reasoningEffort: effort,
          },
        };
      }

      const { text } = await generateText(generateOptions);

      if (sessionId && text) {
        appendSessionTurn(sessionId, prompt, text);
      }

      return text;
    } catch (error: any) {
      console.error(`Provider '${cand.provider}' model '${cand.model}' failed: ${error.message}. Trying fallback...`);
      lastError = error;
    }
  }

  return `Error routing task: ${lastError?.message || "All fallback candidates failed"}`;
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
          description: "Route a task to a specified model profile or model with session context support",
          inputSchema: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "Prompt or instruction to send to the model" },
              session_id: { type: "string", description: "Optional session thread ID for conversation context" },
              new_session: { type: "boolean", description: "Set true to reset session history" },
              modelTier: { type: "string", description: "Profile: 'default', 'fast', 'smart', 'reasoning' or provider slug" },
              modelName: { type: "string", description: "Explicit model ID, e.g., 'gpt-4o', 'deepseek-v4-flash'" },
              reasoningEffort: { type: "string", description: "Reasoning effort: 'none', 'low', 'medium', 'high'" }
            },
            required: ["prompt"]
          }
        },
        {
          name: "clear_session",
          description: "Clear conversation history for a specific session ID",
          inputSchema: {
            type: "object",
            properties: {
              session_id: { type: "string", description: "Session ID to clear" }
            },
            required: ["session_id"]
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "route_task") {
      const { prompt, modelTier, modelName, session_id, new_session, reasoningEffort } = request.params.arguments as any;
      const response = await routeTask(prompt, modelTier, modelName, session_id, new_session, reasoningEffort);
      return {
        content: [{ type: "text", text: response }]
      };
    }
    if (request.params.name === "clear_session") {
      const { session_id } = request.params.arguments as any;
      const cleared = clearSession(session_id);
      return {
        content: [{ type: "text", text: cleared ? `Session '${session_id}' cleared.` : `Session '${session_id}' not found.` }]
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
