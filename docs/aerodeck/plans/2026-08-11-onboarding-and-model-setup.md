# AeroDeck Onboarding, Installation & Model Setup Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine AeroDeck's onboarding documentation (`README.md`), integrate dynamic Hermes Model Catalog support into `npm run setup` & `npm run setup:models`, and automate Google Workspace / Google Drive OAuth configuration via `npm run setup:google`.

**Architecture/Workflow:** Operational Configuration B (Modular Setup Engine with standalone CLI re-configuration commands, dynamic LLM provider routing via `model-router`, and automated Google OAuth local server callback).

**Tech Stack/Tools:** TypeScript, Node.js (ESM), `prompts`, `chalk`, `googleapis`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, PowerShell / Shell scripts.

---

### Task 1: Hermes Model Catalog Fetcher & Offline Snapshot

**Targets:**
- Create: `scripts/setup/model-catalog.json`
- Create: `scripts/setup/src/catalog.ts`
- Modify: `scripts/setup/src/validators.ts`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-1-criteria.json`:
```json
{
  "criteria": "catalog.ts exports fetchModelCatalog() which attempts online fetch from https://nousresearch.github.io/hermes-agent/docs/api/model-catalog.json with a 5s timeout and falls back seamlessly to offline model-catalog.json snapshot."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `node -e "import('./scripts/setup/src/catalog.ts')"`
Expected: FAIL (File missing)

- [ ] **Step 3: Perform minimal implementation**
1. Create `scripts/setup/model-catalog.json` containing the fallback snapshot of Hermes model catalog (OpenAI, Anthropic, DeepSeek, Minimax, OpenRouter, Groq, Together, Ollama, Kimi/Moonshot).
2. Create `scripts/setup/src/catalog.ts`:
```typescript
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
      if (data && data.providers) {
        return data as ModelCatalog;
      }
    }
  } catch (err) {
    // Fallback to offline catalog
  }

  const localCatalogPath = path.resolve(__dirname, "../model-catalog.json");
  if (fs.existsSync(localCatalogPath)) {
    return JSON.parse(fs.readFileSync(localCatalogPath, "utf-8"));
  }

  throw new Error("Unable to load model catalog online or from local snapshot.");
}
```

- [ ] **Step 4: Verify state passes criteria**
Run: `npm run --prefix scripts/setup build && node -e "import('./scripts/setup/dist/catalog.js').then(m => m.fetchModelCatalog()).then(c => console.log('Catalog loaded:', Object.keys(c.providers)))"`
Expected: PASS (Prints list of providers loaded from online/fallback catalog)

- [ ] **Step 5: Save/Checkpoint**
Commit Task 1 changes to git repository.

---

### Task 2: Multi-Provider Model Router Engine Upgrade

**Targets:**
- Modify: `mcp-servers/model-router/src/index.ts`
- Modify: `mcp-servers/model-router/config.json`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-2-criteria.json`:
```json
{
  "criteria": "model-router/src/index.ts dynamically instantiates AI SDK models for any provider configured in config.json (including OpenAI, Anthropic, Google, and custom OpenAI-compatible endpoints) and routes route_task requests."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Inspect `mcp-servers/model-router/src/index.ts`: currently hardcoded strictly to deepseek and minimax.
Expected: Needs generalized provider routing.

- [ ] **Step 3: Perform minimal implementation**
Update `mcp-servers/model-router/src/index.ts` to dynamically inspect `routerConfig.providers[providerName]`, check `process.env[apiKeyEnv]`, and instantiate the proper `@ai-sdk` provider (OpenAI compatible `createOpenAI({ baseURL, apiKey })`, Anthropic, Google AI, etc.).

- [ ] **Step 4: Verify state passes criteria**
Run: `npm run --prefix mcp-servers/model-router build && node mcp-servers/model-router/dist/index.js --test`
Expected: PASS (Server compiles and runs without schema errors).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 2 changes to git repository.

---

### Task 3: Interactive Model Setup Wizard (`npm run setup:models`)

**Targets:**
- Create: `scripts/setup/src/setup-models.ts`
- Modify: `package.json`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-3-criteria.json`:
```json
{
  "criteria": "setup-models.ts prompts for provider choices from catalog, asks for API keys, sets model tiers (fast, smart, reasoning, default_model), writes secrets to model-router/.env and endpoints to config.json."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `npm run setup:models`
Expected: FAIL (Script does not exist yet)

- [ ] **Step 3: Perform minimal implementation**
1. Implement `scripts/setup/src/setup-models.ts` using `prompts` and `catalog.ts`.
2. Add script `"setup:models": "npm --prefix scripts/setup install && npm --prefix scripts/setup run build && node scripts/setup/dist/setup-models.js"` to root `package.json` and `scripts/setup/package.json`.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm run setup:models` (or test with dry-run mode).
Expected: PASS (Interactive CLI wizard runs smoothly, presenting providers and model selection).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 3 changes to git repository.

---

### Task 4: Automated Google Workspace & Drive Setup (`npm run setup:google`)

**Targets:**
- Create: `scripts/setup/src/setup-google.ts`
- Modify: `package.json`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-4-criteria.json`:
```json
{
  "criteria": "setup-google.ts supports GCP credentials.json import or manual Client ID/Secret input, spins up http://localhost:3000/oauth2callback, acquires token.json, and writes google-drive/.env."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `npm run setup:google`
Expected: FAIL (Script missing)

- [ ] **Step 3: Perform minimal implementation**
1. Implement `scripts/setup/src/setup-google.ts` supporting `credentials.json` path parsing or manual Client ID & Secret entry, local HTTP server OAuth code exchange, `token.json` creation, and `.env` updating.
2. Add script `"setup:google": "npm --prefix scripts/setup install && npm --prefix scripts/setup run build && node scripts/setup/dist/setup-google.js"` to root `package.json` and `scripts/setup/package.json`.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm run setup:google -- --help` / dry-run check.
Expected: PASS (Script initializes and checks local environment).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 4 changes to git repository.

---

### Task 5: Refine Main Setup Wizard & Package Scripts

**Targets:**
- Modify: `scripts/setup/src/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-5-criteria.json`:
```json
{
  "criteria": "npm run setup cleanly runs setup-models, setup-google, system diagnostics, and MCP registration."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run `npm run setup`
Expected: Currently asks hardcoded Kimi & Minimax keys.

- [ ] **Step 3: Perform minimal implementation**
Update `scripts/setup/src/index.ts` to call `setupModels()` and `setupGoogle()` modularly while preserving overall diagnostic checks and MCP server registration (`install.ps1` / `register-unix.js`).

- [ ] **Step 4: Verify state passes criteria**
Run: `npm run setup`
Expected: PASS (Main wizard guides user through Model setup, Google setup, and MCP registration).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 5 changes to git repository.

---

### Task 6: Overhaul README.md & Google Drive Documentation

**Targets:**
- Modify: `README.md`
- Modify: `mcp-servers/google-drive/README.md`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-6-criteria.json`:
```json
{
  "criteria": "README.md explicitly outlines Prerequisites, Necessary vs Optional component matrix, Installation commands per platform, and Reconfiguration commands."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Inspect `README.md`: Starts with Quickstart without prerequisites or component matrix.
Expected: Needs restructuring.

- [ ] **Step 3: Perform minimal implementation**
Restructure `README.md` and `mcp-servers/google-drive/README.md` according to Section 2 of the design specification, adding complete platform commands, component matrix, and setup instructions.

- [ ] **Step 4: Verify state passes criteria**
Inspect `README.md` markdown render.
Expected: PASS (Clean, professional, intuitive onboarding documentation).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 6 changes to git repository.

---

### Task 7: Comprehensive Verification & Diagnostics

**Targets:**
- Run: `npm test`
- Run: `install.ps1` / `register-unix.js`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-7-criteria.json`:
```json
{
  "criteria": "All unit tests pass and MCP servers register cleanly in mcp_config.json."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `npm test`
Expected: Verify test pass rates.

- [ ] **Step 3: Perform minimal implementation**
Fix any lingering TypeScript or build errors in `scripts/setup` or `mcp-servers`.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm test` and check `mcp_config.json`.
Expected: PASS (All tests green, servers registered).

- [ ] **Step 5: Save/Checkpoint**
Commit all remaining changes.
