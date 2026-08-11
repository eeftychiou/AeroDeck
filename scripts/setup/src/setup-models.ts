import prompts from "prompts";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchModelCatalog, fetchLiveModels, CANONICAL_PROVIDERS, CatalogModel } from "./catalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../");

export interface ModelProfileConfig {
  provider: string;
  model: string;
  baseURL: string;
  apiKeyEnv: string;
  reasoningEffort: string;
}

export async function setupModels() {
  console.log(chalk.bold.cyan("\n=== AeroDeck Interactive Model & Provider Configuration ===\n"));

  let catalog;
  try {
    catalog = await fetchModelCatalog();
  } catch (err: any) {
    catalog = { providers: {} };
  }

  const routerDir = path.join(rootDir, "mcp-servers/model-router");
  const routerEnvPath = path.join(routerDir, ".env");
  const configPath = path.join(routerDir, "config.json");

  // Load existing env secrets
  const existingEnv: Record<string, string> = {};
  if (fs.existsSync(routerEnvPath)) {
    const lines = fs.readFileSync(routerEnvPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9_]+)="?([^"\n]+)"?/);
      if (match) {
        existingEnv[match[1]] = match[2];
      }
    }
  }

  // Load existing config.json
  let existingConfig: any = { default_model: "", tiers: {}, providers: {} };
  if (fs.existsSync(configPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {
      // ignore
    }
  }

  const configuredProviders: Record<string, any> = { ...existingConfig.providers };
  const configuredTiers: Record<string, any> = { ...existingConfig.tiers };
  const newEnvVars: Record<string, string> = { ...existingEnv };

  let keepConfiguring = true;
  let modelCount = 0;

  while (keepConfiguring) {
    modelCount++;
    console.log(chalk.bold.yellow(`\n--- Configuring Model #${modelCount} ---`));

    // 1. Select Provider
    const providerChoices = CANONICAL_PROVIDERS.map((p) => ({
      title: `${p.label} - ${p.tui_desc}`,
      value: p.slug
    }));

    const providerAns = await prompts({
      type: "select",
      name: "providerSlug",
      message: "Select AI Provider or Custom Endpoint:",
      choices: providerChoices
    });

    const selectedSlug = providerAns.providerSlug || "openrouter";
    const canonicalInfo = CANONICAL_PROVIDERS.find(p => p.slug === selectedSlug);

    let providerName = canonicalInfo?.label || selectedSlug;
    let apiKeyEnv = canonicalInfo?.apiKeyEnv || `${selectedSlug.toUpperCase()}_API_KEY`;
    let baseURL = canonicalInfo?.defaultBaseURL || "https://api.openai.com/v1";

    // If Custom Endpoint, prompt for custom provider details
    if (selectedSlug === "custom") {
      const customNameAns = await prompts({
        type: "text",
        name: "customName",
        message: "Enter custom provider display name:",
        initial: "Custom Local LLM"
      });
      providerName = customNameAns.customName || "Custom Local LLM";

      const customBaseAns = await prompts({
        type: "text",
        name: "baseURL",
        message: "Enter API Base URL (OpenAI compatible):",
        initial: "http://localhost:8000/v1"
      });
      baseURL = customBaseAns.baseURL || "http://localhost:8000/v1";

      const customEnvAns = await prompts({
        type: "text",
        name: "apiKeyEnv",
        message: "Enter environment key name for API key:",
        initial: "CUSTOM_API_KEY"
      });
      apiKeyEnv = customEnvAns.apiKeyEnv || "CUSTOM_API_KEY";
    } else {
      const urlAns = await prompts({
        type: "text",
        name: "baseURL",
        message: `Confirm Base URL for ${providerName}:`,
        initial: baseURL
      });
      baseURL = urlAns.baseURL || baseURL;
    }

    // 2. Prompt for API key if needed
    let apiKey = existingEnv[apiKeyEnv] || "";
    if (selectedSlug !== "ollama" && selectedSlug !== "lmstudio") {
      const keyAns = await prompts({
        type: "password",
        name: "apiKey",
        message: `Enter API key for ${providerName} (${apiKeyEnv}):`,
        initial: apiKey
      });
      apiKey = keyAns.apiKey || apiKey;
      if (apiKey) {
        newEnvVars[apiKeyEnv] = apiKey;
      }
    } else {
      newEnvVars[apiKeyEnv] = newEnvVars[apiKeyEnv] || "none";
    }

    // 3. Dynamic Model Retrieval from Base URL (${baseURL}/models) & Catalog
    console.log(chalk.yellow(`Querying ${baseURL}/models for live models...`));
    let availableModels: CatalogModel[] = await fetchLiveModels(baseURL, apiKey);

    if (availableModels.length > 0) {
      console.log(chalk.green(`✔ Dynamically retrieved ${availableModels.length} live models from endpoint`));
    } else {
      // Fallback to static catalog
      const catProv = catalog.providers[selectedSlug];
      if (catProv && catProv.models && catProv.models.length > 0) {
        availableModels = catProv.models;
      }
    }

    let selectedModelId = "";
    const modelChoices = availableModels.map(m => ({
      title: `${m.name} (${m.id})`,
      value: m.id
    }));
    modelChoices.push({ title: "+ Enter custom model ID manually", value: "__manual__" });

    const modelAns = await prompts({
      type: "select",
      name: "modelId",
      message: `Select model for ${providerName}:`,
      choices: modelChoices
    });

    if (!modelAns.modelId || modelAns.modelId === "__manual__") {
      const manualAns = await prompts({
        type: "text",
        name: "manualModelId",
        message: "Enter exact Model ID string:"
      });
      selectedModelId = manualAns.manualModelId || "default-model";
    } else {
      selectedModelId = modelAns.modelId;
    }

    // 4. Select Reasoning Effort
    const reasoningAns = await prompts({
      type: "select",
      name: "effort",
      message: `Select Reasoning Effort for ${selectedModelId}:`,
      choices: [
        { title: "none (Standard response generation)", value: "none" },
        { title: "low (Minimal reasoning overhead)", value: "low" },
        { title: "medium (Balanced thinking effort)", value: "medium" },
        { title: "high (Deep analytical reasoning)", value: "high" }
      ]
    });

    const reasoningEffort = reasoningAns.effort || "medium";

    // 5. Assign to Profiles / Tiers
    const profileAns = await prompts({
      type: "multiselect",
      name: "profiles",
      message: `Assign ${selectedModelId} to target profile(s):`,
      choices: [
        { title: "default (General fallback model)", value: "default", selected: modelCount === 1 },
        { title: "fast (High-speed lightweight tasks)", value: "fast", selected: modelCount === 1 },
        { title: "smart (Complex reasoning & coding)", value: "smart", selected: modelCount === 1 },
        { title: "reasoning (Deep reasoning tasks)", value: "reasoning", selected: reasoningEffort === "high" }
      ]
    });

    const chosenProfiles: string[] = profileAns.profiles || ["default"];

    // Register provider details in config
    configuredProviders[selectedSlug] = {
      name: providerName,
      baseURL,
      apiKeyEnv,
      defaultModel: selectedModelId
    };

    // Update profiles/tiers
    for (const p of chosenProfiles) {
      if (p === "default") {
        existingConfig.default_model = selectedModelId;
      }
      configuredTiers[p] = {
        provider: selectedSlug,
        model: selectedModelId,
        baseURL,
        reasoningEffort
      };
    }

    console.log(chalk.green(`✔ Configured model ${chalk.bold(selectedModelId)} [Provider: ${providerName}, Reasoning: ${reasoningEffort}]`));

    // 6. Loop prompt: configure another model?
    const nextAns = await prompts({
      type: "confirm",
      name: "continue",
      message: "Would you like to configure another model or provider?",
      initial: false
    });

    keepConfiguring = !!nextAns.continue;
  }

  // Save final config.json
  const finalConfig = {
    default_model: existingConfig.default_model || "deepseek-v4-flash",
    tiers: configuredTiers,
    providers: configuredProviders
  };

  fs.writeFileSync(configPath, JSON.stringify(finalConfig, null, 2));
  console.log(chalk.green("\n✔ Saved mcp-servers/model-router/config.json"));

  // Save final .env
  let envStr = "";
  for (const [k, v] of Object.entries(newEnvVars)) {
    if (v) {
      envStr += `${k}="${v}"\n`;
    }
  }
  fs.writeFileSync(routerEnvPath, envStr);
  console.log(chalk.green("✔ Saved mcp-servers/model-router/.env"));
  console.log(chalk.bold.green("✔ Model & Provider configuration complete!\n"));
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  setupModels().catch(console.error);
}
