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
  name: string;
  baseURL: string;
  apiKeyEnv: string;
  models: CatalogModel[];
}

export interface ModelCatalog {
  version?: string | number;
  updated_at?: string;
  providers: Record<string, CatalogProvider>;
}

const DEFAULT_BASE_URLS: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  deepseek: "https://api.deepseek.com",
  minimax: "https://api.minimaxi.chat/v1",
  kimi: "https://api.moonshot.cn/v1",
  moonshot: "https://api.moonshot.cn/v1",
  groq: "https://api.groq.com/openai/v1",
  together: "https://api.together.xyz/v1",
  ollama: "http://localhost:11434/v1",
  nous: "https://api.nousresearch.com/v1"
};

export function getProviderDisplayName(key: string, providerObj: any): string {
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

export function getProviderApiKeyEnv(key: string, providerObj: any): string {
  if (providerObj?.apiKeyEnv && typeof providerObj.apiKeyEnv === "string") {
    return providerObj.apiKeyEnv;
  }
  const cleanKey = key.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return `${cleanKey}_API_KEY`;
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
    const baseURL = rawProv.baseURL || DEFAULT_BASE_URLS[key.toLowerCase()] || "https://api.openai.com/v1";

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
    // Fall back silently to offline model-catalog.json
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
