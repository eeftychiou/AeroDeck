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
  baseURL?: string;
  apiKeyEnv: string;
  models: CatalogModel[];
}

export interface ModelCatalog {
  version?: string;
  updated_at?: string;
  providers: Record<string, CatalogProvider>;
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
        return data as ModelCatalog;
      }
    }
  } catch (err) {
    // Fall back silently to offline model-catalog.json
  }

  const localCatalogPath = path.resolve(__dirname, "../model-catalog.json");
  if (fs.existsSync(localCatalogPath)) {
    const localContent = fs.readFileSync(localCatalogPath, "utf-8");
    return JSON.parse(localContent) as ModelCatalog;
  }

  // Final fallback if path resolved differently during ts execution
  const fallbackPath = path.resolve(__dirname, "../../model-catalog.json");
  if (fs.existsSync(fallbackPath)) {
    const fallbackContent = fs.readFileSync(fallbackPath, "utf-8");
    return JSON.parse(fallbackContent) as ModelCatalog;
  }

  throw new Error("Unable to load model catalog from online URL or local fallback snapshot.");
}
