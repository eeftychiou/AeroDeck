import prompts from "prompts";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchModelCatalog, CatalogProvider } from "./catalog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../");

export async function setupModels() {
  console.log(chalk.bold.cyan("\n=== AeroDeck Model & Provider Configuration ===\n"));

  console.log(chalk.yellow("Fetching Hermes Model Catalog..."));
  let catalog;
  try {
    catalog = await fetchModelCatalog();
    console.log(chalk.green(`✔ Loaded model catalog (${Object.keys(catalog.providers).length} providers available)`));
  } catch (err: any) {
    console.log(chalk.red(`✖ Failed to load catalog: ${err.message}`));
    return;
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
  let existingConfig: any = { tiers: {}, providers: {} };
  if (fs.existsSync(configPath)) {
    try {
      existingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {
      // ignore
    }
  }

  const providerKeys = Object.keys(catalog.providers);
  const providerChoices = providerKeys.map((key) => {
    const prov = catalog.providers[key];
    const displayName = prov?.name || key;
    const modelCount = prov?.models?.length || 0;
    return {
      title: `${displayName} (${modelCount} models)`,
      value: key,
      selected: ["openrouter", "deepseek", "minimax", "openai", "anthropic"].includes(key)
    };
  });

  const selectedProvidersAnswer = await prompts({
    type: "multiselect",
    name: "providers",
    message: "Select AI Providers you want to configure:",
    choices: providerChoices,
    hint: "- Space to select. Return to submit"
  });

  const selectedProviderKeys: string[] = selectedProvidersAnswer.providers || [];
  if (selectedProviderKeys.length === 0) {
    console.log(chalk.yellow("⚠ No providers selected. Skipping model router configuration."));
    return;
  }

  // Collect API keys for selected providers
  const newEnvVars: Record<string, string> = { ...existingEnv };
  const configuredProvidersConfig: Record<string, any> = { ...existingConfig.providers };

  for (const provKey of selectedProviderKeys) {
    const provInfo: CatalogProvider = catalog.providers[provKey];
    const displayName = provInfo?.name || provKey;
    const apiKeyEnv = provInfo?.apiKeyEnv || `${provKey.toUpperCase()}_API_KEY`;

    configuredProvidersConfig[provKey] = {
      baseURL: provInfo.baseURL,
      apiKeyEnv: apiKeyEnv,
      defaultModel: provInfo.models[0]?.id || ""
    };

    if (provKey === "ollama") {
      newEnvVars[apiKeyEnv] = newEnvVars[apiKeyEnv] || "ollama";
      continue;
    }

    const keyAnswer = await prompts({
      type: "password",
      name: "apiKey",
      message: `Enter API key for ${chalk.bold(displayName)} (${apiKeyEnv}):`,
      initial: existingEnv[apiKeyEnv] || ""
    });

    if (keyAnswer.apiKey) {
      newEnvVars[apiKeyEnv] = keyAnswer.apiKey;
      console.log(chalk.green(`✔ Saved ${apiKeyEnv}`));
    }
  }

  // Build model choices from selected providers
  const availableModelChoices: { title: string; value: { provider: string; model: string } }[] = [];
  for (const provKey of selectedProviderKeys) {
    const provInfo = catalog.providers[provKey];
    const provDisplayName = provInfo?.name || provKey;
    for (const m of provInfo.models) {
      const modelDisplayName = m.name || m.id;
      availableModelChoices.push({
        title: `${modelDisplayName} [${provDisplayName}] (${m.id})`,
        value: { provider: provKey, model: m.id }
      });
    }
  }

  if (availableModelChoices.length > 0) {
    const defaultModelAns = await prompts({
      type: "select",
      name: "selection",
      message: "Select Default Model for tasks:",
      choices: availableModelChoices.map((c) => ({ title: c.title, value: c.value }))
    });

    const fastModelAns = await prompts({
      type: "select",
      name: "selection",
      message: "Select Fast Tier Model (quick execution):",
      choices: availableModelChoices.map((c) => ({ title: c.title, value: c.value }))
    });

    const smartModelAns = await prompts({
      type: "select",
      name: "selection",
      message: "Select Smart Tier Model (complex reasoning & coding):",
      choices: availableModelChoices.map((c) => ({ title: c.title, value: c.value }))
    });

    const defaultModelVal = defaultModelAns.selection || availableModelChoices[0].value;
    const fastModelVal = fastModelAns.selection || availableModelChoices[0].value;
    const smartModelVal = smartModelAns.selection || availableModelChoices[0].value;

    const newConfig = {
      default_model: defaultModelVal.model,
      tiers: {
        fast: {
          provider: fastModelVal.provider,
          model: fastModelVal.model,
          reasoningEffort: "medium"
        },
        smart: {
          provider: smartModelVal.provider,
          model: smartModelVal.model,
          reasoningEffort: "high"
        },
        reasoning: {
          provider: smartModelVal.provider,
          model: smartModelVal.model,
          reasoningEffort: "high"
        }
      },
      providers: configuredProvidersConfig
    };

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    console.log(chalk.green("✔ Saved mcp-servers/model-router/config.json"));
  }

  // Write .env
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
