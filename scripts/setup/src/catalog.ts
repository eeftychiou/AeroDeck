import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  context_length?: number;
  description?: string;
}

export interface CatalogProvider {
  slug: string;
  name: string;
  tui_desc?: string;
  baseURL: string;
  apiKeyEnv: string;
  models: CatalogModel[];
}

export interface ModelCatalog {
  version?: string | number;
  updated_at?: string;
  providers: Record<string, CatalogProvider>;
}

export interface ProviderEntry {
  slug: string;
  label: string;
  tui_desc: string;
  defaultBaseURL: string;
  apiKeyEnv: string;
}

// Canonical Provider Registry ported from hermes_cli/models.py
export const CANONICAL_PROVIDERS: ProviderEntry[] = [
  { slug: "openrouter", label: "OpenRouter", tui_desc: "OpenRouter (Pay-per-use API aggregator)", defaultBaseURL: "https://openrouter.ai/api/v1", apiKeyEnv: "OPENROUTER_API_KEY" },
  { slug: "nous", label: "Nous Portal", tui_desc: "Nous Portal (300+ models with bundled tool use)", defaultBaseURL: "https://api.nousresearch.com/v1", apiKeyEnv: "NOUS_API_KEY" },
  { slug: "openai-api", label: "OpenAI API", tui_desc: "OpenAI API (api.openai.com)", defaultBaseURL: "https://api.openai.com/v1", apiKeyEnv: "OPENAI_API_KEY" },
  { slug: "anthropic", label: "Anthropic", tui_desc: "Anthropic (Claude models via API key)", defaultBaseURL: "https://api.anthropic.com/v1", apiKeyEnv: "ANTHROPIC_API_KEY" },
  { slug: "deepseek", label: "DeepSeek", tui_desc: "DeepSeek (V3, R1, coder, direct API)", defaultBaseURL: "https://api.deepseek.com", apiKeyEnv: "DEEPSEEK_API_KEY" },
  { slug: "minimax", label: "MiniMax", tui_desc: "MiniMax (Global direct API)", defaultBaseURL: "https://api.minimaxi.chat/v1", apiKeyEnv: "MINIMAX_API_KEY" },
  { slug: "moonshot", label: "Moonshot AI", tui_desc: "Moonshot AI (api.moonshot.cn direct API)", defaultBaseURL: "https://api.moonshot.cn/v1", apiKeyEnv: "MOONSHOT_API_KEY" },
  { slug: "kimi-coding", label: "Kimi Coding Plan", tui_desc: "Kimi Coding Plan (api.kimi.com global endpoint)", defaultBaseURL: "https://api.kimi.com/v1", apiKeyEnv: "KIMI_API_KEY" },
  { slug: "kimi-coding-cn", label: "Kimi / Moonshot China", tui_desc: "Kimi / Moonshot China (domestic direct API)", defaultBaseURL: "https://api.moonshot.cn/v1", apiKeyEnv: "KIMI_CN_API_KEY" },
  { slug: "gemini", label: "Google AI Studio", tui_desc: "Google AI Studio (Native Gemini API)", defaultBaseURL: "https://generativelanguage.googleapis.com/v1beta", apiKeyEnv: "GEMINI_API_KEY" },
  { slug: "groq", label: "Groq", tui_desc: "Groq (Ultra-fast LPU inference)", defaultBaseURL: "https://api.groq.com/openai/v1", apiKeyEnv: "GROQ_API_KEY" },
  { slug: "together", label: "Together AI", tui_desc: "Together AI (Open model inference)", defaultBaseURL: "https://api.together.xyz/v1", apiKeyEnv: "TOGETHER_API_KEY" },
  { slug: "ollama", label: "Ollama (Local)", tui_desc: "Ollama (Local desktop model server)", defaultBaseURL: "http://localhost:11434/v1", apiKeyEnv: "OLLAMA_API_KEY" },
  { slug: "lmstudio", label: "LM Studio (Local)", tui_desc: "LM Studio (Local model server)", defaultBaseURL: "http://localhost:1234/v1", apiKeyEnv: "LMSTUDIO_API_KEY" },
  { slug: "bedrock", label: "AWS Bedrock", tui_desc: "AWS Bedrock (Claude, Nova, Llama)", defaultBaseURL: "https://bedrock-runtime.us-east-1.amazonaws.com", apiKeyEnv: "AWS_SECRET_ACCESS_KEY" },
  { slug: "azure-foundry", label: "Azure Foundry", tui_desc: "Azure AI deployment endpoint", defaultBaseURL: "https://your-resource.openai.azure.com", apiKeyEnv: "AZURE_OPENAI_API_KEY" },
  { slug: "custom", label: "Custom Endpoint", tui_desc: "Custom OpenAI-compatible or local endpoint", defaultBaseURL: "http://localhost:8000/v1", apiKeyEnv: "CUSTOM_API_KEY" }
];

export function getProviderDisplayName(key: string, providerObj?: any): string {
  const match = CANONICAL_PROVIDERS.find(p => p.slug === key);
  if (match) return match.label;
  if (!providerObj) return capitalize(key);
  const rawName = providerObj.metadata?.display_name || providerObj.name || providerObj.title;
  return (rawName && typeof rawName === "string" && rawName.trim().length > 0)
    ? rawName.trim()
    : capitalize(key);
}

export function getModelDisplayName(modelObj: any): string {
  if (!modelObj) return "Unknown Model";
  if (typeof modelObj === "string") return modelObj;

  if (modelObj.name && typeof modelObj.name === "string" && modelObj.name.trim().length > 0) {
    return modelObj.name.trim();
  }
  if (modelObj.display_name && typeof modelObj.display_name === "string" && modelObj.display_name.trim().length > 0) {
    return modelObj.display_name.trim();
  }
  if (modelObj.title && typeof modelObj.title === "string" && modelObj.title.trim().length > 0) {
    return modelObj.title.trim();
  }
  if (modelObj.id && typeof modelObj.id === "string") {
    const parts = modelObj.id.split("/");
    if (parts.length === 2) {
      return `${parts[1]} (${parts[0]})`;
    }
    return modelObj.id;
  }
  return "Unnamed Model";
}

export function getProviderApiKeyEnv(key: string, providerObj?: any): string {
  const match = CANONICAL_PROVIDERS.find(p => p.slug === key);
  if (match) return match.apiKeyEnv;
  if (providerObj?.apiKeyEnv && typeof providerObj.apiKeyEnv === "string") {
    return providerObj.apiKeyEnv;
  }
  const cleanKey = key.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return `${cleanKey}_API_KEY`;
}

/**
 * Dynamically queries ${baseURL}/models for live model lists (e.g. OpenAI/Ollama/vLLM compatible)
 */
export async function fetchLiveModels(baseURL: string, apiKey?: string): Promise<CatalogModel[]> {
  if (!baseURL) return [];
  const cleanBase = baseURL.replace(/\/+$/, "");
  const modelsUrl = `${cleanBase}/models`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const headers: Record<string, string> = { "Accept": "application/json" };
    if (apiKey && apiKey !== "ollama" && apiKey !== "none") {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(modelsUrl, { headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const models: CatalogModel[] = [];

      for (const item of rawList) {
        const id = typeof item === "string" ? item : item?.id;
        if (id && typeof id === "string") {
          models.push({
            id,
            name: getModelDisplayName(item),
            provider: "live",
            description: item?.description || "Live endpoint model"
          });
        }
      }
      return models;
    }
  } catch (err) {
    // Fail silently, fallback to catalog or manual entry
  }
  return [];
}

export function normalizeCatalog(rawCatalog: any): ModelCatalog {
  const normalized: ModelCatalog = {
    version: rawCatalog?.version || "1.0.0",
    updated_at: rawCatalog?.updated_at || new Date().toISOString(),
    providers: {}
  };

  const rawProviders = rawCatalog?.providers || {};
  for (const key of Object.keys(rawProviders)) {
    const rawProv = rawProviders[key];
    const displayName = getProviderDisplayName(key, rawProv);
    const apiKeyEnv = getProviderApiKeyEnv(key, rawProv);
    const match = CANONICAL_PROVIDERS.find(p => p.slug === key);
    const baseURL = rawProv.baseURL || match?.defaultBaseURL || "https://api.openai.com/v1";

    const models: CatalogModel[] = [];
    const rawModelsList = Array.isArray(rawProv.models) ? rawProv.models : [];

    for (const rawM of rawModelsList) {
      const modelId = typeof rawM === "string" ? rawM : (rawM.id || "");
      if (!modelId) continue;

      models.push({
        id: modelId,
        name: getModelDisplayName(rawM),
        provider: key,
        context_length: typeof rawM === "object" ? rawM.context_length : undefined,
        description: typeof rawM === "object" ? rawM.description : undefined
      });
    }

    normalized.providers[key] = {
      slug: key,
      name: displayName,
      baseURL,
      apiKeyEnv,
      models
    };
  }

  return normalized;
}

export async function fetchModelCatalog(): Promise<ModelCatalog> {
  const catalogUrl = "https://nousresearch.github.io/hermes-agent/docs/api/model-catalog.json";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(catalogUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === "object" && data.providers) {
        return normalizeCatalog(data);
      }
    }
  } catch (err) {
    // Fall back silently
  }

  const localCatalogPath = path.resolve(__dirname, "../model-catalog.json");
  if (fs.existsSync(localCatalogPath)) {
    const localContent = fs.readFileSync(localCatalogPath, "utf-8");
    return normalizeCatalog(JSON.parse(localContent));
  }

  const fallbackPath = path.resolve(__dirname, "../../model-catalog.json");
  if (fs.existsSync(fallbackPath)) {
    const fallbackContent = fs.readFileSync(fallbackPath, "utf-8");
    return normalizeCatalog(JSON.parse(fallbackContent));
  }

  throw new Error("Unable to load model catalog from online URL or local fallback snapshot.");
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
