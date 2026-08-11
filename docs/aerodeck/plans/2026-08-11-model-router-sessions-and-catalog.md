# AeroDeck Model Router Sessions, Popular Providers & Live Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use aerodeck:subagent-driven-task-pipeline (recommended) or aerodeck:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul AeroDeck's setup wizard to support popular providers (from `hermes_cli/models.py`), live base URL model querying (`${baseURL}/models`), custom endpoints, interactive reasoning effort selection, multi-model profile assignment, and session history persistence in `model-router`.

**Architecture/Workflow:** Operational Configuration B (Modular setup CLI wizard with live HTTP endpoint model resolution, custom endpoint base URLs, persistent JSON session history store, and TDD unit tests).

**Tech Stack/Tools:** TypeScript, Node.js (ESM), `prompts`, `chalk`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, Jest / `ts-jest`.

---

### Task 1: Popular Provider Catalog & Live Base URL Fetcher

**Targets:**
- Modify: `scripts/setup/src/catalog.ts`
- Modify: `scripts/setup/tests/catalog.test.ts`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-1-session-criteria.json`:
```json
{
  "criteria": "catalog.ts exports CANONICAL_PROVIDERS list matching hermes_cli/models.py, and fetchLiveModels(baseURL, apiKey) queries ${baseURL}/models dynamically with a 3s timeout and falls back seamlessly to static catalog."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `npm --prefix scripts/setup test`
Expected: FAIL (fetchLiveModels and CANONICAL_PROVIDERS missing)

- [ ] **Step 3: Perform minimal implementation**
1. Add `CANONICAL_PROVIDERS` array and default base URL dictionary to `scripts/setup/src/catalog.ts`.
2. Implement `fetchLiveModels(baseURL: string, apiKey?: string): Promise<CatalogModel[]>` querying `${baseURL.replace(/\/$/, '')}/models` via HTTP `fetch` with a 3-second timeout and parsing `{ data: [{ id: "..." }] }`.
3. Add unit tests in `scripts/setup/tests/catalog.test.ts`.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm --prefix scripts/setup test`
Expected: PASS (All catalog normalization and live fetcher tests pass green).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 1 changes to git repository.

---

### Task 2: Multi-Model Interactive Setup Wizard (`setup-models.ts`)

**Targets:**
- Modify: `scripts/setup/src/setup-models.ts`
- Modify: `scripts/setup/tests/setup-models.test.ts`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-2-session-criteria.json`:
```json
{
  "criteria": "setup-models.ts supports custom endpoints, queries base URL for models, prompts for reasoning effort (none|low|medium|high), assigns models to profiles (default, fast, smart, reasoning), and loops for multiple model configurations."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run `npm run setup:models`
Expected: Currently asks multi-select providers without base URL override, live querying, or reasoning effort loop.

- [ ] **Step 3: Perform minimal implementation**
1. Update `setup-models.ts` to implement a configuration loop:
   - Provider selection (popular list or Custom Endpoint)
   - Base URL input / override
   - Model selection (live fetched from `${baseURL}/models` or static catalog or manual input)
   - Reasoning effort selection (`none`, `low`, `medium`, `high`)
   - API key entry
   - Profile assignment (`default`, `fast`, `smart`, `reasoning`)
   - Loop prompt: *"Configure another model?"*
2. Save secrets to `mcp-servers/model-router/.env` and provider endpoints, models, reasoning efforts, and profile mappings to `mcp-servers/model-router/config.json`.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm --prefix scripts/setup test`
Expected: PASS (Setup wizard tests pass green).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 2 changes to git repository.

---

### Task 3: Multi-Provider & Custom Base URL Model Router Engine

**Targets:**
- Modify: `mcp-servers/model-router/src/index.ts`
- Modify: `mcp-servers/model-router/config.json`
- Modify: `mcp-servers/model-router/tests/router.test.ts`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-3-session-criteria.json`:
```json
{
  "criteria": "model-router src/index.ts dynamically resolves custom base URLs, custom model IDs, and reasoning effort parameters for any configured provider or profile."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Inspect `mcp-servers/model-router/src/index.ts`: check for dynamic custom endpoint and reasoning effort support.

- [ ] **Step 3: Perform minimal implementation**
Update `mcp-servers/model-router/src/index.ts` to instantiate OpenAI-compatible provider instances with custom `baseURL`s and headers, applying `reasoningEffort` when specified.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm --prefix mcp-servers/model-router test`
Expected: PASS (Model router unit tests pass green).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 3 changes to git repository.

---

### Task 4: Session History Persistence & Context Engine (`model-router`)

**Targets:**
- Create: `mcp-servers/model-router/src/session.ts`
- Modify: `mcp-servers/model-router/src/index.ts`
- Create: `mcp-servers/model-router/tests/session.test.ts`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-4-session-criteria.json`:
```json
{
  "criteria": "session.ts maintains conversation history per session_id, persists to sessions.json, trims history to max turns, and clear_session clears session history."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run: `npm --prefix mcp-servers/model-router test`
Expected: Session persistence tests missing.

- [ ] **Step 3: Perform minimal implementation**
1. Implement `mcp-servers/model-router/src/session.ts`:
   - `getSessionHistory(sessionId: string): Message[]`
   - `appendSessionTurn(sessionId: string, userPrompt: string, assistantReply: string): void`
   - `resetSession(sessionId: string): void`
   - `trimContextHistory(messages: Message[], maxMessages: number): Message[]`
   - Atomic write to `mcp-servers/model-router/sessions.json`.
2. Update `route_task` tool handler in `index.ts` to pass accumulated session context to model generation.
3. Add `clear_session` tool to `setupServer()`.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm --prefix mcp-servers/model-router test`
Expected: PASS (All session unit tests pass green).

- [ ] **Step 5: Save/Checkpoint**
Commit Task 4 changes to git repository.

---

### Task 5: Full Integration & System Test Suite

**Targets:**
- Modify: `task.md`
- Run: `npm test`

- [ ] **Step 1: Write success criteria**
Create criteria file `docs/aerodeck/criteria/task-5-session-criteria.json`:
```json
{
  "criteria": "All unit tests across browser-automation, model-router, google-drive, setup-wizard, and telegram-bridge pass green."
}
```

- [ ] **Step 2: Verify current state fails/lacks criteria**
Run `npm test`
Expected: Verify test pass rates across all packages.

- [ ] **Step 3: Perform minimal implementation**
Fix any build warnings or test errors.

- [ ] **Step 4: Verify state passes criteria**
Run: `npm test`
Expected: PASS (All test suites green).

- [ ] **Step 5: Save/Checkpoint**
Commit all changes to git repository.
